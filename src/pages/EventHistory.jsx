import React, { useMemo, useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import usePageTitle from '../hooks/usePageTitle'
import { fetchHistory } from '../store/slices/eventHistorySlice'
import { motion, AnimatePresence } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faSearch,
  faScroll,
  faDownload,
  faUsers,
  faTrophy,
  faChevronUp,
  faChevronDown,
  faMedal,
  faIcons,
  faMasksTheater,
  faPersonRunning,
  faLaptopCode,
  faSeedling,
  faPalette,
  faMusic,
  faMicrophone,
  faPersonDress,
  faDrum,
  faClapperboard,
  faStar,
  faLaptop,
  faDesktop,
  faBook,
  faRotateRight,
} from '@fortawesome/free-solid-svg-icons'
import s from './EventHistory.module.css'

const CATEGORY_ICONS = {
  Festival: <FontAwesomeIcon icon={faIcons} />,
  Sports: <FontAwesomeIcon icon={faPersonRunning} />,
  Cultural: <FontAwesomeIcon icon={faMasksTheater} />,
  Technical: <FontAwesomeIcon icon={faLaptopCode} />,
}

const ICON_MAP = {
  faIcons,
  faSeedling,
  faPersonRunning,
  faMasksTheater,
  faPalette,
  faMusic,
  faTrophy,
  faMicrophone,
  faPersonDress,
  faDrum,
  faClapperboard,
  faStar,
  faLaptop,
  faDesktop,
  faBook,
}

const FILTERS = ['All', 'Festival', 'Sports', 'Cultural', 'Technical']

