import React, { useMemo, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { openModal } from '../store/slices/uiSlice'
import { computeInvitationStatus, getCompetitionRegisteredCount } from '../utils/competitions'
import { selectMyRegistrations } from '../store/slices/registrationsSlice'
import usePageTitle from '../hooks/usePageTitle'
import { motion, AnimatePresence } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCalendarDay, faLocationDot, faMasksTheater, faPersonRunning, faLaptopCode, faIcons, faCheck, faPlus } from '@fortawesome/free-solid-svg-icons'
import s from './Competitions.module.css'

const CATEGORY_ICONS = {
  Festival: <FontAwesomeIcon icon={faIcons} style={{ marginRight: '4px' }} />,
  Sports:   <FontAwesomeIcon icon={faPersonRunning} style={{ marginRight: '4px' }} />,
  Cultural: <FontAwesomeIcon icon={faMasksTheater} style={{ marginRight: '4px' }} />,
  Technical:<FontAwesomeIcon icon={faLaptopCode} style={{ marginRight: '4px' }} />,
}

const STATUS_META = {
  draft:     { label: 'Draft',                    cls: 'stDraft'   },
  published: { label: 'Published',                 cls: 'stPub'     },
  open:      { label: 'Registration Open',         cls: 'stOpen'    },
  closing:   { label: 'Closing Soon',              cls: 'stClosing' },
  closed:    { label: 'Registration Closed',       cls: 'stClosed'  },
  completed: { label: 'Completed',                 cls: 'stDone'    },
  cancelled: { label: 'Cancelled',                 cls: 'stClosed'  },
}

const TYPE_FILTERS = ['All', 'Individual', 'Team']
const STATUS_FILTERS = ['All', 'Registration Open', 'Closing Soon', 'Closed', 'Completed']

