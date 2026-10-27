import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { openModal } from '../store/slices/uiSlice'
import usePageTitle from '../hooks/usePageTitle'
import { motion, AnimatePresence } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrophy, faMedal } from '@fortawesome/free-solid-svg-icons'
import s from './Results.module.css'

const RANK_STYLES = {
  1: { bg: 'linear-gradient(135deg, #c9a84c22, #c9a84c11)', border: 'rgba(201,168,76,0.4)', color: '#e2c97e', label: 'Gold' },
  2: { bg: 'linear-gradient(135deg, #9ca3af22, #9ca3af11)', border: 'rgba(156,163,175,0.4)', color: '#d1d5db', label: 'Silver' },
  3: { bg: 'linear-gradient(135deg, #b4581222, #b4581211)', border: 'rgba(180,88,18,0.4)',   color: '#f97316', label: 'Bronze' },
}

export default function Results() {
  usePageTitle('Results')
  const dispatch = useDispatch()
  const results = useSelector(st => st.results.list)
  const isAdmin = useSelector(st => st.auth.role === 'admin')
  const [expandedDept, setExpandedDept] = useState(null)

  // Compute department tally from all results
  const deptTally = {}
  results.forEach(r => {
    r.winners.forEach(w => {
      if (!w.department) return
      if (!deptTally[w.department]) deptTally[w.department] = { gold: 0, silver: 0, bronze: 0, total: 0 }
      if (w.rank === 1) { deptTally[w.department].gold++;   deptTally[w.department].total += 3 }
      if (w.rank === 2) { deptTally[w.department].silver++; deptTally[w.department].total += 2 }
      if (w.rank === 3) { deptTally[w.department].bronze++; deptTally[w.department].total += 1 }
    })
  })
  const leaderboard = Object.entries(deptTally)
    .map(([dept, s]) => ({ dept, ...s }))
    .sort((a, b) => b.total - a.total)

  // Every individual winner that belongs to a given department, across
  // all published results — this is what a leaderboard row expands to,
  // so "Silver × 1" is never just a number with no name behind it.
  function winnersForDept(dept) {
    const rows = []
    results.forEach(r => {
      r.winners.forEach(w => {
        if (w.department === dept) rows.push({ ...w, eventName: r.eventName, emoji: r.emoji })
      })
    })
    return rows.sort((a, b) => a.rank - b.rank)
  }

  return (
    <div className={`${s.page} page-enter`}>
      <div className={s.header}>
        <div className={s.headerLeft}>
          <p className={s.subTitle}>Published results for completed events</p>
        </div>
        {isAdmin && (
          <button className={s.publishBtn} onClick={() => dispatch(openModal({ type: 'addResult' }))}>+ Publish Results</button>
        )}
      </div>

      {/* Department leaderboard */}
      {leaderboard.length > 0 && (
        <div className={s.leaderPanel}>
          <div className={s.leaderHead}>
            <h3 className={s.leaderTitle}><FontAwesomeIcon icon={faTrophy} style={{ color: 'var(--gold-dk)', marginRight: '6px' }} /> Department Standings</h3>
            <span className={s.leaderSub}>Points: Gold=3 · Silver=2 · Bronze=1</span>
          </div>
          <div className={s.leaderTable}>
            {leaderboard.map((row, i) => {
              const isOpen = expandedDept === row.dept
              return (
                <div key={row.dept} className={s.leaderGroup}>
                  <button
                    type="button"
                    className={`${s.leaderRow} ${i === 0 ? s.leaderTop : ''} ${isOpen ? s.leaderRowOpen : ''}`}
                    onClick={() => setExpandedDept(isOpen ? null : row.dept)}
                    aria-expanded={isOpen}
                  >
                    <div className={s.leaderRank}>
                      {i === 0 ? <FontAwesomeIcon icon={faMedal} style={{ color: '#e2c97e' }} /> : i === 1 ? <FontAwesomeIcon icon={faMedal} style={{ color: '#d1d5db' }} /> : i === 2 ? <FontAwesomeIcon icon={faMedal} style={{ color: '#f97316' }} /> : `#${i+1}`}
                    </div>
                    <div className={s.leaderDept}>{row.dept}</div>
                    <div className={s.leaderMedals}>
                      <span className={s.goldMedal}><FontAwesomeIcon icon={faMedal} style={{ color: '#e2c97e' }} /> {row.gold}</span>
                      <span className={s.silverMedal}><FontAwesomeIcon icon={faMedal} style={{ color: '#d1d5db' }} /> {row.silver}</span>
                      <span className={s.bronzeMedal}><FontAwesomeIcon icon={faMedal} style={{ color: '#f97316' }} /> {row.bronze}</span>
                    </div>
                    <div className={s.leaderPts}>{row.total} <span>pts</span></div>
                    <span className={`${s.leaderChevron} ${isOpen ? s.leaderChevronOpen : ''}`}>›</span>
                  </button>

                  {isOpen && (
                    <div className={s.leaderExpand}>
                      {winnersForDept(row.dept).map((w, wi) => {
                        const rs = RANK_STYLES[w.rank]
                        return (
                          <div key={wi} className={s.leaderWinnerRow}>
                            <span className={s.leaderWinnerMedal}>
                              <FontAwesomeIcon icon={faMedal} style={{ color: rs.color }} />
                            </span>
                            <div className={s.leaderWinnerInfo}>
                              <span className={s.leaderWinnerName}>{w.name}</span>
                              <span className={s.leaderWinnerEvent}><FontAwesomeIcon icon={faTrophy} style={{ color: 'var(--gold-dk)', marginRight: '4px' }} /> {w.eventName}</span>
                            </div>
                            <span className={s.leaderWinnerRank} style={{ color: rs.color }}>{rs.label}</span>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      <motion.div 
        className={s.grid}
        initial="hidden"
        animate="show"
        variants={{
          hidden: { opacity: 0 },
          show: { opacity: 1, transition: { staggerChildren: 0.1 } }
        }}
      >
        {results.map(res => (
          <motion.div 
            key={res.id} 
            className={s.card}
            variants={{
              hidden: { opacity: 0, y: 20 },
              show: { opacity: 1, y: 0, transition: { type: 'spring', damping: 20 } }
            }}
          >
            <div className={s.cardHead}>
              <span className={s.cardEmoji}><FontAwesomeIcon icon={faTrophy} style={{ color: 'var(--gold)' }} /></span>
              <div>
                <h3 className={s.cardTitle}>{res.eventName}</h3>
                <p className={s.cardSub}>{res.winners.length} winners</p>
              </div>
            </div>

            <div className={s.goldDivider} />

            <div className={s.winners}>
              {res.winners.map(w => {
                const rs = RANK_STYLES[w.rank]
                return (
                  <div
                    key={w.rank}
                    className={s.winnerRow}
                    style={{ background: rs.bg, borderColor: rs.border }}
                  >
                    <div className={s.rankLeft}>
                      <span className={s.medal}><FontAwesomeIcon icon={faMedal} style={{ color: rs.color }} /></span>
                      <div className={s.rankLabel} style={{ color: rs.color }}>{rs.label}</div>
                    </div>
                    <div className={s.winnerInfo}>
                      <div className={s.winnerName}>{w.name}</div>
                      <div className={s.winnerDept}>{w.department}</div>
                    </div>
                    <div className={s.rankNum} style={{ color: rs.color }}>#{w.rank}</div>
                  </div>
                )
              })}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}
