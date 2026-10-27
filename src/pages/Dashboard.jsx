import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { openModal } from '../store/slices/uiSlice'
import { computeInvitationStatus, getCompetitionRegisteredCount } from '../utils/competitions'
import { selectAllRegistrations } from '../store/slices/registrationsSlice'
import usePageTitle from '../hooks/usePageTitle'
import s from './Dashboard.module.css'
import TextAnimation from '../components/TextAnimation'
import { motion, AnimatePresence } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUserGraduate, faCheckCircle, faMedal, faCircleCheck, faCircleQuestion, faClock, faLocationDot, faCheck, faHourglassHalf, faEye, faCalendarPlus, faTrophy, faCalendarDay } from '@fortawesome/free-solid-svg-icons'
import { icon } from '@fortawesome/fontawesome-svg-core'

const STATS = [
  { label: 'Total Events', icon: <FontAwesomeIcon icon={faCalendarDay} />, theme: 'gold', change: '+3 this semester' },
  { label: 'Registered Students', icon: <FontAwesomeIcon icon={faUserGraduate} />, theme: 'blue', change: '+18% from last year', value: 348 },
  { label: 'Total Registrations', icon: <FontAwesomeIcon icon={faCheckCircle} />, theme: 'green', change: '+234 this week' },
  { label: 'Winners Announced', icon: <FontAwesomeIcon icon={faMedal} />, theme: 'purple', change: '5 events concluded', value: 47 },
]

const EVENT_COLORS = {
  'evt-001': '#e85d26', 'evt-003': '#3498db',
  'evt-004': '#9b59b6', 'evt-005': '#2ecc71', 'evt-006': '#c9a84c',
}

