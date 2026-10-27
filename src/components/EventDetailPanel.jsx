import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { openModal } from '../store/slices/uiSlice'
import { deleteEvent, registerForEvent, cancelRegistration, decrementRegisteredCount } from '../store/slices/eventsSlice'
import { removeRegistration, removeRegistrationByEventAndRegNo, selectMyRegistrations, confirmRegistration } from '../store/slices/registrationsSlice'
import { toast } from '../store/slices/toastSlice'
import { getEventParticipants } from '../utils/registrations'
import ConfirmDialog from './ConfirmDialog'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCalendarDay, faClock, faLocationDot, faHourglassEnd, faUsers, faPen, faTrash, faMasksTheater, faPersonRunning, faLaptopCode, faIcons, faXmark, faSeedling, faPalette, faMusic, faTrophy, faMicrophone, faPersonDress, faDrum, faClapperboard, faStar, faLaptop, faDesktop, faBook, faCheck, faScaleBalanced } from '@fortawesome/free-solid-svg-icons'

const ICON_MAP = {
  faIcons, faSeedling, faPersonRunning, faMasksTheater, faPalette, faMusic, faTrophy, faMicrophone, faPersonDress, faDrum, faClapperboard, faStar, faLaptop, faDesktop, faBook
}
import s from './EventDetailPanel.module.css'

const CATEGORY_ICONS = {
  Festival: <FontAwesomeIcon icon={faIcons} />,
  Sports:   <FontAwesomeIcon icon={faPersonRunning} />,
  Cultural: <FontAwesomeIcon icon={faMasksTheater} />,
  Technical:<FontAwesomeIcon icon={faLaptopCode} />,
}

