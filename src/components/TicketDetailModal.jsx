import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { closeModal } from '../store/slices/uiSlice'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark, faTicket, faLocationDot, faClock, faCalendarDay, faGavel } from '@fortawesome/free-solid-svg-icons'
import { selectJudgesForEvent } from '../store/slices/judgesSlice'
import { motion, AnimatePresence } from 'framer-motion'
import s from './TicketDetailModal.module.css'

export default function TicketDetailModal({ payload }) {
  const dispatch = useDispatch()
  const reg = payload
  const judges = useSelector(st => selectJudgesForEvent(st, reg.eventId))

  return (
    <div className={s.overlay} onClick={() => dispatch(closeModal())}>
      <motion.div 
        className={s.modal} 
        onClick={e => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      >
        <div className={s.header}>
          <h2>Official Entry Ticket</h2>
          <button className={s.closeBtn} onClick={() => dispatch(closeModal())} type="button">
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        <div className={s.body}>
          <div className={s.ticketTop}>
            <div className={s.eventName}>{reg.event?.name || 'Event'}</div>
            <div className={s.subCategory}>{reg.subCategory}</div>
          </div>
          
          <div className={s.tokenBox}>
            <div className={s.tokenLabel}>TOKEN NUMBER</div>
            <div className={s.tokenValue}>
              <FontAwesomeIcon icon={faTicket} style={{ marginRight: '10px', color: 'var(--gold)' }} />
              {reg.tokenNumber}
            </div>
          </div>

          <div className={s.metaGrid}>
            <div className={s.metaCard}>
              <FontAwesomeIcon icon={faCalendarDay} className={s.metaIcon} />
              <div>
                <div className={s.metaLabel}>Date</div>
                <div className={s.metaValue}>
                  {new Date((reg.allocatedDate || reg.event?.date) + 'T00:00:00').toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'short', year: 'numeric'
                  })}
                </div>
              </div>
            </div>
            
            <div className={s.metaCard}>
              <FontAwesomeIcon icon={faClock} className={s.metaIcon} />
              <div>
                <div className={s.metaLabel}>Time</div>
                <div className={s.metaValue}>{reg.allocatedTime || reg.event?.time}</div>
              </div>
            </div>

            <div className={s.metaCard} style={{ gridColumn: '1 / -1' }}>
              <FontAwesomeIcon icon={faLocationDot} className={s.metaIcon} />
              <div>
                <div className={s.metaLabel}>Reporting Venue</div>
                <div className={s.metaValue}>{reg.allocatedVenue || reg.event?.venue}</div>
              </div>
            </div>
          </div>

          <div className={s.judgesSection}>
            <div className={s.sectionLabel}>
              <FontAwesomeIcon icon={faGavel} style={{ marginRight: '8px' }} /> Assigned Judges
            </div>
            {judges.length > 0 ? (
              <div className={s.judgesList}>
                {judges.map(j => (
                  <div key={j.id} className={s.judgeItem}>
                    <div className={s.judgeAvatar}>{j.name.charAt(0)}</div>
                    <div>
                      <div className={s.judgeName}>{j.name}</div>
                      <div className={s.judgeRole}>{j.role || 'Judge'}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className={s.noJudges}>No judges assigned yet.</p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
