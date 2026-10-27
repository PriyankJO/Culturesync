import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { cancelRegistration } from '../store/slices/eventsSlice'
import { removeRegistrationByEventAndRegNo, selectMyRegistrations } from '../store/slices/registrationsSlice'
import { openModal } from '../store/slices/uiSlice'
import usePageTitle from '../hooks/usePageTitle'
import ConfirmDialog from '../components/ConfirmDialog'
import EventDetailPanel from '../components/EventDetailPanel'
import { motion, AnimatePresence } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClipboardList, faEye, faXmark, faIcons, faMasksTheater, faPersonRunning, faLaptopCode, faPrint, faTicket } from '@fortawesome/free-solid-svg-icons'
import s from './MyRegistrations.module.css'

const CATEGORY_ICONS = {
  Festival: <FontAwesomeIcon icon={faIcons} />,
  Sports:   <FontAwesomeIcon icon={faPersonRunning} />,
  Cultural: <FontAwesomeIcon icon={faMasksTheater} />,
  Technical:<FontAwesomeIcon icon={faLaptopCode} />,
}

export default function MyRegistrations() {
  usePageTitle('My Registrations')
  const dispatch = useDispatch()
  const { list } = useSelector(st => st.events)
  const myRegistrations = useSelector(selectMyRegistrations)
  const user = useSelector(st => st.auth.user)
  const role = useSelector(st => st.auth.role)

  const [confirmId, setConfirmId] = useState(null)   // eventId pending cancel confirmation
  const [viewEvent, setViewEvent] = useState(null)   // event currently shown in detail panel

  const enriched = myRegistrations
    .map(r => ({ ...r, event: list.find(e => e.id === r.eventId) }))
    .filter(r => r.event)

  const pendingEvent = enriched.find(r => r.eventId === confirmId)

  function handleCancelConfirm() {
    dispatch(cancelRegistration(confirmId))
    if (user?.regNo) {
      dispatch(removeRegistrationByEventAndRegNo({ eventId: confirmId, regNo: user.regNo }))
    }
    dispatch(toast.info('Registration cancelled.'))
    setConfirmId(null)
  }

  return (
    <div className={`${s.page} page-enter`}>

      {/* User info banner */}
      <div className={s.userBanner}>
        <div className={s.userAvatar}>{user?.initials}</div>
        <div>
          <div className={s.userName}>{user?.name}</div>
          <div className={s.userMeta}>{user?.regNo} · {user?.department}</div>
        </div>
        <div className={s.userStats}>
          <div className={s.userStat}>
            <div className={s.userStatNum}>{enriched.length}</div>
            <div className={s.userStatLabel}>Registered</div>
          </div>
          <div className={s.userStat}>
            <div className={s.userStatNum}>{enriched.filter(r => r.status === 'confirmed').length}</div>
            <div className={s.userStatLabel}>Confirmed</div>
          </div>
          <div className={s.userStat}>
            <div className={s.userStatNum}>{enriched.filter(r => r.status === 'pending').length}</div>
            <div className={s.userStatLabel}>Pending</div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className={s.tableWrap}>
        {enriched.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={s.empty}>
            <span style={{ fontSize: '32px', color: 'var(--gold)' }}><FontAwesomeIcon icon={faClipboardList} /></span>
            <p style={{ marginTop: '12px' }}>No registrations yet.</p>
            <p className={s.emptySub}>Head to Events to register for upcoming events!</p>
          </motion.div>
        ) : (
          <div className={s.ticketGrid}>
            <AnimatePresence>
              {enriched.map((r, i) => (
                <motion.div 
                  key={r.id || i}
                  className={s.ticketCard}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0, transition: { type: 'spring', damping: 20, delay: i * 0.05 } }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <div className={s.ticketHeader} style={{ borderTopColor: r.event.accentColor }}>
                    <div className={s.ticketEventName}>
                      <span className={s.eventEmoji} style={{ color: r.event.accentColor }}>
                        {CATEGORY_ICONS[r.event.category] || <FontAwesomeIcon icon={faIcons} />}
                      </span>
                      {r.event.name}
                    </div>
                    <span className={s.ticketToken}>
                      {r.status === 'confirmed' ? (r.tokenNumber || 'TKN-ALLOC') : 'Pending Admin Confirmation'}
                    </span>
                  </div>
                  
                  <div className={s.ticketBody}>
                    <div className={s.ticketSubCategory}>{r.subCategory}</div>
                    
                    <div className={s.ticketDetailRow}>
                      <strong>Date & Time:</strong>
                      <span>
                        {r.status === 'confirmed' ? (
                          <>
                            {new Date((r.allocatedDate || r.event.date) + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            {' · '}{(r.allocatedTime || r.event.time)}
                          </>
                        ) : 'Will be allocated upon confirmation'}
                      </span>
                    </div>
                    
                    <div className={s.ticketDetailRow}>
                      <strong>Venue:</strong>
                      <span>{r.status === 'confirmed' ? (r.allocatedVenue || r.event.venue) : 'Will be allocated upon confirmation'}</span>
                    </div>

                    <div className={s.ticketDetailRow}>
                      <strong>Payment:</strong>
                      <span>₹{r.paymentAmount || (r.teamMembers?.length > 0 ? 150 : 50)} {r.paymentId ? `(Txn: ${r.paymentId})` : ''}</span>
                    </div>

                    {r.teamMembers && r.teamMembers.length > 0 && (
                      <div className={s.ticketDetailRow}>
                        <strong>Team Members:</strong>
                        <span>{r.teamMembers.join(', ')}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className={s.ticketFooter} style={{ flexWrap: 'wrap', gap: '12px' }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <span className={r.status === 'confirmed' ? `${s.statusBadge} ${s.confirmed}` : `${s.statusBadge} ${s.pending}`}>
                        <span className={s.statusDot} />
                        {r.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                      </span>
                      {r.status === 'confirmed' && (
                        <span className={r.paymentStatus === 'paid' ? `${s.statusBadge} ${s.confirmed}` : `${s.statusBadge} ${s.pending}`}>
                          <span className={s.statusDot} style={{ background: r.paymentStatus === 'paid' ? 'var(--green)' : 'var(--orange)' }}/>
                          {r.paymentStatus === 'paid' ? 'Paid' : 'Unpaid'}
                        </span>
                      )}
                    </div>
                    
                    <div className={s.ticketActions} style={{ flexWrap: 'wrap' }}>
                      {r.status === 'confirmed' && r.paymentStatus === 'paid' && (
                        <button 
                          className={`${s.actionBtn} ${s.printBtn}`} 
                          title="Print Ticket" 
                          onClick={() => window.print()}
                        >
                          <FontAwesomeIcon icon={faPrint} /> Print
                        </button>
                      )}
                      {r.status === 'confirmed' ? (
                        <>
                          {r.paymentStatus !== 'paid' ? (
                            <button
                              className={`${s.actionBtn} ${s.viewBtn}`}
                              style={{ background: 'var(--blue)', color: 'white', borderColor: 'var(--blue)', fontWeight: 'bold' }}
                              title="Pay Registration Fee"
                              onClick={() => dispatch(openModal({ type: 'payment', payload: { registration: r, event: r.event } }))}
                            >
                              <FontAwesomeIcon icon={faTicket} /> Pay ₹{r.event.registrationFee || 50} Now
                            </button>
                          ) : (
                            <button
                              className={`${s.actionBtn} ${s.viewBtn}`}
                              style={{ background: 'var(--gold-bg)', borderColor: 'var(--gold)' }}
                              title="View Ticket"
                              onClick={() => dispatch(openModal({ type: 'viewTicket', payload: r }))}
                            >
                              <FontAwesomeIcon icon={faTicket} /> {r.tokenNumber}
                            </button>
                          )}
                        </>
                      ) : (
                        <button
                          className={`${s.actionBtn} ${s.viewBtn}`}
                          title="View details"
                          onClick={() => setViewEvent(r.event)}
                        >
                          <FontAwesomeIcon icon={faEye} /> View
                        </button>
                      )}
                      {r.status === 'pending' && (
                        <button
                          className={`${s.actionBtn} ${s.cancelBtn}`}
                          title="Cancel registration"
                          onClick={() => setConfirmId(r.eventId)}
                        >
                          <FontAwesomeIcon icon={faXmark} />
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Event detail panel */}
      {viewEvent && (
        <EventDetailPanel
          event={viewEvent}
          onClose={() => setViewEvent(null)}
          isAdmin={role === 'admin'}
        />
      )}

      {/* Cancel confirmation dialog */}
      <ConfirmDialog
        open={!!confirmId}
        title="Cancel Registration?"
        message={`Are you sure you want to cancel your registration for "${pendingEvent?.event?.name}"? This cannot be undone.`}
        confirmLabel="Yes, Cancel It"
        variant="danger"
        onConfirm={handleCancelConfirm}
        onCancel={() => setConfirmId(null)}
      />
    </div>
  )
}