export default function Competitions() {
  usePageTitle('Competitions')
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const events = useSelector(st => st.events.list)
  const competitions = useSelector(st => st.competitions.list)
  const registrations = useSelector(st => st.registrations.list)
  const myRegistrations = useSelector(selectMyRegistrations)
  const isAdmin = useSelector(st => st.auth.role === 'admin')

  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const [eventFilter, setEventFilter] = useState('All')
  const [typeFilter, setTypeFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')

  const categories = useMemo(() => ['All', ...new Set(events.map(e => e.category))], [events])

  // Every (event, competition-name) slot — enriched with its invitation
  // record (if one exists) and its live-computed status.
  const cards = useMemo(() => {
    const rows = []
    events.forEach(evt => {
      const subCats = evt.subCategories?.length ? evt.subCategories : []
      subCats.forEach(sc => {
        const comp = competitions.find(c => c.eventId === evt.id && c.subCategory === sc)
        const registeredCount = getCompetitionRegisteredCount(comp?.eventId || evt.id, comp?.subCategory || sc, registrations, comp)
        const status = computeInvitationStatus({ competition: comp, event: evt, registeredCount })
        rows.push({ event: evt, subCategory: sc, comp, registeredCount, status })
      })
    })
    return rows.sort((a, b) => {
      const timeA = new Date(`${a.event.date}T${a.event.time || '00:00'}:00`).getTime()
      const timeB = new Date(`${b.event.date}T${b.event.time || '00:00'}:00`).getTime()
      return timeA - timeB
    })
  }, [events, competitions, registrations])

  const visible = cards.filter(row => {
    if (!isAdmin && (!row.comp || row.status.code === 'draft')) return false
    if (query && !`${row.subCategory} ${row.event.name}`.toLowerCase().includes(query.toLowerCase())) return false
    if (category !== 'All' && row.event.category !== category) return false
    if (eventFilter !== 'All' && row.event.id !== eventFilter) return false
    if (typeFilter !== 'All' && row.comp?.individualOrTeam !== typeFilter) return false
    if (statusFilter !== 'All') {
      const map = { 'Registration Open': 'open', 'Closing Soon': 'closing', 'Closed': 'closed', 'Completed': 'completed' }
      // If it doesn't match the mapped code, hide it. Note: 'draft'/'published' are hidden by these filters unless we add them.
      if (map[statusFilter] && row.status.code !== map[statusFilter]) return false
    }
    return true
  })

  const isRegistered = (eventId, subCategory) =>
    myRegistrations.some(r => r.eventId === eventId && r.subCategory === subCategory)

  const isRegisteredElsewhereInEvent = (eventId, subCategory) =>
    myRegistrations.some(r => r.eventId === eventId && r.subCategory !== subCategory)

  function goToInvitation(row) {
    if (row.comp) navigate(`/competitions/${row.comp.id}`)
  }

  return (
    <div className={`${s.page} page-enter`}>
      <div className={s.header}>
        <p className={s.subTitle}>
          {visible.length} competition{visible.length !== 1 ? 's' : ''} · full invitations, rules, judging criteria & prizes
        </p>
        {isAdmin && (
          <button className={s.addBtn} onClick={() => dispatch(openModal({ type: 'competitionForm', payload: null }))}>
            + New Invitation
          </button>
        )}
      </div>

      {/* Search & filters */}
      <div className={s.filterBar}>
        <div className={s.searchBox}>
          <span>⌕</span>
          <input placeholder="Search competitions or events…" value={query} onChange={e => setQuery(e.target.value)} />
        </div>
        <select className={s.filterSelect} value={category} onChange={e => setCategory(e.target.value)}>
          {categories.map(c => <option key={c}>{c}</option>)}
        </select>
        <select className={s.filterSelect} value={eventFilter} onChange={e => setEventFilter(e.target.value)}>
          <option value="All">All Events</option>
          {events.map(ev => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
        </select>
        <select className={s.filterSelect} value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          {TYPE_FILTERS.map(t => <option key={t}>{t}</option>)}
        </select>
        <select className={s.filterSelect} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          {STATUS_FILTERS.map(t => <option key={t}>{t}</option>)}
        </select>
      </div>

      {/* Cards */}
      {visible.length === 0 ? (
        <div className={s.empty}>
          <span><FontAwesomeIcon icon={faMasksTheater} style={{ fontSize: '32px', color: 'var(--gold-dk)' }} /></span>
          <p>No competitions match your filters.</p>
        </div>
      ) : (
        <div className={s.grid}>
          {visible.map(row => {
            const meta = STATUS_META[row.status.code] || STATUS_META.published
            const accent = row.comp?.accentColor || row.event.accentColor
            const cap = row.comp?.maxParticipants
            const slotsLeft = cap ? Math.max(0, cap - row.registeredCount) : null
            const registered = isRegistered(row.event.id, row.subCategory)
            const registeredElsewhere = !registered && isRegisteredElsewhereInEvent(row.event.id, row.subCategory)

            return (
              <div key={`${row.event.id}-${row.subCategory}`} className={s.card} onClick={() => goToInvitation(row)}>
                <div
                  className={s.poster}
                  style={row.comp?.posterImage
                    ? { padding: 0, backgroundImage: `url(${row.comp.posterImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                    : { background: `linear-gradient(135deg, ${accent}20 0%, ${accent}08 100%)` }}
                >
                  {!row.comp?.posterImage && (
                    <div className={s.posterEmoji} style={{ color: accent }}>
                      {CATEGORY_ICONS[row.event.category] || <FontAwesomeIcon icon={faIcons} />}
                    </div>
                  )}
                  <span className={`${s.statusBadge} ${s[meta.cls]}`}>{meta.label}</span>
                  <span className={s.eventChip}>{row.event.name}</span>
                </div>

                <div className={s.body}>
                  <h3 className={s.cardTitle}>{row.subCategory}</h3>
                  <div className={s.metaRow}>
                    <span><FontAwesomeIcon icon={faCalendarDay} style={{ color: 'var(--gold-dk)', marginRight: '4px' }} /> {new Date(row.event.date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                    <span><FontAwesomeIcon icon={faLocationDot} style={{ color: 'var(--gold-dk)', marginRight: '4px' }} /> {row.event.venue}</span>
                  </div>
                  <div className={s.metaRow}>
                    <span className={s.typeTag}>{row.comp?.individualOrTeam || 'Individual'}</span>
                    <span className={s.catTag}>{row.event.category}</span>
                  </div>

                  {!row.comp ? (
                    <p className={s.noInvite}>No invitation created yet.</p>
                  ) : (
                    <div className={s.slotsRow}>
                      <span>{row.registeredCount}/{cap} registered</span>
                      {row.status.full
                        ? <strong className={s.full}>Full</strong>
                        : <strong>{slotsLeft} slot{slotsLeft !== 1 ? 's' : ''} left</strong>}
                    </div>
                  )}

                  <div className={s.cardFooter}>
                    {isAdmin ? (
                      (!row.comp && row.status.code === 'completed') ? (
                        <button className={s.viewBtn} disabled title="Event has already ended.">
                          Event Ended
                        </button>
                      ) : (
                        <button
                          className={s.viewBtn}
                          onClick={e => {
                            e.stopPropagation()
                            dispatch(openModal({
                              type: 'competitionForm',
                              payload: row.comp || { eventId: row.event.id, subCategory: row.subCategory },
                            }))
                          }}
                        >
                          {row.comp ? '✎ Manage' : '+ Create Invitation'}
                        </button>
                      )
                    ) : (
                      <button className={s.viewBtn} onClick={e => { e.stopPropagation(); goToInvitation(row) }}>
                        View Details
                      </button>
                    )}
                    {row.comp && !isAdmin && (
                      registered ? (
                        <span className={s.registeredChip}>✓ Registered</span>
                      ) : registeredElsewhere ? (
                        <button className={s.registerBtn} disabled title="You're already registered for another item in this event">
                          Registered for Another Item
                        </button>
                      ) : (
                        <button
                          className={s.registerBtn}
                          disabled={row.status.code !== 'open' && row.status.code !== 'closing'}
                          style={{ background: `linear-gradient(135deg, ${accent}bb, ${accent})` }}
                          onClick={e => { e.stopPropagation(); goToInvitation(row) }}
                        >
                          Register Now
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