function downloadCsv(filename, rows) {
  const csv = rows
    .map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
    .join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function editionToRows(edition) {
  const rows = [
    ['Event', edition.eventName || ''],
    ['Year', edition.year || ''],
    ['Category', edition.category || ''],
    ['Venue', edition.venue || ''],
    ['Date', edition.date || ''],
    [],
    ['-- Participants --'],
    ['Name', 'Register No.', 'Department', 'Sub-Category'],
    ...(edition.participants || []).map((p) => [
      p.name || '',
      p.regNo || '',
      p.department || '',
      p.subCategory || '',
    ]),
    [],
    ['-- Winners --'],
    ['Rank', 'Name', 'Register No.', 'Department', 'Sub-Category'],
    ...(edition.winners || []).map((w) => [
      w.rank || '',
      w.name || '',
      w.regNo || '',
      w.department || '',
      w.subCategory || '',
    ]),
  ]
  return rows
}

function formatDate(iso) {
  if (!iso) return 'Date TBA'
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function EventHistory() {
  usePageTitle('Event History')
  const dispatch = useDispatch()
  const history = useSelector((st) => st.eventHistory.list)
  const loading = useSelector((st) => st.eventHistory.loading)
  const [query, setQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [expandedId, setExpandedId] = useState(null)

  useEffect(() => {
    dispatch(fetchHistory())
  }, [dispatch])

  const results = useMemo(() => {
    let list = Array.isArray(history) ? history : []

    if (categoryFilter !== 'All') {
      list = list.filter((ed) => (ed.category || '').toLowerCase() === categoryFilter.toLowerCase())
    }

    const q = query.trim().toLowerCase()
    if (!q) return list

    return list.filter((ed) => {
      const nameMatch = (ed.eventName || '').toLowerCase().includes(q)
      const catMatch = (ed.category || '').toLowerCase().includes(q)
      const venueMatch = (ed.venue || '').toLowerCase().includes(q)
      const yearMatch = String(ed.year || '').includes(q)
      return nameMatch || catMatch || venueMatch || yearMatch
    })
  }, [history, query, categoryFilter])

  function downloadEdition(edition) {
    downloadCsv(`${edition.eventKey || 'event'}-${edition.year || 'history'}.csv`, editionToRows(edition))
  }

  function downloadAllResults() {
    const rows = []
    results.forEach((ed, i) => {
      if (i > 0) rows.push([])
      rows.push(...editionToRows(ed))
    })
    downloadCsv(`event-history-${query.trim().toLowerCase() || categoryFilter.toLowerCase()}.csv`, rows)
  }

  return (
    <div className={`${s.page} page-enter`}>
      <div className={s.header}>
        <div>
          <h1 className={s.title}>Event History</h1>
          <p className={s.subTitle}>
            Explore and review all events — both newly created editions and past academic years, with full participant and winner details.
          </p>
        </div>
      </div>

      <div className={s.controlsRow}>
        <div className={s.filterTabs}>
          {FILTERS.map((f) => (
            <button
              key={f}
              className={`${s.filterTab} ${categoryFilter === f ? s.activeTab : ''}`}
              onClick={() => setCategoryFilter(f)}
            >
              {f !== 'All' && CATEGORY_ICONS[f] ? (
                <span style={{ marginRight: '6px' }}>{CATEGORY_ICONS[f]}</span>
              ) : null}
              {f}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div className={s.searchWrap}>
            <span className={s.searchIcon}>
              <FontAwesomeIcon icon={faSearch} />
            </span>
            <input
              className={s.searchInput}
              placeholder="Search event name, venue, year..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <button
            className={s.refreshBtn}
            onClick={() => dispatch(fetchHistory())}
            title="Reload latest event history"
          >
            <FontAwesomeIcon icon={faRotateRight} spin={loading} />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {results.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={s.empty}>
          <span className={s.emptyIcon}>
            <FontAwesomeIcon icon={faSearch} style={{ color: 'var(--muted)' }} />
          </span>
          <p>
            {query.trim() || categoryFilter !== 'All'
              ? `No event matching your filters was found.`
              : `No event history records available yet.`}
          </p>
        </motion.div>
      ) : (
        <>
          <div className={s.resultsBar}>
            <span className={s.resultsCount}>
              {results.length} edition{results.length !== 1 ? 's' : ''}{' '}
              {query.trim() || categoryFilter !== 'All' ? 'found' : 'recorded'}
            </span>
            <button className={s.downloadAllBtn} onClick={downloadAllResults}>
              <FontAwesomeIcon icon={faDownload} style={{ marginRight: '6px' }} /> Download all as CSV
            </button>
          </div>

          <motion.div
            className={s.list}
            initial="hidden"
            animate="show"
            variants={{
              hidden: { opacity: 0 },
              show: { opacity: 1, transition: { staggerChildren: 0.05 } },
            }}
          >
            {results.map((edition) => {
              const editionId = edition.id || edition._id || edition.histId
              const isOpen = expandedId === editionId
              const participants = edition.participants || []
              const winners = edition.winners || []
              const subCats =
                Array.isArray(edition.subCategories) && edition.subCategories.length > 0
                  ? edition.subCategories
                  : ['General']

              return (
                <motion.div
                  key={editionId}
                  className={s.card}
                  variants={{
                    hidden: { opacity: 0, y: 15 },
                    show: { opacity: 1, y: 0, transition: { type: 'spring', damping: 20 } },
                  }}
                >
                  <div
                    className={s.cardHead}
                    onClick={() => setExpandedId(isOpen ? null : editionId)}
                  >
                    <span className={s.cardEmoji}>
                      {edition.emoji && ICON_MAP[edition.emoji] ? (
                        <FontAwesomeIcon icon={ICON_MAP[edition.emoji]} />
                      ) : (
                        CATEGORY_ICONS[edition.category] || <FontAwesomeIcon icon={faIcons} />
                      )}
                    </span>
                    <div className={s.cardHeadText}>
                      <div className={s.cardTitle}>
                        {edition.eventName}{' '}
                        <span className={s.yearPill}>{edition.year}</span>
                      </div>
                      <div className={s.cardMeta}>
                        {formatDate(edition.date)} · {edition.venue || 'Campus'} ·{' '}
                        {edition.category}
                      </div>
                    </div>
                    <div className={s.cardStats}>
                      <span className={s.statChip}>
                        <FontAwesomeIcon icon={faUsers} style={{ color: 'var(--gold-dk)' }} />{' '}
                        {participants.length} participants
                      </span>
                      <span className={s.statChip}>
                        <FontAwesomeIcon icon={faTrophy} style={{ color: 'var(--gold-dk)' }} />{' '}
                        {winners.length} winners
                      </span>
                    </div>
                    <button
                      className={s.downloadBtn}
                      onClick={(e) => {
                        e.stopPropagation()
                        downloadEdition(edition)
                      }}
                      title="Download this edition as CSV"
                    >
                      <FontAwesomeIcon icon={faDownload} />
                    </button>
                    <span className={s.chevron}>
                      <FontAwesomeIcon icon={isOpen ? faChevronUp : faChevronDown} />
                    </span>
                  </div>

                  {isOpen && (
                    <div className={s.cardBody}>
                      {/* WINNERS SECTION */}
                      <div className={s.section}>
                        <h4 className={s.sectionTitle}>
                          <FontAwesomeIcon
                            icon={faTrophy}
                            style={{ color: 'var(--gold-dk)', marginRight: '6px' }}
                          />{' '}
                          Winners
                        </h4>
                        {winners.length === 0 ? (
                          <div className={s.emptyNotice}>
                            <FontAwesomeIcon icon={faTrophy} style={{ marginRight: '8px' }} />
                            Results have not been declared yet for this edition.
                          </div>
                        ) : (
                          <div className={s.winnerGrid}>
                            {subCats.map((sub) => {
                              const subWinners = winners.filter(
                                (w) => (w.subCategory || '').toLowerCase() === sub.toLowerCase()
                              )
                              return (
                                <div key={sub} className={s.subCard}>
                                  <div className={s.subCardTitle}>{sub}</div>
                                  {subWinners.length > 0 ? (
                                    subWinners.map((w, idx) => (
                                      <div key={`${w.rank || idx}-${w.name}`} className={s.winnerRow}>
                                        <span className={s.medal}>
                                          <FontAwesomeIcon
                                            icon={faMedal}
                                            style={{
                                              color:
                                                w.rank === 1
                                                  ? '#e2c97e'
                                                  : w.rank === 2
                                                  ? '#d1d5db'
                                                  : '#f97316',
                                            }}
                                          />
                                        </span>
                                        <span className={s.winnerName}>{w.name}</span>
                                        <span className={s.winnerDept}>{w.department}</span>
                                      </div>
                                    ))
                                  ) : (
                                    <div style={{ fontSize: '11px', color: 'var(--muted)', fontStyle: 'italic', padding: '4px 0' }}>
                                      No winners for this subcategory
                                    </div>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>

                      {/* PARTICIPANTS SECTION */}
                      <div className={s.section}>
                        <h4 className={s.sectionTitle}>
                          <FontAwesomeIcon
                            icon={faUsers}
                            style={{ color: 'var(--gold-dk)', marginRight: '6px' }}
                          />{' '}
                          Participants ({participants.length})
                        </h4>
                        {participants.length === 0 ? (
                          <div className={s.emptyNotice}>
                            <FontAwesomeIcon icon={faUsers} style={{ marginRight: '8px' }} />
                            No participants registered for this event yet.
                          </div>
                        ) : (
                          <div className={s.tableWrap}>
                            <table className={s.table}>
                              <thead>
                                <tr>
                                  <th>Name</th>
                                  <th>Register No.</th>
                                  <th>Department</th>
                                  <th>Sub-Category</th>
                                </tr>
                              </thead>
                              <tbody>
                                {participants.map((p, i) => (
                                  <tr key={`${p.regNo || p.name}-${i}`}>
                                    <td>{p.name}</td>
                                    <td>{p.regNo || '—'}</td>
                                    <td>{p.department || '—'}</td>
                                    <td>{p.subCategory || 'General'}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              )
            })}
          </motion.div>
        </>
      )}
    </div>
  )
}
