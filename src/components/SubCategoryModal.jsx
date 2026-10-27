import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { openModal } from '../store/slices/uiSlice'
import modalStyles from './Modal.module.css'
import { buildSubCategoryBreakdown } from '../utils/registrations'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faIcons, faSeedling, faPersonRunning, faMasksTheater, faPalette, faMusic, faTrophy, faMicrophone, faPersonDress, faDrum, faClapperboard, faStar, faLaptop, faDesktop, faBook } from '@fortawesome/free-solid-svg-icons'
import s from './SubCategoryModal.module.css'

const ICON_MAP = {
  faIcons, faSeedling, faPersonRunning, faMasksTheater, faPalette, faMusic, faTrophy, faMicrophone, faPersonDress, faDrum, faClapperboard, faStar, faLaptop, faDesktop, faBook
}

export default function SubCategoryModal({ event, onClose }) {
  const dispatch = useDispatch()
  const [expanded, setExpanded] = useState(null)
  const registrations = useSelector(st => st.registrations.list)
  const isAdmin = useSelector(st => st.auth.role === 'admin')

  if (!event) return null

  const breakdown = buildSubCategoryBreakdown(event, registrations)
  const total = breakdown.reduce((sum, b) => sum + b.count, 0)

  return (
    <div className={modalStyles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={`${modalStyles.modal} ${modalStyles.modalWide}`}>
        <div className={modalStyles.modalTop}>
          <div>
            <h2 className={modalStyles.modalTitle}>
              {event.emoji && ICON_MAP[event.emoji] && <FontAwesomeIcon icon={ICON_MAP[event.emoji]} style={{ marginRight: '8px', color: event.accentColor || 'var(--gold)' }} />}
              {event.name}
            </h2>
            <p className={modalStyles.modalSub}>
              Competition-wise registrations · {total} total
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {isAdmin && (
              <button
                className={s.addParticipantBtn}
                onClick={() => dispatch(openModal({ type: 'addParticipant', payload: event }))}
              >
                + Add Participant
              </button>
            )}
            <button className={modalStyles.closeBtn} onClick={onClose}>✕</button>
          </div>
        </div>

        <div className={modalStyles.body}>
          <div className={s.list}>
            {breakdown.map(item => {
              const pct = total > 0 ? Math.round((item.count / total) * 100) : 0
              const isOpen = expanded === item.subCategory
              return (
                <div key={item.subCategory} className={s.card}>
                  <div
                    className={s.cardHeader}
                    onClick={() => setExpanded(isOpen ? null : item.subCategory)}
                  >
                    <div className={s.cardHeaderLeft}>
                      <span className={s.compName}>{item.subCategory}</span>
                      <div className={s.trackWrap}>
                        <div className={s.track}>
                          <div
                            className={s.fill}
                            style={{
                              width: `${pct}%`,
                              background: `linear-gradient(90deg, ${event.accentColor}88, ${event.accentColor})`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className={s.cardHeaderRight}>
                      <span className={s.countBadge} style={{ color: event.accentColor, borderColor: event.accentColor + '55', background: event.accentColor + '14' }}>
                        {item.count} registered
                      </span>
                      <span className={s.chevron}>{isOpen ? '▲' : '▼'}</span>
                    </div>
                  </div>

                  {isOpen && (
                    <div className={s.participantList}>
                      {item.count === 0 ? (
                        <p className={s.noParticipants}>No registrations yet for this competition.</p>
                      ) : (
                        item.participants.map(p => (
                          <div key={p.id} className={s.participantRow}>
                            <div className={s.avatar} style={{ background: event.accentColor + '22', color: event.accentColor }}>
                              {p.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                            </div>
                            <div>
                              <div className={s.pName}>{p.name}</div>
                              <div className={s.pMeta}>{p.regNo} · {p.department}</div>
                            </div>
                            {p.source === 'admin' && (
                              <span className={s.addedBadge} title="Added manually by admin">admin-added</span>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <div className={modalStyles.actions}>
            <button className={modalStyles.secondaryBtn} onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    </div>
  )
}
