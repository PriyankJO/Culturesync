import React, { useState, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMagnifyingGlass, faXmark, faIcons, faPersonRunning, faMasksTheater, faLaptopCode } from '@fortawesome/free-solid-svg-icons'
import s from './GlobalSearch.module.css'

const CATEGORY_ICONS = {
  Festival: faIcons,
  Sports: faPersonRunning,
  Cultural: faMasksTheater,
  Technical: faLaptopCode,
}

export default function GlobalSearch({ open, onClose }) {
  const [query, setQuery] = useState('')
  const inputRef = useRef(null)
  const navigate = useNavigate()

  const events   = useSelector(st => st.events.list)
  const students = useSelector(st => st.students.list)

  useEffect(() => {
    if (open) {
      setQuery('')
      setTimeout(() => inputRef.current?.focus(), 60)
    }
  }, [open])

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose()
      // Cmd/Ctrl+K to open
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  if (!open) return null

  const q = query.trim().toLowerCase()

  const matchedEvents = q
    ? events.filter(e =>
        e.name.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q) ||
        e.venue.toLowerCase().includes(q) ||
        e.subCategories.some(sc => sc.toLowerCase().includes(q))
      ).slice(0, 5)
    : events.slice(0, 4)

  const matchedStudents = q
    ? students.filter(st =>
        st.name.toLowerCase().includes(q) ||
        st.regNo.toLowerCase().includes(q) ||
        st.department.toLowerCase().includes(q)
      ).slice(0, 4)
    : []

  const hasResults = matchedEvents.length > 0 || matchedStudents.length > 0

  function goTo(path) {
    navigate(path)
    onClose()
  }

  return (
    <div className={s.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={s.panel}>
        {/* Input */}
        <div className={s.searchBar}>
          <span className={s.searchIcon}><FontAwesomeIcon icon={faMagnifyingGlass} /></span>
          <input
            ref={inputRef}
            className={s.input}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search events, students, venues…"
          />
          {query && (
            <button className={s.clearBtn} onClick={() => setQuery('')}><FontAwesomeIcon icon={faXmark} /></button>
          )}
          <kbd className={s.escKey}>esc</kbd>
        </div>

        {/* Results */}
        <div className={s.results}>
          {matchedEvents.length > 0 && (
            <div className={s.section}>
              <div className={s.sectionLabel}>Events</div>
              {matchedEvents.map(evt => (
                <button key={evt.id} className={s.result} onClick={() => goTo('/events')}>
                  <span className={s.resultIcon} style={{ color: evt.accentColor }}>
                    <FontAwesomeIcon icon={CATEGORY_ICONS[evt.category] || faIcons} />
                  </span>
                  <div className={s.resultInfo}>
                    <span className={s.resultTitle}>{evt.name}</span>
                    <span className={s.resultSub}>{evt.category} · {evt.venue}</span>
                  </div>
                  <span
                    className={s.resultBadge}
                    style={{
                      background: evt.accentColor + '22',
                      color: evt.accentColor,
                      border: `1px solid ${evt.accentColor}44`,
                    }}
                  >
                    {evt.registered} registered
                  </span>
                </button>
              ))}
            </div>
          )}

          {matchedStudents.length > 0 && (
            <div className={s.section}>
              <div className={s.sectionLabel}>Students</div>
              {matchedStudents.map(st => (
                <button key={st.id} className={s.result} onClick={() => goTo('/students')}>
                  <span className={`${s.resultAvatar}`}
                    style={{ background: st.color === 'gold' ? '#c9a84c22' : `var(--${st.color}-bg, var(--blue-bg))`, color: `var(--${st.color}, var(--blue))` }}
                  >
                    {st.initials}
                  </span>
                  <div className={s.resultInfo}>
                    <span className={s.resultTitle}>{st.name}</span>
                    <span className={s.resultSub}>{st.regNo} · {st.department}</span>
                  </div>
                  <span className={`${s.resultBadge} ${st.status === 'active' ? s.badgeGreen : s.badgeOrange}`}>
                    {st.status}
                  </span>
                </button>
              ))}
            </div>
          )}

          {!hasResults && q && (
            <div className={s.empty}>
              <span><FontAwesomeIcon icon={faMagnifyingGlass} style={{ color: 'var(--text2)', fontSize: '24px' }} /></span>
              <p>No results for "<strong>{query}</strong>"</p>
            </div>
          )}

          {!q && (
            <div className={s.hint}>
              <span>Start typing to search events and students</span>
              <div className={s.shortcuts}>
                <span><kbd>↑↓</kbd> navigate</span>
                <span><kbd>Enter</kbd> select</span>
                <span><kbd>Esc</kbd> close</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
