import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faInbox, faBell, faCircleDot, faTrophy } from '@fortawesome/free-solid-svg-icons'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { closeNotifPanel } from '../store/slices/uiSlice'
import { markNotifRead, markAllNotifsRead } from '../store/slices/notificationsSlice'
import { buildEventNotifications, buildResultNotifications, buildRegistrationNotifications } from '../utils/notifications'
import { buildCompetitionNotifications } from '../utils/competitions'
import s from './NotifPanel.module.css'

export default function NotifPanel() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const open = useSelector(st => st.ui.notifPanelOpen)
  const events = useSelector(st => st.events.list)
  const results = useSelector(st => st.results.list)
  const competitions = useSelector(st => st.competitions.list)
  const regList = useSelector(st => st.registrations.list)
  const myList = useSelector(st => st.registrations.myList)
  const readIds = useSelector(st => st.notifications.readIds)

  const notifs = [
    ...buildResultNotifications(results),
    ...buildRegistrationNotifications(myList, events),
    ...buildEventNotifications(events),
    ...buildCompetitionNotifications(competitions, events, regList),
  ].sort((a, b) => a.sortKey - b.sortKey)
  const preview = notifs.slice(0, 8)
  const unreadCount = notifs.filter(n => !readIds.includes(n.id)).length

  function handleItemClick(item) {
    if (!readIds.includes(item.id)) {
      dispatch(markNotifRead(item.id))
    }
    if (item.kind === 'competition' && item.competitionId) {
      dispatch(closeNotifPanel())
      navigate(`/competitions/${item.competitionId}`)
    }
  }

  function goToNotifications() {
    dispatch(closeNotifPanel())
    navigate('/notice-board')
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className={s.backdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => dispatch(closeNotifPanel())}
          />
          <motion.div 
            className={s.panel}
            initial={{ x: '100%', boxShadow: '0px 0px 0px rgba(0,0,0,0)' }}
            animate={{ x: 0, boxShadow: '-8px 0 32px rgba(0,0,0,0.4)' }}
            exit={{ x: '100%', boxShadow: '0px 0px 0px rgba(0,0,0,0)' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            onClick={e => e.stopPropagation()}
          >
        <div className={s.header}>
          <div>
            <span className={s.title}>Notice Board</span>
            {unreadCount > 0 && <span className={s.unreadBadge}>{unreadCount} new</span>}
          </div>
          <button className={s.closeBtn} onClick={() => dispatch(closeNotifPanel())}>✕</button>
        </div>

        {preview.length === 0 ? (
          <div className={s.empty}>
            <span className={s.emptyIcon}><FontAwesomeIcon icon={faInbox} style={{ color: 'var(--gold-dk)' }} /></span>
            <p>No notices to show right now.</p>
          </div>
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
            {preview.map(item => {
              const isRead = readIds.includes(item.id)
              return (
                <motion.div
                  key={item.id}
                  variants={{
                    hidden: { opacity: 0, x: 20 },
                    show: { opacity: 1, x: 0, transition: { type: 'spring', damping: 20 } }
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`${s.item} ${isRead ? s.read : ''}`}
                  onClick={() => handleItemClick(item)}
                >
                  <div
                    className={s.iconWrap}
                    style={{ background: `${item.accentColor}22`, border: `1px solid ${item.accentColor}44` }}
                  >
                    <span><FontAwesomeIcon icon={faBell} style={{ color: item.accentColor }} /></span>
                  </div>
                  <div className={s.body}>
                    <div className={s.itemTitle}>
                      {item.kind === 'today' ? <FontAwesomeIcon icon={faCircleDot} style={{ color: 'var(--red)', marginRight: '6px' }} /> : item.kind === 'result' ? <FontAwesomeIcon icon={faTrophy} style={{ color: 'var(--gold-lt)', marginRight: '6px' }} /> : null}
                      {item.title}
                    </div>
                    <div className={s.itemBody}>
                      {item.kind === 'result' || item.kind === 'competition' ? item.body : `${item.dateLabel} · ${item.timeLabel}`}
                    </div>
                    <div className={s.itemTime}>{item.countdown}</div>
                  </div>
                  {!isRead && <div className={s.unreadDot} />}
                </motion.div>
              )
            })}
          </motion.div>
        )}

        <div className={s.footer}>
          {unreadCount > 0 && (
            <button
              className={s.markAllBtn}
              onClick={() => dispatch(markAllNotifsRead(notifs.map(n => n.id)))}
            >
              Mark all as read
            </button>
          )}
          <a className={s.viewAllLink} onClick={goToNotifications} style={{ cursor: 'pointer' }}>
            View full Notice Board →
          </a>
        </div>
      </motion.div>
      </>
      )}
    </AnimatePresence>
  )
}
