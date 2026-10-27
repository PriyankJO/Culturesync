import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { deleteJudge, setMark, selectMarkFor } from '../store/slices/judgesSlice'
import { markAttendance } from '../store/slices/registrationsSlice'
import { openModal } from '../store/slices/uiSlice'
import { toast } from '../store/slices/toastSlice'
import ConfirmDialog from '../components/ConfirmDialog'
import usePageTitle from '../hooks/usePageTitle'
import { motion, AnimatePresence } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faScaleBalanced, faSearch, faThumbtack, faPen, faTrash, faIcons, faMasksTheater, faPersonRunning, faLaptopCode } from '@fortawesome/free-solid-svg-icons'
import s from './Judges.module.css'

const CATEGORY_ICONS = {
  Festival: <FontAwesomeIcon icon={faIcons} />,
  Sports:   <FontAwesomeIcon icon={faPersonRunning} />,
  Cultural: <FontAwesomeIcon icon={faMasksTheater} />,
  Technical:<FontAwesomeIcon icon={faLaptopCode} />,
}

const AVATAR_COLORS = ['#c9a84c', '#4e9af1', '#3ecf8e', '#9b7cf7', '#f06a35']

function avatarColorFor(id) {
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

// One editable row in the marks table: attendance checkbox + score +
// optional remarks for a single participant, scored by the currently
// selected judge. Local state so typing doesn't dispatch on every
// keystroke — it commits to Redux on blur / when the checkbox flips.
function MarksRow({ participant, event, judge }) {
  const dispatch = useDispatch()
  const existingMark = useSelector(st => selectMarkFor(st, {
    eventId: event.id, subCategory: participant.subCategory, regNo: participant.regNo, judgeId: judge.id,
  }))
  const [score, setScore] = useState(existingMark?.score ?? '')
  const [remarks, setRemarks] = useState(existingMark?.remarks ?? '')

  function commitScore() {
    if (score === '' || score === null) return
    const num = Math.max(0, Math.min(100, Number(score)))
    dispatch(setMark({
      eventId: event.id, subCategory: participant.subCategory,
      regNo: participant.regNo, judgeId: judge.id, score: num, remarks,
    }))
    dispatch(toast.success(`Marks saved for ${participant.name}.`))
  }

  function toggleAttendance() {
    dispatch(markAttendance({ id: participant.id, attended: !participant.attended }))
  }

  return (
    <tr>
      <td>
        <div className={s.participantCell}>
          <div className={s.avatar} style={{ background: avatarColorFor(participant.regNo) + '22', color: avatarColorFor(participant.regNo) }}>
            {participant.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
          </div>
          <div>
            <div className={s.pName}>{participant.name}</div>
            <div className={s.pMeta}>{participant.regNo} · {participant.department}</div>
          </div>
        </div>
      </td>
      <td><span className={s.subCatChip}>{participant.subCategory}</span></td>
      <td>
        <label className={s.attendCheck}>
          <input type="checkbox" checked={!!participant.attended} onChange={toggleAttendance} />
          <span>{participant.attended ? 'Present' : 'Absent'}</span>
        </label>
      </td>
      <td>
        <input
          className={s.scoreInput}
          type="number"
          min="0"
          max="100"
          placeholder="—"
          disabled={!participant.attended}
          value={score}
          onChange={e => setScore(e.target.value)}
          onBlur={commitScore}
        />
      </td>
      <td>
        <input
          className={s.remarksInput}
          type="text"
          placeholder="Optional remarks…"
          disabled={!participant.attended}
          value={remarks}
          onChange={e => setRemarks(e.target.value)}
          onBlur={commitScore}
        />
      </td>
    </tr>
  )
}

export default function Judges() {
  usePageTitle('Judges')
  const dispatch = useDispatch()
  const judges = useSelector(st => st.judges.list)
  const events = useSelector(st => st.events.list)
  const registrations = useSelector(st => st.registrations.list)

  const [deleteTarget, setDeleteTarget] = useState(null)
  const [selectedJudgeId, setSelectedJudgeId] = useState('')
  const [selectedEventId, setSelectedEventId] = useState('')

  const selectedJudge = judges.find(j => j.id === selectedJudgeId)
  const judgeEvents = selectedJudge
    ? events.filter(e => selectedJudge.assignedEvents.includes(e.id))
    : []
  const selectedEvent = judgeEvents.find(e => e.id === selectedEventId)
  const participants = selectedEvent
    ? registrations.filter(r => r.eventId === selectedEvent.id)
    : []

  function handleJudgeChange(id) {
    setSelectedJudgeId(id)
    const judge = judges.find(j => j.id === id)
    const firstEvent = judge?.assignedEvents?.[0] || ''
    setSelectedEventId(firstEvent)
  }

  function handleDelete() {
    dispatch(deleteJudge(deleteTarget.id))
    dispatch(toast.info(`${deleteTarget.name} removed from the judges panel.`))
    if (selectedJudgeId === deleteTarget.id) { setSelectedJudgeId(''); setSelectedEventId('') }
    setDeleteTarget(null)
  }

  return (
    <div className={`${s.page} page-enter`}>

      {/* ── Judges directory ─────────────────────────────── */}
      <section className={s.section}>
        <div className={s.sectionHead}>
          <div>
            <h3 className={s.sectionTitle}>Judges Panel</h3>
            <p className={s.sectionSub}>{judges.length} judge{judges.length !== 1 ? 's' : ''} · assign them to events, then enter marks below</p>
          </div>
          <button className={s.addBtn} onClick={() => dispatch(openModal({ type: 'addJudge' }))}>+ Add Judge</button>
        </div>

        <div className={s.tableWrap}>
          <table className={s.table}>
            <thead>
              <tr>
                <th>Judge</th>
                <th>Contact</th>
                <th>Expertise</th>
                <th>Assigned Events</th>
                <th>Actions</th>
              </tr>
            </thead>
            <motion.tbody
              initial="hidden"
              animate="show"
              variants={{
                hidden: { opacity: 0 },
                show: { opacity: 1, transition: { staggerChildren: 0.05 } }
              }}
            >
              {judges.map(j => {
                const color = avatarColorFor(j.id)
                const assigned = events.filter(e => j.assignedEvents.includes(e.id))
                return (
                  <motion.tr 
                    key={j.id}
                    variants={{
                      hidden: { opacity: 0, y: 10 },
                      show: { opacity: 1, y: 0, transition: { type: 'spring', damping: 20 } }
                    }}
                  >
                    <td>
                      <div className={s.participantCell}>
                        <div className={s.avatar} style={{ background: color + '22', color, borderColor: color + '44' }}>
                          {j.name.split(' ').filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <span className={s.pName}>{j.name}</span>
                      </div>
                    </td>
                    <td>
                      <div className={s.contactCell}>
                        {j.email && <span className={s.muted}>{j.email}</span>}
                        <span className={s.muted}>{j.mobile}</span>
                      </div>
                    </td>
                    <td><span className={s.expertiseBadge}>{j.expertise}</span></td>
                    <td>
                      {assigned.length === 0 ? (
                        <span className={s.noneChip}>Not assigned</span>
                      ) : (
                        <div className={s.eventChips}>
                          {assigned.map(e => (
                            <span key={e.id} className={s.eventChip} style={{ color: e.accentColor }}>{CATEGORY_ICONS[e.category] || <FontAwesomeIcon icon={faIcons} />} {e.name}</span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td>
                      <div className={s.actions}>
                        <button
                          className={s.actionBtn}
                          title="Assign events"
                          onClick={() => dispatch(openModal({ type: 'assignJudgeEvents', payload: j.id }))}
                        ><FontAwesomeIcon icon={faThumbtack} /></button>
                        <button
                          className={s.actionBtn}
                          title="Edit"
                          onClick={() => dispatch(openModal({ type: 'addJudge', payload: j }))}
                        ><FontAwesomeIcon icon={faPen} /></button>
                        <button
                          className={s.actionBtn}
                          title="Delete"
                          onClick={() => setDeleteTarget(j)}
                        ><FontAwesomeIcon icon={faTrash} /></button>
                      </div>
                    </td>
                  </motion.tr>
                )
              })}
            </motion.tbody>
          </table>

          {judges.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={s.empty}>
              <span style={{ fontSize: '32px', color: 'var(--gold-dk)' }}><FontAwesomeIcon icon={faScaleBalanced} /></span>
              <p style={{ marginTop: '12px' }}>No judges added yet. Click "+ Add Judge" to get started.</p>
            </motion.div>
          )}
        </div>
      </section>

      {/* ── Attendance & marks entry ─────────────────────── */}
      <section className={s.section}>
        <div className={s.sectionHead}>
          <div>
            <h3 className={s.sectionTitle}>Attendance & Marks Entry</h3>
            <p className={s.sectionSub}>Pick a judge and their assigned event to mark who showed up and score them</p>
          </div>
        </div>

        <div className={s.pickerRow}>
          <div className={s.fieldGroup}>
            <label className={s.label}>Judge</label>
            <select className={s.select} value={selectedJudgeId} onChange={e => handleJudgeChange(e.target.value)}>
              <option value="">Select a judge…</option>
              {judges.map(j => <option key={j.id} value={j.id}>{j.name}</option>)}
            </select>
          </div>
          <div className={s.fieldGroup}>
            <label className={s.label}>Event</label>
            <select
              className={s.select}
              value={selectedEventId}
              onChange={e => setSelectedEventId(e.target.value)}
              disabled={!selectedJudge}
            >
              <option value="">Select an event…</option>
              {judgeEvents.map(e => <option key={e.id} value={e.id}>{e.name} ({e.category})</option>)}
            </select>
          </div>
        </div>

        {!selectedJudge && (
          <p className={s.hint}>Select a judge to see the events they've been assigned to.</p>
        )}
        {selectedJudge && judgeEvents.length === 0 && (
          <p className={s.hint}>{selectedJudge.name} isn't assigned to any events yet — use 📌 above to assign one.</p>
        )}
        {selectedEvent && (
          <div className={s.tableWrap} style={{ marginTop: 14 }}>
            <table className={s.table}>
              <thead>
                <tr>
                  <th>Participant</th>
                  <th>Competition</th>
                  <th>Attendance</th>
                  <th>Marks (/100)</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {participants.map(p => (
                  <MarksRow key={p.id} participant={p} event={selectedEvent} judge={selectedJudge} />
                ))}
              </tbody>
            </table>
            {participants.length === 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={s.empty}>
                <span style={{ fontSize: '32px', color: 'var(--muted)' }}><FontAwesomeIcon icon={faSearch} /></span>
                <p style={{ marginTop: '12px' }}>No one has registered for "{selectedEvent.name}" yet.</p>
              </motion.div>
            )}
          </div>
        )}
      </section>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Remove Judge?"
        message={`Remove ${deleteTarget?.name} from the judges panel? Their event assignments and marks will be deleted too.`}
        confirmLabel="Remove"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