export default function EventDetailPanel({ event, onClose, isAdmin }) {
  const dispatch = useDispatch()
  const myRegistrations = useSelector(selectMyRegistrations)
  const registrations = useSelector(st => st.registrations.list)
  const allJudges = useSelector(st => st.judges?.list || [])
  const authUser = useSelector(st => st.auth.user)
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false)
  const [removeTarget, setRemoveTarget] = React.useState(null)

  if (!event) return null

  const isRegistered = myRegistrations.some(r => r.eventId === event.id)
  const pct = Math.round((event.registered / event.maxParticipants) * 100)
  const participants = getEventParticipants(event, registrations)
  const assignedJudges = allJudges.filter(j => j.assignedEvents?.includes(event.id))

  const STATUS_COLORS = {
    open:     'var(--green)',
    upcoming: 'var(--blue)',
    planning: 'var(--purple)',
    closed:   'var(--muted)',
  }

  function handleDelete() {
    dispatch(deleteEvent(event.id))
    dispatch(toast.success(`"${event.name}" deleted.`))
    setShowDeleteConfirm(false)
    onClose()
  }

  function handleRegister() {
    dispatch(openModal({
      type: 'register',
      payload: { eventId: event.id, name: event.name, subCategories: event.subCategories },
    }))
    onClose()
  }

  function handleCancel() {
    dispatch(cancelRegistration(event.id))
    
    const myReg = myRegistrations.find(r => r.eventId === event.id)
    if (myReg) {
      dispatch(removeRegistration(myReg.id))
    } else if (authUser?.regNo) {
      dispatch(removeRegistrationByEventAndRegNo({ eventId: event.id, regNo: authUser.regNo }))
    }
    
    dispatch(toast.info('Registration cancelled.'))
    onClose()
  }

  function handleRemoveParticipant() {
    if (!removeTarget) return
    dispatch(removeRegistration(removeTarget.id))
    dispatch(decrementRegisteredCount(event.id))
    dispatch(toast.info(`${removeTarget.name} removed from this event.`))
    setRemoveTarget(null)
  }

  return (
    <>
      <div className={s.backdrop} onClick={onClose} />
      <div className={s.panel}>

        {/* Header poster */}
        <div
          className={s.poster}
          style={{ background: `linear-gradient(160deg, ${event.accentColor}20 0%, ${event.accentColor}08 100%)` }}
        >
          <button className={s.closeBtn} onClick={onClose}><FontAwesomeIcon icon={faXmark} /></button>
          <div className={s.posterEmoji}
            style={{ filter: `drop-shadow(0 0 24px ${event.accentColor}88)` }}
          >
            {event.emoji && ICON_MAP[event.emoji] 
              ? <FontAwesomeIcon icon={ICON_MAP[event.emoji]} />
              : CATEGORY_ICONS[event.category] || <FontAwesomeIcon icon={faIcons} />}
          </div>
          <div
            className={s.accentBar}
            style={{ background: `linear-gradient(90deg, ${event.accentColor}, transparent)` }}
          />
        </div>

        {/* Body */}
        <div className={s.body}>
          <div className={s.titleRow}>
            <div>
              <h2 className={s.title}>{event.name}</h2>
              <div className={s.categoryRow}>
                <span className={s.categoryChip}>{event.category}</span>
                <span
                  className={s.statusChip}
                  style={{ color: STATUS_COLORS[event.status] || 'var(--muted)' }}
                >
                  <span className={s.statusDot}
                    style={{ background: STATUS_COLORS[event.status] || 'var(--muted)' }}
                  />
                  {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                </span>
              </div>
            </div>
          </div>

          <div className={s.goldDivider} />

          {/* Meta grid */}
          <div className={s.metaGrid}>
            <div className={s.metaCard}>
              <span className={s.metaIcon} style={{ color: event.accentColor }}><FontAwesomeIcon icon={faCalendarDay} /></span>
              <div>
                <div className={s.metaLabel}>Date</div>
                <div className={s.metaValue}>
                  {new Date(event.date + 'T00:00:00').toLocaleDateString('en-IN', {
                    weekday: 'short', day: 'numeric', month: 'long', year: 'numeric'
                  })}
                </div>
              </div>
            </div>
            <div className={s.metaCard}>
              <span className={s.metaIcon} style={{ color: event.accentColor }}><FontAwesomeIcon icon={faClock} /></span>
              <div>
                <div className={s.metaLabel}>Time</div>
                <div className={s.metaValue}>{event.time}</div>
              </div>
            </div>
            <div className={s.metaCard} style={{ gridColumn: '1/-1' }}>
              <span className={s.metaIcon} style={{ color: event.accentColor }}><FontAwesomeIcon icon={faLocationDot} /></span>
              <div>
                <div className={s.metaLabel}>Venue</div>
                <div className={s.metaValue}>{event.venue}</div>
              </div>
            </div>
            <div className={s.metaCard}>
              <span className={s.metaIcon} style={{ color: event.accentColor }}><FontAwesomeIcon icon={faHourglassEnd} /></span>
              <div>
                <div className={s.metaLabel}>Registration Deadline</div>
                <div className={s.metaValue}>{event.deadline}</div>
              </div>
            </div>
            <div className={s.metaCard}>
              <span className={s.metaIcon} style={{ color: event.accentColor }}><FontAwesomeIcon icon={faUsers} /></span>
              <div>
                <div className={s.metaLabel}>Max Participants</div>
                <div className={s.metaValue}>{event.maxParticipants}</div>
              </div>
            </div>
            <div className={s.metaCard}>
              <span className={s.metaIcon} style={{ color: event.accentColor }}><FontAwesomeIcon icon={faCheck} /></span>
              <div>
                <div className={s.metaLabel}>Registration Fee</div>
                <div className={s.metaValue}>₹{event.registrationFee || 50}</div>
              </div>
            </div>
          </div>

          {/* Competitions */}
          <div className={s.section}>
            <div className={s.sectionLabel}>Competitions</div>
            <div className={s.compTags}>
              {event.subCategories.map(sc => (
                <span
                  key={sc}
                  className={s.compTag}
                  style={{ borderColor: event.accentColor + '44', color: event.accentColor }}
                >
                  {sc}
                </span>
              ))}
            </div>
          </div>

          {/* Registration progress */}
          <div className={s.section}>
            <div className={s.sectionLabel}>Registration Status</div>
            <div className={s.progressInfo}>
              <span className={s.progressText}>
                <strong style={{ color: event.accentColor }}>{event.registered}</strong>
                <span style={{ color: 'var(--muted)' }}> / {event.maxParticipants} registered</span>
              </span>
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>{pct}% full</span>
            </div>
            <div className={s.progressTrack}>
              <div
                className={s.progressFill}
                style={{
                  width: `${pct}%`,
                  background: `linear-gradient(90deg, ${event.accentColor}88, ${event.accentColor})`,
                }}
              />
            </div>
          </div>

          {/* Participants — who is actually registered, by name + department */}
          <div className={s.section}>
            <div className={s.participantsHead}>
              <div className={s.sectionLabel} style={{ marginBottom: 0 }}>
                Participants ({participants.length})
              </div>
              {isAdmin && (
                <button
                  className={s.addParticipantBtn}
                  onClick={() => dispatch(openModal({ type: 'addParticipant', payload: event }))}
                >
                  + Add
                </button>
              )}
            </div>

            {participants.length === 0 ? (
              <p className={s.noParticipants}>No one has registered yet.</p>
            ) : (
              <div className={s.participantList}>
                {participants.map(p => (
                  <div key={p.id} className={s.participantRow}>
                    <div
                      className={s.pAvatar}
                      style={{ background: event.accentColor + '22', color: event.accentColor }}
                    >
                      {p.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                    </div>
                    <div className={s.pInfo}>
                      <div className={s.pName}>{p.name}</div>
                      <div className={s.pMeta}>{p.regNo} · {p.department}</div>
                    </div>
                    <span className={s.pSubCat} style={{ color: event.accentColor, borderColor: event.accentColor + '44' }}>
                      {p.subCategory}
                    </span>
                    {isAdmin && (
                      <div className={s.pActions}>
                        {p.status === 'pending' && (
                          <button
                            className={s.pConfirmBtn}
                            title="Confirm registration (Allocate Token)"
                            onClick={() => {
                              dispatch(openModal({ type: 'allocateToken', payload: { registration: p, event } }))
                            }}
                          >
                            <FontAwesomeIcon icon={faCheck} />
                          </button>
                        )}
                        <button
                          className={s.pRemoveBtn}
                          title="Remove participant"
                          onClick={() => setRemoveTarget(p)}
                        >
                          <FontAwesomeIcon icon={faXmark} />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Assigned Judges */}
          {isAdmin && (
            <div className={s.section}>
              <div className={s.participantsHead}>
                <div className={s.sectionLabel} style={{ marginBottom: 0 }}>
                  Assigned Judges ({assignedJudges.length})
                </div>
                <button
                  className={s.addParticipantBtn}
                  onClick={() => dispatch(openModal({ type: 'assignJudgesToEvent', payload: event }))}
                >
                  + Assign Judge
                </button>
              </div>

              {assignedJudges.length === 0 ? (
                <p className={s.noParticipants}>No judges assigned yet.</p>
              ) : (
                <div className={s.participantList}>
                  {assignedJudges.map(j => (
                    <div key={j.id} className={s.participantRow}>
                      <div
                        className={s.pAvatar}
                        style={{ background: 'var(--gold-bg)', color: 'var(--gold)' }}
                      >
                        <FontAwesomeIcon icon={faScaleBalanced} />
                      </div>
                      <div className={s.pInfo}>
                        <div className={s.pName}>{j.name}</div>
                        <div className={s.pMeta}>{j.expertise}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* Action buttons */}
          <div className={s.actions}>
            {!isAdmin && (
              isRegistered ? (
                <button className={s.cancelRegBtn} onClick={handleCancel}>
                  <FontAwesomeIcon icon={faXmark} style={{ marginRight: '6px' }} /> Cancel Registration
                </button>
              ) : (
                <button
                  className={s.registerBtn}
                  style={{
                    background: `linear-gradient(135deg, ${event.accentColor}cc, ${event.accentColor})`,
                    boxShadow: `0 4px 20px ${event.accentColor}40`,
                  }}
                  onClick={handleRegister}
                >
                  Register for this Event →
                </button>
              )
            )}

            {isAdmin && (
              <div className={s.adminActions}>
                <button
                  className={s.editBtn}
                  onClick={() => {
                    dispatch(openModal({ type: 'addEvent', payload: event }))
                    onClose()
                  }}
                >
                  <FontAwesomeIcon icon={faPen} style={{ marginRight: '6px' }} /> Edit
                </button>
                <button className={s.deleteBtn} onClick={() => setShowDeleteConfirm(true)}>
                  <FontAwesomeIcon icon={faTrash} style={{ marginRight: '6px' }} /> Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={showDeleteConfirm}
        title="Delete Event?"
        message={`This will permanently delete "${event.name}" and all associated registrations. This cannot be undone.`}
        confirmLabel="Delete Event"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />

      <ConfirmDialog
        open={!!removeTarget}
        title="Remove Participant?"
        message={`Remove ${removeTarget?.name} from "${event.name}" (${removeTarget?.subCategory})?`}
        confirmLabel="Remove"
        variant="danger"
        onConfirm={handleRemoveParticipant}
        onCancel={() => setRemoveTarget(null)}
      />
    </>
  )
}
