import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMasksTheater, faPersonRunning, faLaptopCode, faIcons, faCalendarDay, faClock, faLocationDot, faEye, faCheck, faPlus, faSeedling, faPalette, faMusic, faTrophy, faMicrophone, faPersonDress, faDrum, faClapperboard, faStar, faLaptop, faDesktop, faBook } from '@fortawesome/free-solid-svg-icons'

const ICON_MAP = {
  faIcons, faSeedling, faPersonRunning, faMasksTheater, faPalette, faMusic, faTrophy, faMicrophone, faPersonDress, faDrum, faClapperboard, faStar, faLaptop, faDesktop, faBook
}
import { useSelector, useDispatch } from 'react-redux'
import { setFilter } from '../store/slices/eventsSlice'
import { selectMyRegistrations } from '../store/slices/registrationsSlice'
import { openModal } from '../store/slices/uiSlice'
import usePageTitle from '../hooks/usePageTitle'
import EventDetailPanel from '../components/EventDetailPanel'
import s from './Events.module.css'

const STATUS_MAP = {
  open:     { label: 'Open',     cls: 'statusOpen'     },
  upcoming: { label: 'Upcoming', cls: 'statusUpcoming' },
  planning: { label: 'Planning', cls: 'statusPlanning' },
  closed:   { label: 'Closed',   cls: 'statusClosed'   },
}

const FILTERS = ['All', 'Festival', 'Sports', 'Cultural', 'Technical']

const CATEGORY_ICONS = {
  Festival: <FontAwesomeIcon icon={faIcons} style={{ marginRight: '4px' }} />,
  Sports:   <FontAwesomeIcon icon={faPersonRunning} style={{ marginRight: '4px' }} />,
  Cultural: <FontAwesomeIcon icon={faMasksTheater} style={{ marginRight: '4px' }} />,
  Technical:<FontAwesomeIcon icon={faLaptopCode} style={{ marginRight: '4px' }} />,
}