export default function Dashboard() {
  usePageTitle('Dashboard')
  const dispatch = useDispatch()
  const events = useSelector(s => s.events.list)
  const registrations = useSelector(selectAllRegistrations)
  const competitions = useSelector(s => s.competitions.list)
  const students = useSelector(s => s.students?.list || [])
  const results = useSelector(s => s.results?.list || [])
  const navigate = useNavigate()
  const { user, role } = useSelector(s => s.auth)

  const totalRegs = events.reduce((a, e) => a + e.registered, 0)
  const maxRegistered = Math.max(1, ...events.map(e => e.registered))
  const studentCount = students.length || 0
  const winnersCount = results.length || 0

  // Chart bars — real registered counts per event, scaled to the tallest bar.
  const chartData = events.map(evt => ({
    label: evt.name.split(' ')[0],
    value: evt.registered,
    color: EVENT_COLORS[evt.id] || '#c9a84c',
    pct: Math.round((evt.registered / maxRegistered) * 100),
  }))

  // Most recent real registrations, newest first.
  const recentRegs = [...registrations]
    .sort((a, b) => new Date(b.registeredAt) - new Date(a.registeredAt))
    .slice(0, 5)
    .map(r => {
      const evt = events.find(e => e.id === r.eventId)
      const initials = r.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
      return {
        initials,
        color: (evt && EVENT_COLORS[evt.id]) || '#c9a84c',
        name: r.name,
        event: `${evt ? evt.name.split(' ')[0] : 'Event'} — ${r.subCategory}`,
        status: 'confirmed',
        icon: <FontAwesomeIcon icon={faCircleCheck} />,
      }
    })

  const statValues = [events.length, studentCount, totalRegs, winnersCount]

  // Published competition invitations, soonest event date first.
  const now = Date.now()
  const upcomingCompetitions = competitions
    .filter(c => c.status === 'published')
    .map(comp => {
      const event = events.find(e => e.id === comp.eventId)
      if (!event) return null
      const registeredCount = getCompetitionRegisteredCount(comp.eventId, comp.subCategory, registrations, comp)
      const status = computeInvitationStatus({ competition: comp, event, registeredCount })
      const isNew = comp.publishedAt && (now - new Date(comp.publishedAt).getTime()) < 5 * 86400000
      return { comp, event, registeredCount, statusLabel: status.label, isNew, eventTime: new Date(`${event.date}T${event.time || '00:00'}:00`).getTime() ,icon:<FontAwesomeIcon icon={faCircleQuestion} />}
    })
    .filter(Boolean)
    .filter(row => row.eventTime >= now || row.statusLabel !== 'Competition Completed')
    .sort((a, b) => a.eventTime - b.eventTime)
    .slice(0, 4)

  const newInvitationsCount = competitions.filter(
    c => c.status === 'published' && c.publishedAt && (now - new Date(c.publishedAt).getTime()) < 5 * 86400000
  ).length

  return (
    <div className={`${s.page} page-enter`}>

      {/* Welcome banner */}
      <div className={s.welcomeBanner}>
        <div className={s.welcomeLeft}>
          <span className={s.welcomeEmoji}></span>
          <div>
            <div className={s.welcomeTitle}>Welcome back, <TextAnimation animation="slideLeft" className={s.welcomeName}>{user?.name || ''}</TextAnimation></div>
            <div className={s.welcomeSub}>{role === 'admin' ? 'Cultural Coordinator' : user?.department} · Sri Parasakthi College for Women</div>
          </div>
        </div>
        <div className={s.welcomeDate}>
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
      </div>

      {/* Stats grid */}
      <div className={s.statsGrid}>
        {STATS.map((stat, i) => (
          <div key={i} className={`${s.statCard} ${s[stat.theme]}`}>
            <div className={s.statTop}>
              <span className={s.statIcon}>{stat.icon}</span>
              <div className={s.statTrend}>↑</div>
            </div>
            <div className={s.statValue}>{statValues[i].toLocaleString()}</div>
            <div className={s.statLabel}>{stat.label}</div>
            <div className={s.statChange}>{stat.change}</div>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div className={s.mainGrid}>

        {/* Upcoming events */}
        <div className={s.panel}>
          <div className={s.panelHeader}>
            <div>
              <h3 className={s.panelTitle}>Upcoming Events</h3>
              <p className={s.panelSub}>{events.length} events this semester</p>
            </div>
            <button className={s.viewAllBtn} onClick={() => navigate('/events')}>
              <FontAwesomeIcon icon={faEye} style={{ marginRight: '6px' }} /> View all
            </button>
          </div>

          <motion.div 
            className={s.eventList}
            initial="hidden"
            animate="show"
            variants={{
              hidden: { opacity: 0 },
              show: { opacity: 1, transition: { staggerChildren: 0.05 } }
            }}
          >
            {events.slice(0, 4).map(evt => (
              <motion.div 
                key={evt.id} 
                className={s.eventItem}
                style={{ cursor: 'pointer' }}
                onClick={() => navigate('/events')}
                variants={{
                  hidden: { opacity: 0, x: -20 },
                  show: { opacity: 1, x: 0, transition: { type: 'spring', damping: 24 } }
                }}
                whileHover={{ scale: 1.01, x: 4 }}
                whileTap={{ scale: 0.99 }}
              >
                <div
                  className={s.eventDateBox}
                  style={{ borderColor: evt.accentColor + '44', background: evt.accentColor + '11' }}
                >
                  <div className={s.eventDay} style={{ color: evt.accentColor }}>
                    {evt.date.split('-')[2]}
                  </div>
                  <div className={s.eventMonth}>
                    {new Date(evt.date + 'T00:00:00').toLocaleString('default', { month: 'short' })}
                  </div>
                </div>
                <div className={s.eventInfo}>
                  <div className={s.eventName}>{evt.name}</div>
                  <div className={s.eventMeta}>
                    <span><FontAwesomeIcon icon={faClock} style={{ color: 'var(--gold-dk)', marginRight: '4px' }} /> {evt.time}</span>
                    <span><FontAwesomeIcon icon={faLocationDot} style={{ color: 'var(--gold-dk)', marginRight: '4px' }} /> {evt.venue}</span>
                  </div>
                  <div className={s.eventTags}>
                    {evt.subCategories.slice(0, 3).map(sc => (
                      <span key={sc} className={s.tag}>{sc}</span>
                    ))}
                  </div>
                </div>
                <div className={s.eventCount}>
                  <div className={s.eventCountNum}>{evt.registered}</div>
                  <div className={s.eventCountLabel}>registered</div>
                </div>
                <div style={{ marginLeft: 8, color: 'var(--muted)' }}>
                  <FontAwesomeIcon icon={faEye} />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Upcoming Competitions / New Invitations */}
        <div className={s.panel}>
          <div className={s.panelHeader}>
            <div>
              <h3 className={s.panelTitle}>Upcoming Competitions</h3>
              <p className={s.panelSub}>
                {newInvitationsCount > 0 ? `${newInvitationsCount} new invitation${newInvitationsCount !== 1 ? 's' : ''} published` : 'Published competition invitations'}
              </p>
            </div>
            <button className={s.viewAllBtn} onClick={() => navigate('/competitions')}>
              <FontAwesomeIcon icon={faEye} style={{ marginRight: '6px' }} /> View all
            </button>
          </div>

          <motion.div 
            className={s.eventList}
            initial="hidden"
            animate="show"
            variants={{
              hidden: { opacity: 0 },
              show: { opacity: 1, transition: { staggerChildren: 0.05 } }
            }}
          >
            {upcomingCompetitions.length === 0 ? (
              <p style={{ fontSize: 12.5, color: 'var(--muted)', padding: '8px 0' }}>No competition invitations published yet.</p>
            ) : upcomingCompetitions.map(row => (
              <motion.div 
                key={row.comp.id} 
                className={s.eventItem} 
                style={{ cursor: 'pointer' }} 
                onClick={() => navigate(`/competitions/${row.comp.id}`)}
                variants={{
                  hidden: { opacity: 0, x: -20 },
                  show: { opacity: 1, x: 0, transition: { type: 'spring', damping: 24 } }
                }}
                whileHover={{ scale: 1.01, x: 4 }}
                whileTap={{ scale: 0.99 }}
              >
                <div
                  className={s.eventDateBox}
                  style={{ borderColor: row.event.accentColor + '44', background: row.event.accentColor + '11' }}
                >
                  <div className={s.eventDay} style={{ color: row.event.accentColor }}>
                    {row.event.date.split('-')[2]}
                  </div>
                  <div className={s.eventMonth}>
                    {new Date(row.event.date + 'T00:00:00').toLocaleString('default', { month: 'short' })}
                  </div>
                </div>
                <div className={s.eventInfo}>
                  <div className={s.eventName}>
                    {row.comp.subCategory}
                    {row.isNew && <span className={`${s.badge} ${s.badgeGreen}`} style={{ marginLeft: 8 }}>New</span>}
                  </div>
                  <div className={s.eventMeta}>
                    <span><FontAwesomeIcon icon={faLocationDot} style={{ color: 'var(--gold-dk)', marginRight: '4px' }} /> {row.event.venue}</span>
                    <span>{row.statusLabel}</span>
                  </div>
                </div>
                <div className={s.eventCount}>
                  <div className={s.eventCountNum}>{row.registeredCount}</div>
                  <div className={s.eventCountLabel}>registered</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Chart + Recent */}
        <div className={s.rightCol}>

          {/* Chart */}
          <div className={s.panel}>
            <div className={s.panelHeader}>
              <div>
                <h3 className={s.panelTitle}>Registrations Overview</h3>
                <p className={s.panelSub}>By event this semester</p>
              </div>
            </div>
            <motion.div 
              className={s.chart}
              initial="hidden"
              animate="show"
              variants={{
                hidden: { opacity: 0 },
                show: { opacity: 1, transition: { staggerChildren: 0.1 } }
              }}
            >
              {chartData.map(d => (
                <div key={d.label} className={s.chartCol}>
                  <div className={s.chartBarWrap}>
                    <motion.div
                      className={s.chartBar}
                      variants={{
                        hidden: { height: 0, opacity: 0 },
                        show: { height: `${d.pct}%`, opacity: 1, transition: { type: 'spring', damping: 20 } }
                      }}
                      style={{ background: d.color, boxShadow: `0 0 12px ${d.color}55` }}
                      whileHover={{ filter: 'brightness(1.1)', width: '100%' }}
                    />
                  </div>
                  <div className={s.chartLabel}>{d.label}</div>
                  <div className={s.chartVal} style={{ color: d.color }}>{d.value}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Recent registrations */}
          <div className={s.panel}>
            <div className={s.panelHeader}>
              <h3 className={s.panelTitle}>Recent Registrations</h3>
            </div>
            <motion.div 
              className={s.recentList}
              initial="hidden"
              animate="show"
              variants={{
                hidden: { opacity: 0 },
                show: { opacity: 1, transition: { staggerChildren: 0.05 } }
              }}
            >
              {recentRegs.length === 0 ? (
                <p style={{ fontSize: 12.5, color: 'var(--muted)', padding: '8px 0' }}>No registrations yet.</p>
              ) : recentRegs.map((r, i) => (
                <motion.div 
                  key={i} 
                  className={s.recentItem}
                  variants={{
                    hidden: { opacity: 0, y: 10 },
                    show: { opacity: 1, y: 0, transition: { type: 'spring', damping: 24 } }
                  }}
                  whileHover={{ scale: 1.01, x: 4 }}
                >
                  <div
                    className={s.recentAvatar}
                    style={{ background: r.color + '22', color: r.color, borderColor: r.color + '44' }}
                  >
                    {r.initials}
                  </div>
                  <div className={s.recentInfo}>
                    <div className={s.recentName}>{r.name}</div>
                    <div className={s.recentEvent}>{r.event}</div>
                  </div>
                  <span className={r.status === 'confirmed' ? `${s.badge} ${s.badgeGreen}` : `${s.badge} ${s.badgeOrange}`}>
                    {r.status === 'confirmed' ? <FontAwesomeIcon icon={faCheck} /> : <FontAwesomeIcon icon={faHourglassHalf} />}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Admin quick-actions */}
          {role === 'admin' && (
            <div className={s.panel}>
              <div className={s.panelHeader}>
                <h3 className={s.panelTitle}>Quick Actions</h3>
                <span className={s.adminTag}>Admin</span>
              </div>
              <div className={s.quickActions}>
                {[
                  { icon: <FontAwesomeIcon icon={faCalendarPlus} />, label: 'Add Event', sub: 'Publish a new event', action: () => dispatch(openModal({ type: 'addEvent' })), color: 'var(--gold)' },
                  { icon: <FontAwesomeIcon icon={faUserGraduate} />, label: 'Add Student', sub: 'Register a new student', action: () => dispatch(openModal({ type: 'addStudent' })), color: 'var(--blue)' },
                  { icon: <FontAwesomeIcon icon={faTrophy} />, label: 'Post Results', sub: 'Announce winners', action: () => dispatch(openModal({ type: 'addResult' })), color: 'var(--purple)' },
                ].map((qa, i) => (
                  <button key={i} className={s.qaCard} onClick={qa.action}>
                    <div className={s.qaIcon} style={{ background: qa.color + '22', border: `1px solid ${qa.color}44` }}>
                      <span>{qa.icon}</span>
                    </div>
                    <div className={s.qaText}>
                      <span className={s.qaLabel} style={{ color: qa.color }}>{qa.label}</span>
                      <span className={s.qaSub}>{qa.sub}</span>
                    </div>
                    <span className={s.qaArrow}>→</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
