import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faInbox, faTrophy, faCalendarDay, faClock, faMedal, faBell } from '@fortawesome/free-solid-svg-icons'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { markNotifRead, markAllNotifsRead } from '../store/slices/notificationsSlice'
import { buildEventNotifications, buildResultNotifications, buildRegistrationNotifications } from '../utils/notifications'
import { buildCompetitionNotifications } from '../utils/competitions'
import usePageTitle from '../hooks/usePageTitle'
import s from './Notifications.module.css'

const FILTERS = ['All', 'Winners', 'Today', 'This Week', 'Later', 'Deadlines']

export default function Notifications() {
  usePageTitle('Notice Board')
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const events = useSelector(st => st.events.list)
  const results = useSelector(st => st.results.list)
  const competitions = useSelector(st => st.competitions.list)
  const regList = useSelector(st => st.registrations.list)
  const myList = useSelector(st => st.registrations.myList)
  const readIds = useSelector(st => st.notifications.readIds)
  const [filter, setFilter] = useState('All')

  const all = [
    ...buildResultNotifications(results),
    ...buildRegistrationNotifications(myList, events),
    ...buildEventNotifications(events),
    ...buildCompetitionNotifications(competitions, events, regList),
  ].sort((a, b) => a.sortKey - b.sortKey)

  const filtered = all.filter(n => {
    if (filter === 'All') return true
    if (filter === 'Winners') return n.kind === 'result'
    if (filter === 'Deadlines') return n.kind === 'deadline'
    if (filter === 'Today') return n.kind === 'today'
    if (filter === 'This Week') return n.kind !== 'deadline' && n.kind !== 'result' && n.sortKey - Date.now() < 7 * 86400000
    if (filter === 'Later') return n.kind !== 'result' && n.sortKey - Date.now() >= 7 * 86400000
    return true
  })

  const unreadCount = all.filter(n => !readIds.includes(n.id)).length
  const winnerCount = all.filter(n => n.kind === 'result').length

  return (
    <div className={`${s.page} page-enter`}>
      <div className={s.header}>
        <div>
          <p className={s.subTitle}>
            {unreadCount > 0
              ? `${unreadCount} unread notice${unreadCount > 1 ? 's' : ''} · ${winnerCount} result${winnerCount !== 1 ? 's' : ''} announced`
              : "You're all caught up"}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            className={s.markAllBtn}
            onClick={() => dispatch(markAllNotifsRead(all.map(n => n.id)))}
          >
            ✓ Mark all as read
          </button>
        )}
      </div>

      <div className={s.tabs}>
        {FILTERS.map(f => (
          <button
            key={f}
            className={`${s.tab} ${filter === f ? s.tabActive : ''}`}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <motion.div 
          className={s.emptyState}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <span className={s.emptyIcon}><FontAwesomeIcon icon={faInbox} size="2x" style={{ color: 'var(--gold-dk)' }} /></span>
          <p>No notices in this view.</p>
        </motion.div>
      ) : (
        <motion.div 
          className={s.list}
          initial="hidden"
          animate="show"
          variants={{
            hidden: { opacity: 0 },
            show: { opacity: 1, transition: { staggerChildren: 0.05 } }
          }}
        >
          <AnimatePresence>
          {filtered.map(item => {
            const isRead = readIds.includes(item.id)
            const isResult = item.kind === 'result'
            const isCompetition = item.kind === 'competition'
            return (
              <motion.div
                key={item.id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
                }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className={`${s.card} ${isRead ? s.cardRead : ''}`}
                onClick={() => {
                  dispatch(markNotifRead(item.id))
                  if (isCompetition) navigate(`/competitions/${item.competitionId}`)
                  else navigate(isResult ? '/results' : '/events')
                }}
              >
                <div
                  className={s.dateBox}
                  style={{ borderColor: item.accentColor + '55', background: item.accentColor + '14' }}
                >
                  <span className={s.dateEmoji}><FontAwesomeIcon icon={faBell} style={{ color: item.accentColor }} /></span>
                </div>

                <div className={s.cardBody}>
                  <div className={s.cardTop}>
                    <span className={s.cardTitle}>
                      {item.kind === 'today' && <span className={s.liveDot} />}
                      {item.title}
                    </span>
                    {item.kind === 'deadline' && <span className={s.tagDeadline}>Deadline</span>}
                    {item.kind === 'today' && <span className={s.tagToday}>Today</span>}
                    {isResult && <span className={s.tagWinner}><FontAwesomeIcon icon={faTrophy} /> Winner</span>}
                  </div>

                  {isResult ? (
                    <div className={s.winnerRow}>
                      {item.winners.slice().sort((a, b) => a.rank - b.rank).map(w => (
                        <span key={w.rank} className={s.winnerChip}>
                          <FontAwesomeIcon icon={faMedal} style={{ color: w.rank === 1 ? '#FFD700' : w.rank === 2 ? '#C0C0C0' : '#CD7F32' }} /> <strong>{w.name}</strong>
                          <span className={s.winnerDept}>· {w.department}</span>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <>
                      <p className={s.cardMeta}>{item.body}</p>
                      <div className={s.cardFoot}>
                        <span className={s.metaChip}><FontAwesomeIcon icon={faCalendarDay} style={{ color: 'var(--gold-dk)' }} /> {item.dateLabel}</span>
                        <span className={s.metaChip}><FontAwesomeIcon icon={faClock} style={{ color: 'var(--gold-dk)' }} /> {item.timeLabel}</span>
                        <span
                          className={s.countdownChip}
                          style={{ color: item.accentColor, borderColor: item.accentColor + '55', background: item.accentColor + '14' }}
                        >
                          {item.countdown}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {!isRead && <div className={s.unreadDot} />}
              </motion.div>
            )
          })}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  )
}