export default function Events() {
  usePageTitle('Events')
  const dispatch = useDispatch()
  const { list, filter } = useSelector(s => s.events)
  const myRegistrations = useSelector(selectMyRegistrations)
  const isAdmin = useSelector(st => st.auth.role === 'admin')
  const [selectedEvent, setSelectedEvent] = useState(null)

  const filtered = filter === 'All' ? list : list.filter(e => e.category === filter)
  const isRegistered = (id) => myRegistrations.some(r => r.eventId === id)

  return (
    <div className={`${s.page} page-enter`}>

      {/* Header controls */}
      <div className={s.header}>
        <div className={s.filterRow}>
          <div className={s.filterTabs}>
            {FILTERS.map(f => (
              <button
                key={f}
                className={`${s.filterTab} ${filter === f ? s.activeTab : ''}`}
                onClick={() => dispatch(setFilter(f))}
              >
                {CATEGORY_ICONS[f] || ''} {f}
              </button>
            ))}
          </div>

          <div className={s.headerRight}>
            <span className={s.countLabel}>{filtered.length} event{filtered.length !== 1 ? 's' : ''}</span>
            {isAdmin && (
              <button
                className={s.addBtn}
                onClick={() => dispatch(openModal({ type: 'addEvent' }))}
              >
                <FontAwesomeIcon icon={faPlus} style={{ marginRight: '6px' }} /> Add Event
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Event grid */}
      <motion.div 
        className={s.grid}
        initial="hidden"
        animate="show"
        variants={{
          hidden: { opacity: 0 },
          show: { opacity: 1, transition: { staggerChildren: 0.05 } }
        }}
      >
        <AnimatePresence>
        {filtered.map(evt => {
          const pct = Math.round((evt.registered / evt.maxParticipants) * 100)
          const st  = STATUS_MAP[evt.status] || STATUS_MAP.open
          const registered = isRegistered(evt.id)

          return (
            <motion.div
              key={evt.id}
              className={s.card}
              onClick={() => setSelectedEvent(evt)}
              style={{ cursor: 'pointer' }}
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0, transition: { type: 'spring', damping: 24 } }
              }}
              whileHover={{ y: -4, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Poster strip */}
              <div
                className={s.poster}
                style={{ background: `linear-gradient(135deg, ${evt.accentColor}18 0%, ${evt.accentColor}08 100%)` }}
              >
                <div className={s.posterEmoji} style={{ color: evt.accentColor }}>
                  {evt.emoji && ICON_MAP[evt.emoji] 
                    ? <FontAwesomeIcon icon={ICON_MAP[evt.emoji]} />
                    : CATEGORY_ICONS[evt.category] || <FontAwesomeIcon icon={faIcons} />}
                </div>
                <div
                  className={s.posterGlow}
                  style={{ background: evt.accentColor + '33' }}
                />
                <span className={`${s.statusBadge} ${s[st.cls]}`}>{st.label}</span>
                <span className={s.categoryChip}>
                  {CATEGORY_ICONS[evt.category]} {evt.category}
                </span>
                <button
                  className={s.viewIconBtn}
                  title="View competition-wise registrations"
                  onClick={e => {
                    e.stopPropagation()
                    dispatch(openModal({ type: 'subCategories', payload: evt }))
                  }}
                >
                  <FontAwesomeIcon icon={faEye} style={{ marginRight: '4px' }} /> View
                </button>
              </div>

              {/* Card body */}
              <div className={s.body}>
                <h3 className={s.cardTitle}>{evt.name}</h3>

                <div className={s.metaGrid}>
                  <div className={s.metaItem}>
                    <span className={s.metaIcon}><FontAwesomeIcon icon={faCalendarDay} style={{ color: 'var(--gold-dk)' }}/></span>
                    <span>{new Date(evt.date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                  <div className={s.metaItem}>
                    <span className={s.metaIcon}><FontAwesomeIcon icon={faClock} style={{ color: 'var(--gold-dk)' }}/></span>
                    <span>{evt.time}</span>
                  </div>
                  <div className={s.metaItem} style={{ gridColumn: '1/-1' }}>
                    <span className={s.metaIcon}><FontAwesomeIcon icon={faLocationDot} style={{ color: 'var(--gold-dk)' }}/></span>
                    <span>{evt.venue}</span>
                  </div>
                </div>

                {/* Sub-categories */}
                <div className={s.subCats}>
                  {evt.subCategories.map(sc => (
                    <span
                      key={sc}
                      className={s.subCatTag}
                      style={{ borderColor: evt.accentColor + '44', color: evt.accentColor }}
                    >
                      {sc}
                    </span>
                  ))}
                </div>

                {/* Progress */}
                <div className={s.progressSection}>
                  <div className={s.progressInfo}>
                    <span className={s.progressLabel}>Registrations</span>
                    <span className={s.progressCount}>
                      <strong style={{ color: evt.accentColor }}>{evt.registered}</strong>
                      <span style={{ color: 'var(--muted)' }}> / {evt.maxParticipants}</span>
                    </span>
                  </div>
                  <div className={s.progressTrack}>
                    <div
                      className={s.progressFill}
                      style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${evt.accentColor}aa, ${evt.accentColor})` }}
                    />
                  </div>
                </div>

                {/* Footer */}
                <div className={s.cardFooter}>
                  <span className={s.deadline}>
                    <span style={{ color: 'var(--muted)', fontSize: 11 }}>Deadline </span>
                    {evt.deadline}
                  </span>

                  {!isAdmin && (
                    registered ? (
                      <span className={s.registeredChip}><FontAwesomeIcon icon={faCheck} style={{ marginRight: '4px' }} /> Registered</span>
                    ) : (
                      <button
                        className={s.registerBtn}
                        style={{
                          background: `linear-gradient(135deg, ${evt.accentColor}bb, ${evt.accentColor})`,
                          boxShadow: `0 2px 12px ${evt.accentColor}40`,
                        }}
                        onClick={e => {
                          e.stopPropagation()
                          dispatch(openModal({
                            type: 'register',
                            payload: { eventId: evt.id, name: evt.name, subCategories: evt.subCategories },
                          }))
                        }}
                      >
                        Register
                      </button>
                    )
                  )}
                </div>
              </div>
            </motion.div>
          )
        })}
        </AnimatePresence>

        {/* Add card (admin) */}
        {isAdmin && (
          <motion.div
            className={s.addCard}
            onClick={() => dispatch(openModal({ type: 'addEvent' }))}
            variants={{
              hidden: { opacity: 0, y: 20 },
              show: { opacity: 1, y: 0, transition: { type: 'spring', damping: 24 } }
            }}
            whileHover={{ y: -4, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className={s.addIcon}><FontAwesomeIcon icon={faPlus} /></div>
            <div className={s.addLabel}>Add New Event</div>
            <div className={s.addSub}>Admin only</div>
          </motion.div>
        )}
      </motion.div>

      {/* Detail panel */}
      {selectedEvent && (
        <EventDetailPanel
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          isAdmin={isAdmin}
        />
      )}
    </div>
  )
}
