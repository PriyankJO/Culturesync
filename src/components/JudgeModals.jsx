import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { addJudge, editJudge, setJudgeEvents } from '../store/slices/judgesSlice'
import { toast } from '../store/slices/toastSlice'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark, faScaleBalanced, faFloppyDisk, faIcons, faPersonRunning, faMasksTheater, faLaptopCode } from '@fortawesome/free-solid-svg-icons'
import modalStyles from './Modal.module.css'
import s from './JudgeModals.module.css'

const CATEGORY_ICONS = {
  Festival: faIcons,
  Sports: faPersonRunning,
  Cultural: faMasksTheater,
  Technical: faLaptopCode,
}

const EXPERTISE_OPTIONS = [
  'Dance & Performing Arts', 'Music & Singing', 'Fine Arts & Rangoli',
  'Sports', 'Debate & Literary', 'Technical / Quiz', 'General',
]

export function AddJudgeModal({ onClose, payload }) {
  const dispatch = useDispatch()
  const isEdit = !!payload?.id
  const [form, setForm] = useState({
    name: payload?.name || '',
    email: payload?.email || '',
    mobile: payload?.mobile || '',
    expertise: payload?.expertise || EXPERTISE_OPTIONS[0],
  })
  const [errors, setErrors] = useState({})
  const [done, setDone] = useState(false)

  function setF(k, v) { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })) }

  function submit() {
    const e = {}
    if (!form.name.trim())   e.name   = 'Name is required'
    if (!form.mobile.trim()) e.mobile = 'Mobile number is required'
    if (Object.keys(e).length) { setErrors(e); return }

    if (isEdit) {
      dispatch(editJudge({ ...form, id: payload.id }))
      dispatch(toast.success(`${form.name}'s details updated.`))
    } else {
      dispatch(addJudge(form))
      dispatch(toast.success(`${form.name} added as a judge.`))
    }
    setDone(true)
  }

  return (
    <div className={modalStyles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={modalStyles.modal}>
        <div className={modalStyles.modalTop}>
          <div>
            <h2 className={modalStyles.modalTitle}>{isEdit ? 'Edit Judge' : 'Add Judge'}</h2>
            <p className={modalStyles.modalSub}>
              {isEdit ? 'Update this judge\'s details' : 'Add a new judge who can score event participants'}
            </p>
          </div>
          <button className={modalStyles.closeBtn} onClick={onClose}><FontAwesomeIcon icon={faXmark} /></button>
        </div>

        {done ? (
          <div className={modalStyles.successState}>
            <div className={modalStyles.successIcon}><FontAwesomeIcon icon={faScaleBalanced} style={{ color: 'var(--gold)' }} /></div>
            <h3 className={modalStyles.successTitle}>{isEdit ? 'Judge Updated!' : 'Judge Added!'}</h3>
            <p className={modalStyles.successSub}>
              {isEdit ? `${form.name}'s details have been updated.` : `${form.name} has been added to the judges panel.`}
            </p>
            <button className={modalStyles.doneBtn} onClick={onClose}>Done</button>
          </div>
        ) : (
          <div className={modalStyles.body}>
            <div className={modalStyles.fieldGroup}>
              <label className={modalStyles.label}>Full Name *</label>
              <input
                className={`${modalStyles.input} ${errors.name ? modalStyles.inputError : ''}`}
                value={form.name}
                onChange={e => setF('name', e.target.value)}
                placeholder="e.g. Dr. Meenakshi Sundaram"
              />
              {errors.name && <span className={modalStyles.errMsg}>{errors.name}</span>}
            </div>

            <div className={modalStyles.row2}>
              <div className={modalStyles.fieldGroup}>
                <label className={modalStyles.label}>Email</label>
                <input
                  className={modalStyles.input}
                  value={form.email}
                  onChange={e => setF('email', e.target.value)}
                  placeholder="e.g. name@spc.edu.in"
                />
              </div>
              <div className={modalStyles.fieldGroup}>
                <label className={modalStyles.label}>Mobile *</label>
                <input
                  className={`${modalStyles.input} ${errors.mobile ? modalStyles.inputError : ''}`}
                  value={form.mobile}
                  onChange={e => setF('mobile', e.target.value)}
                  placeholder="e.g. 98765 43210"
                />
                {errors.mobile && <span className={modalStyles.errMsg}>{errors.mobile}</span>}
              </div>
            </div>

            <div className={modalStyles.fieldGroup}>
              <label className={modalStyles.label}>Area of Expertise</label>
              <select className={modalStyles.input} value={form.expertise} onChange={e => setF('expertise', e.target.value)}>
                {EXPERTISE_OPTIONS.map(x => <option key={x}>{x}</option>)}
              </select>
            </div>

            <div className={modalStyles.actions}>
              <button className={modalStyles.submitBtn} onClick={submit}>
                {isEdit ? <><FontAwesomeIcon icon={faFloppyDisk} /> Save Changes</> : <><FontAwesomeIcon icon={faScaleBalanced} /> Add Judge</>}
              </button>
              <button className={modalStyles.secondaryBtn} onClick={onClose}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export function AssignEventsModal({ onClose, judge, events }) {
  const dispatch = useDispatch()
  const [selected, setSelected] = useState(judge?.assignedEvents || [])

  if (!judge) return null

  function toggle(eventId) {
    setSelected(sel => sel.includes(eventId) ? sel.filter(id => id !== eventId) : [...sel, eventId])
  }

  function submit() {
    dispatch(setJudgeEvents({ judgeId: judge.id, eventIds: selected }))
    dispatch(toast.success(`${judge.name} is now assigned to ${selected.length} event${selected.length !== 1 ? 's' : ''}.`))
    onClose()
  }

  return (
    <div className={modalStyles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={modalStyles.modal}>
        <div className={modalStyles.modalTop}>
          <div>
            <h2 className={modalStyles.modalTitle}>Assign Events</h2>
            <p className={modalStyles.modalSub}>Choose which events {judge.name} will judge</p>
          </div>
          <button className={modalStyles.closeBtn} onClick={onClose}><FontAwesomeIcon icon={faXmark} /></button>
        </div>

        <div className={modalStyles.body}>
          {events.length === 0 ? (
            <p className={s.emptyNote}>No events available yet.</p>
          ) : (
            <div className={s.checkList}>
              {events.map(evt => (
                <label key={evt.id} className={s.checkRow}>
                  <input
                    type="checkbox"
                    checked={selected.includes(evt.id)}
                    onChange={() => toggle(evt.id)}
                  />
                  <span className={s.checkEmoji} style={{ color: evt.accentColor }}>
                    <FontAwesomeIcon icon={CATEGORY_ICONS[evt.category] || faIcons} />
                  </span>
                  <span className={s.checkLabel}>{evt.name}</span>
                  <span className={s.checkMeta}>{evt.category}</span>
                </label>
              ))}
            </div>
          )}

          <div className={modalStyles.actions}>
            <button className={modalStyles.submitBtn} onClick={submit}><FontAwesomeIcon icon={faFloppyDisk} style={{ marginRight: '6px' }} /> Save Assignment</button>
            <button className={modalStyles.secondaryBtn} onClick={onClose}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function AssignJudgesToEventModal({ onClose, event, judges }) {
  const dispatch = useDispatch()
  const initialSelected = judges.filter(j => j.assignedEvents?.includes(event.id)).map(j => j.id)
  const [selected, setSelected] = useState(initialSelected)

  if (!event) return null

  function toggle(judgeId) {
    setSelected(sel => sel.includes(judgeId) ? sel.filter(id => id !== judgeId) : [...sel, judgeId])
  }

  function submit() {
    // We need to update each judge whose assignment changed.
    judges.forEach(j => {
      const wasAssigned = j.assignedEvents?.includes(event.id)
      const isAssigned = selected.includes(j.id)
      if (wasAssigned !== isAssigned) {
        const newEventIds = isAssigned 
          ? [...(j.assignedEvents || []), event.id]
          : (j.assignedEvents || []).filter(id => id !== event.id)
        dispatch(setJudgeEvents({ judgeId: j.id, eventIds: newEventIds }))
      }
    })
    dispatch(toast.success(`Judges updated for ${event.name}.`))
    onClose()
  }

  return (
    <div className={modalStyles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={modalStyles.modal}>
        <div className={modalStyles.modalTop}>
          <div>
            <h2 className={modalStyles.modalTitle}>Assign Judges</h2>
            <p className={modalStyles.modalSub}>Select judges for {event.name}</p>
          </div>
          <button className={modalStyles.closeBtn} onClick={onClose}><FontAwesomeIcon icon={faXmark} /></button>
        </div>

        <div className={modalStyles.body}>
          {judges.length === 0 ? (
            <p className={s.emptyNote}>No judges available yet. Add them in the Judges panel.</p>
          ) : (
            <div className={s.checkList}>
              {judges.map(j => (
                <label key={j.id} className={s.checkRow}>
                  <input
                    type="checkbox"
                    checked={selected.includes(j.id)}
                    onChange={() => toggle(j.id)}
                  />
                  <span className={s.checkEmoji} style={{ color: 'var(--gold)' }}>
                    <FontAwesomeIcon icon={faScaleBalanced} />
                  </span>
                  <span className={s.checkLabel}>{j.name}</span>
                  <span className={s.checkMeta}>{j.expertise}</span>
                </label>
              ))}
            </div>
          )}

          <div className={modalStyles.actions}>
            <button className={modalStyles.submitBtn} onClick={submit}><FontAwesomeIcon icon={faFloppyDisk} style={{ marginRight: '6px' }} /> Save Judges</button>
            <button className={modalStyles.secondaryBtn} onClick={onClose}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  )
}
