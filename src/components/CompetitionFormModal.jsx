import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { closeModal } from '../store/slices/uiSlice'
import {
  addCompetition, editCompetition, deleteCompetition,
  publishCompetition, unpublishCompetition,
} from '../store/slices/competitionsSlice'
import { editEvent } from '../store/slices/eventsSlice'
import { toast } from '../store/slices/toastSlice'
import { motion, AnimatePresence } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faTrophy, faPersonDress, faMicrophone, faPalette, faDrum, faMasksTheater,
  faDesktop, faPersonRunning, faSeedling, faClapperboard, faBook, faChampagneGlasses,
  faCircleExclamation, faXmark, faRocket, faFileLines, faCalendarDay, faClock,
  faLocationDot, faImage, faTrashCan, faMedal, faFloppyDisk, faEye, faPause
} from '@fortawesome/free-solid-svg-icons'
import modalStyles from './Modal.module.css'
import s from './CompetitionFormModal.module.css'

const DEPARTMENTS = ['Computer Science', 'Commerce', 'Physics', 'Tamil', 'Maths', 'Chemistry', 'English', 'History']
const ICON_OPTIONS = ['faTrophy', 'faPersonDress', 'faMicrophone', 'faPalette', 'faDrum', 'faMasksTheater', 'faDesktop', 'faPersonRunning', 'faSeedling', 'faClapperboard', 'faBook', 'faChampagneGlasses']

const ICON_MAP = {
  'faTrophy': faTrophy, 'faPersonDress': faPersonDress, 'faMicrophone': faMicrophone, 'faPalette': faPalette, 'faDrum': faDrum,
  'faMasksTheater': faMasksTheater, 'faDesktop': faDesktop, 'faPersonRunning': faPersonRunning, 'faSeedling': faSeedling, 'faClapperboard': faClapperboard, 'faBook': faBook, 'faChampagneGlasses': faChampagneGlasses
}

function emptyForm(eventId, subCategory) {
  return {
    eventId: eventId || '',
    subCategory: subCategory || '',
    description: '',
    individualOrTeam: 'Individual',
    departments: ['All Departments'],
    year: 'All Years',
    other: '',
    rules: [
      'Participants must report 30 minutes before the competition.',
      'Participants must carry their college ID card.',
      "Judges' decision will be final.",
    ],
    judgingCriteria: [
      { id: 'jc-1', criteria: 'Skill', weightage: 30 },
      { id: 'jc-2', criteria: 'Creativity', weightage: 25 },
      { id: 'jc-3', criteria: 'Presentation', weightage: 25 },
      { id: 'jc-4', criteria: 'Overall Performance', weightage: 20 },
    ],
    prizes: { first: '₹5,000', second: '₹3,000', third: '₹2,000', special: '', certificates: 'Certificates for all participants' },
    contactPerson: 'Cultural Committee',
    contactPhone: '',
    contactEmail: '',
    maxParticipants: '30',
    registrationOpensOn: new Date().toISOString().slice(0, 10),
    posterEmoji: 'faTrophy',
    posterImage: '',
  }
}

export default function CompetitionFormModal({ payload, onClose }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const events = useSelector(st => st.events.list)
  const isAdmin = useSelector(st => st.auth.role === 'admin')

  const isEdit = !!payload?.id
  // A slot with a known event + competition name but no invitation record
  // yet (admin clicked "Create Invitation" from a specific card) — lock
  // those two fields just like a full edit, but everything else is fresh.
  const lockNameFields = isEdit || !!(payload?.eventId && payload?.subCategory)
  const [form, setForm] = useState(() => isEdit
    ? {
        ...payload,
        departments: payload.eligibility?.departments || ['All Departments'],
        year: payload.eligibility?.year || 'All Years',
        other: payload.eligibility?.other || '',
        maxParticipants: String(payload.maxParticipants ?? ''),
        posterImage: payload.posterImage || '',
        rules: payload.rules || [],
        judgingCriteria: payload.judgingCriteria || [],
        prizes: payload.prizes || { first: '', second: '', third: '', special: '', certificates: '' },
      }
    : emptyForm(payload?.eventId, payload?.subCategory))
  const [ruleInput, setRuleInput] = useState('')
  const [jcForm, setJcForm] = useState({ criteria: '', weightage: '' })
  const [errors, setErrors] = useState({})
  const [done, setDone] = useState(null) // 'draft' | 'published'

  if (!isAdmin) {
    return (
      <motion.div className={modalStyles.overlay} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={e => e.target === e.currentTarget && onClose()}>
        <motion.div className={modalStyles.modal} initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }}>
          <div className={modalStyles.modalTop}>
            <h2 className={modalStyles.modalTitle}>Admin Only</h2>
            <button className={modalStyles.closeBtn} onClick={onClose}><FontAwesomeIcon icon={faXmark} /></button>
          </div>
          <div className={modalStyles.errorBanner}><FontAwesomeIcon icon={faCircleExclamation} style={{ marginRight: '6px' }} /> You need admin privileges to manage invitations.</div>
        </motion.div>
      </motion.div>
    )
  }

  const chosenEvent = events.find(e => e.id === form.eventId)

  function setField(key, val) {
    setForm(f => ({ ...f, [key]: val }))
    setErrors(e => ({ ...e, [key]: '' }))
  }

  function toggleDept(dept) {
    if (dept === 'All Departments') { setField('departments', ['All Departments']); return }
    setForm(f => {
      const cur = f.departments.filter(d => d !== 'All Departments')
      const next = cur.includes(dept) ? cur.filter(d => d !== dept) : [...cur, dept]
      return { ...f, departments: next.length ? next : ['All Departments'] }
    })
  }

  function addRule() {
    const t = ruleInput.trim()
    if (!t) return
    setField('rules', [...form.rules, t])
    setRuleInput('')
  }
  function removeRule(i) {
    setField('rules', form.rules.filter((_, idx) => idx !== i))
  }

  function addCriteria() {
    const c = jcForm.criteria.trim()
    const w = Number(jcForm.weightage)
    if (!c || !w) return
    setField('judgingCriteria', [...form.judgingCriteria, { id: `jc-${Date.now()}`, criteria: c, weightage: w }])
    setJcForm({ criteria: '', weightage: '' })
  }
  function removeCriteria(id) {
    setField('judgingCriteria', form.judgingCriteria.filter(c => c.id !== id))
  }
  const weightSum = form.judgingCriteria.reduce((a, c) => a + (Number(c.weightage) || 0), 0)

  function setPrize(key, val) {
    setForm(f => ({ ...f, prizes: { ...f.prizes, [key]: val } }))
  }

  function handlePosterImageUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      dispatch(toast.error('Please upload an image file (PNG or JPG).'))
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      dispatch(toast.error('Image is too large — please use a file under 5MB.'))
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      setField('posterImage', reader.result)
      dispatch(toast.success('Poster image uploaded.'))
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  function removePosterImage() {
    setField('posterImage', '')
  }

  function validate() {
    const e = {}
    if (!form.eventId) e.eventId = 'Choose the parent event'
    if (!form.subCategory.trim()) e.subCategory = 'Competition name is required'
    if (!form.maxParticipants || Number(form.maxParticipants) < 1) e.maxParticipants = 'Enter a valid capacity'
    if (!form.registrationOpensOn) e.registrationOpensOn = 'Required'
    return e
  }

  function buildPayload() {
    return {
      eventId: form.eventId,
      subCategory: form.subCategory.trim(),
      description: form.description,
      individualOrTeam: form.individualOrTeam,
      eligibility: { departments: form.departments, year: form.year, other: form.other },
      rules: form.rules,
      judgingCriteria: form.judgingCriteria,
      prizes: form.prizes,
      contactPerson: form.contactPerson,
      contactPhone: form.contactPhone,
      contactEmail: form.contactEmail,
      maxParticipants: Number(form.maxParticipants),
      registrationOpensOn: form.registrationOpensOn,
      posterEmoji: form.posterEmoji,
      posterImage: form.posterImage || '',
      accentColor: chosenEvent?.accentColor || '#c9a84c',
    }
  }

  function handleSave(publish) {
    const e = validate()
    if (Object.keys(e).length > 0) { setErrors(e); return }

    // Keep the event's own subCategories list as the single source of
    // competition names — add this one if it's new, never duplicate.
    if (chosenEvent && !chosenEvent.subCategories.includes(form.subCategory.trim())) {
      dispatch(editEvent({ id: chosenEvent.id, subCategories: [...chosenEvent.subCategories, form.subCategory.trim()] }))
    }

    const data = buildPayload()
    if (isEdit) {
      dispatch(editCompetition({ ...data, id: payload.id, status: payload.status, publishedAt: payload.publishedAt }))
      if (publish) dispatch(publishCompetition(payload.id))
      dispatch(toast.success(publish ? 'Invitation published!' : 'Invitation updated.'))
    } else {
      dispatch(addCompetition(data))
      if (publish) dispatch(publishCompetition(`comp-${data.eventId}-${data.subCategory.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`))
      dispatch(toast.success(publish ? 'Invitation published!' : 'Saved as draft.'))
    }
    setDone(publish ? 'published' : 'draft')
  }

  function handleUnpublish() {
    if (isEdit) { dispatch(unpublishCompetition(payload.id)); dispatch(toast.info('Invitation unpublished — back to draft.')) }
  }

  function handleDelete() {
    if (isEdit) { dispatch(deleteCompetition(payload.id)); dispatch(toast.info('Invitation deleted.')); onClose() }
  }

  function handlePreview() {
    const e = validate()
    if (Object.keys(e).length > 0) { setErrors(e); return }
    if (chosenEvent && !chosenEvent.subCategories.includes(form.subCategory.trim())) {
      dispatch(editEvent({ id: chosenEvent.id, subCategories: [...chosenEvent.subCategories, form.subCategory.trim()] }))
    }
    const data = buildPayload()
    if (isEdit) {
      dispatch(editCompetition({ ...data, id: payload.id, status: payload.status, publishedAt: payload.publishedAt }))
    } else {
      dispatch(addCompetition(data))
    }
    onClose()
    navigate(`/competitions/${payload?.id || `comp-${data.eventId}-${data.subCategory.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`}`)
  }

  if (done) {
    return (
      <motion.div className={modalStyles.overlay} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={e => e.target === e.currentTarget && onClose()}>
        <motion.div className={modalStyles.modal} initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <div className={modalStyles.body}>
            <div className={modalStyles.successState}>
              <div className={modalStyles.successIcon}>
                <FontAwesomeIcon icon={done === 'published' ? faRocket : faFileLines} style={{ color: done === 'published' ? 'var(--green)' : 'var(--gold)' }} />
              </div>
              <h3 className={modalStyles.successTitle}>{done === 'published' ? 'Invitation Published!' : 'Saved as Draft'}</h3>
              <p className={modalStyles.successSub}>
                {done === 'published' ? 'Students can now see and register for this competition.' : 'Publish it whenever it is ready to go live.'}
              </p>
              <button className={modalStyles.doneBtn} onClick={onClose}>Done</button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    )
  }

  return (
    <motion.div className={modalStyles.overlay} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div className={`${modalStyles.modal} ${modalStyles.modalWide}`} initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} transition={{ type: 'spring', damping: 25, stiffness: 300 }}>
        <div className={modalStyles.modalTop}>
          <div>
            <h2 className={modalStyles.modalTitle}>{isEdit ? 'Edit Invitation' : 'Create Competition Invitation'}</h2>
            <p className={modalStyles.modalSub}>{isEdit ? payload.subCategory : 'Build the invitation & registration page for a competition'}</p>
          </div>
          <div className={modalStyles.topRight}>
            {isEdit && <span className={s.statusPill} data-status={payload.status}>{payload.status}</span>}
            <button className={modalStyles.closeBtn} onClick={onClose}><FontAwesomeIcon icon={faXmark} /></button>
          </div>
        </div>

        <div className={modalStyles.body}>
          {/* Basic info */}
          <div className={modalStyles.sectionLabel}>Basic Information</div>
          <div className={modalStyles.row2}>
            <div className={modalStyles.fieldGroup}>
              <label className={modalStyles.label}>Event *</label>
              <select
                className={`${modalStyles.input} ${errors.eventId ? modalStyles.inputError : ''}`}
                value={form.eventId}
                disabled={lockNameFields}
                onChange={e => setField('eventId', e.target.value)}
              >
                <option value="">Choose an event…</option>
                {events.map(ev => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
              </select>
              {errors.eventId && <span className={modalStyles.errMsg}>{errors.eventId}</span>}
            </div>
            <div className={modalStyles.fieldGroup}>
              <label className={modalStyles.label}>Competition Name *</label>
              <input
                className={`${modalStyles.input} ${errors.subCategory ? modalStyles.inputError : ''}`}
                placeholder="e.g. Classical Dance"
                value={form.subCategory}
                disabled={lockNameFields}
                onChange={e => setField('subCategory', e.target.value)}
              />
              {errors.subCategory && <span className={modalStyles.errMsg}>{errors.subCategory}</span>}
            </div>
          </div>

          {chosenEvent && (
            <p className={s.syncNote}>
              <FontAwesomeIcon icon={faCalendarDay} style={{ color: 'var(--gold-dk)', marginRight: '4px' }} /> {chosenEvent.date} · <FontAwesomeIcon icon={faClock} style={{ color: 'var(--gold-dk)', marginRight: '4px' }} /> {chosenEvent.time} · <FontAwesomeIcon icon={faLocationDot} style={{ color: 'var(--gold-dk)', marginRight: '4px' }} /> {chosenEvent.venue} · Deadline {chosenEvent.deadline}
              <br />These come from the event and update automatically here.
            </p>
          )}

          <div className={modalStyles.row2}>
            <div className={modalStyles.fieldGroup}>
              <label className={modalStyles.label}>Individual / Team</label>
              <select className={modalStyles.input} value={form.individualOrTeam} onChange={e => setField('individualOrTeam', e.target.value)}>
                <option>Individual</option>
                <option>Team</option>
              </select>
            </div>
            <div className={modalStyles.fieldGroup}>
              <label className={modalStyles.label}>Poster Icon</label>
              <div className={s.emojiRow}>
                {ICON_OPTIONS.map(iconKey => (
                  <button key={iconKey} type="button" className={`${s.emojiBtn} ${form.posterEmoji === iconKey ? s.emojiActive : ''}`} onClick={() => setField('posterEmoji', iconKey)}>
                    <FontAwesomeIcon icon={ICON_MAP[iconKey] || faTrophy} style={{ color: form.posterEmoji === iconKey ? 'var(--gold)' : 'var(--text2)' }} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className={modalStyles.fieldGroup}>
            <label className={modalStyles.label}>Poster Image (optional)</label>
            {form.posterImage ? (
              <div className={s.posterPreviewWrap}>
                <img src={form.posterImage} alt="Poster preview" className={s.posterPreviewImg} />
                <div className={s.posterPreviewActions}>
                  <label className={s.uploadBtn}>
                    Replace image
                    <input type="file" accept="image/*" hidden onChange={handlePosterImageUpload} />
                  </label>
                  <button type="button" className={s.removeBtn} onClick={removePosterImage}><FontAwesomeIcon icon={faTrashCan} /> Remove</button>
                </div>
              </div>
            ) : (
              <label className={s.dropzone}>
                <span className={s.dropzoneIcon}><FontAwesomeIcon icon={faImage} style={{ color: 'var(--gold-lt)' }} /></span>
                <span className={s.dropzoneTitle}>Click to upload a poster image</span>
                <span className={s.dropzoneSub}>PNG or JPG, under 5MB — shown on the invitation card &amp; page instead of the icon</span>
                <input type="file" accept="image/*" hidden onChange={handlePosterImageUpload} />
              </label>
            )}
          </div>

          <div className={modalStyles.fieldGroup}>
            <label className={modalStyles.label}>Description</label>
            <textarea className={modalStyles.input} rows={3} placeholder="What is this competition about?" value={form.description} onChange={e => setField('description', e.target.value)} />
          </div>

          <div className={modalStyles.row2}>
            <div className={modalStyles.fieldGroup}>
              <label className={modalStyles.label}>Capacity (max participants) *</label>
              <input className={`${modalStyles.input} ${errors.maxParticipants ? modalStyles.inputError : ''}`} type="number" min="1" value={form.maxParticipants} onChange={e => setField('maxParticipants', e.target.value)} />
              {errors.maxParticipants && <span className={modalStyles.errMsg}>{errors.maxParticipants}</span>}
            </div>
            <div className={modalStyles.fieldGroup}>
              <label className={modalStyles.label}>Registration Opens *</label>
              <input className={`${modalStyles.input} ${errors.registrationOpensOn ? modalStyles.inputError : ''}`} type="date" value={form.registrationOpensOn} onChange={e => setField('registrationOpensOn', e.target.value)} />
              {errors.registrationOpensOn && <span className={modalStyles.errMsg}>{errors.registrationOpensOn}</span>}
            </div>
          </div>

          {/* Eligibility */}
          <div className={modalStyles.sectionLabel}>Eligibility</div>
          <div className={s.deptGrid}>
            <button type="button" className={`${s.deptChip} ${form.departments.includes('All Departments') ? s.deptChipActive : ''}`} onClick={() => toggleDept('All Departments')}>All Departments</button>
            {DEPARTMENTS.map(d => (
              <button key={d} type="button" className={`${s.deptChip} ${form.departments.includes(d) ? s.deptChipActive : ''}`} onClick={() => toggleDept(d)}>{d}</button>
            ))}
          </div>
          <div className={modalStyles.row2}>
            <div className={modalStyles.fieldGroup}>
              <label className={modalStyles.label}>Year Eligibility</label>
              <input className={modalStyles.input} placeholder="e.g. All Years" value={form.year} onChange={e => setField('year', e.target.value)} />
            </div>
            <div className={modalStyles.fieldGroup}>
              <label className={modalStyles.label}>Other Requirements</label>
              <input className={modalStyles.input} placeholder="Optional" value={form.other} onChange={e => setField('other', e.target.value)} />
            </div>
          </div>

          {/* Rules */}
          <div className={modalStyles.sectionLabel}>Rules & Regulations</div>
          <div className={modalStyles.addCompRow}>
            <input className={modalStyles.input} placeholder="Add a rule…" value={ruleInput} onChange={e => setRuleInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addRule())} />
            <button type="button" className={modalStyles.addCompBtn} onClick={addRule}>+ Add</button>
          </div>
          <ul className={s.ruleList}>
            {form.rules.map((r, i) => (
              <li key={i} className={s.ruleItem}>
                <span>{r}</span>
                <button type="button" className={s.ruleRemove} onClick={() => removeRule(i)}>×</button>
              </li>
            ))}
          </ul>

          {/* Judging criteria */}
          <div className={modalStyles.sectionLabel}>Judging Criteria</div>
          <div className={s.jcRow}>
            <input className={modalStyles.input} placeholder="Criteria (e.g. Skill)" value={jcForm.criteria} onChange={e => setJcForm(f => ({ ...f, criteria: e.target.value }))} />
            <input className={modalStyles.input} placeholder="%" type="number" min="1" max="100" value={jcForm.weightage} onChange={e => setJcForm(f => ({ ...f, weightage: e.target.value }))} />
            <button type="button" className={modalStyles.addCompBtn} onClick={addCriteria}>+ Add</button>
          </div>
          <table className={s.jcTable}>
            <tbody>
              {form.judgingCriteria.map(c => (
                <tr key={c.id}>
                  <td>{c.criteria}</td>
                  <td className={s.jcWeight}>{c.weightage}%</td>
                  <td><button type="button" className={s.ruleRemove} onClick={() => removeCriteria(c.id)}>×</button></td>
                </tr>
              ))}
              <tr className={s.jcTotalRow}>
                <td>Total</td>
                <td className={s.jcWeight} style={{ color: weightSum === 100 ? 'var(--green)' : 'var(--orange)' }}>{weightSum}%</td>
                <td />
              </tr>
            </tbody>
          </table>
          {weightSum !== 100 && <span className={modalStyles.errMsg}>Weightage should ideally total 100%.</span>}

          {/* Prizes */}
          <div className={modalStyles.sectionLabel}>Prize Details</div>
          <div className={modalStyles.row3}>
            <div className={modalStyles.fieldGroup}>
              <label className={modalStyles.label}><FontAwesomeIcon icon={faMedal} style={{ color: '#FFD700', marginRight: '4px' }} /> First Prize</label>
              <input className={modalStyles.input} value={form.prizes.first} onChange={e => setPrize('first', e.target.value)} />
            </div>
            <div className={modalStyles.fieldGroup}>
              <label className={modalStyles.label}><FontAwesomeIcon icon={faMedal} style={{ color: '#C0C0C0', marginRight: '4px' }} /> Second Prize</label>
              <input className={modalStyles.input} value={form.prizes.second} onChange={e => setPrize('second', e.target.value)} />
            </div>
            <div className={modalStyles.fieldGroup}>
              <label className={modalStyles.label}><FontAwesomeIcon icon={faMedal} style={{ color: '#CD7F32', marginRight: '4px' }} /> Third Prize</label>
              <input className={modalStyles.input} value={form.prizes.third} onChange={e => setPrize('third', e.target.value)} />
            </div>
          </div>
          <div className={modalStyles.row2}>
            <div className={modalStyles.fieldGroup}>
              <label className={modalStyles.label}>Special Prize</label>
              <input className={modalStyles.input} placeholder="Optional" value={form.prizes.special} onChange={e => setPrize('special', e.target.value)} />
            </div>
            <div className={modalStyles.fieldGroup}>
              <label className={modalStyles.label}>Certificates</label>
              <input className={modalStyles.input} value={form.prizes.certificates} onChange={e => setPrize('certificates', e.target.value)} />
            </div>
          </div>

          {/* Contact */}
          <div className={modalStyles.sectionLabel}>Contact</div>
          <div className={modalStyles.row3}>
            <div className={modalStyles.fieldGroup}>
              <label className={modalStyles.label}>Contact Person</label>
              <input className={modalStyles.input} value={form.contactPerson} onChange={e => setField('contactPerson', e.target.value)} />
            </div>
            <div className={modalStyles.fieldGroup}>
              <label className={modalStyles.label}>Phone</label>
              <input className={modalStyles.input} value={form.contactPhone} onChange={e => setField('contactPhone', e.target.value)} />
            </div>
            <div className={modalStyles.fieldGroup}>
              <label className={modalStyles.label}>Email</label>
              <input className={modalStyles.input} value={form.contactEmail} onChange={e => setField('contactEmail', e.target.value)} />
            </div>
          </div>

          {/* Actions */}
          <div className={modalStyles.actions}>
            <button className={modalStyles.submitBtn} onClick={() => handleSave(true)}>
              <FontAwesomeIcon icon={faRocket} style={{ marginRight: '6px' }} />
              {isEdit && payload.status === 'published' ? 'Save & Keep Published' : 'Publish Invitation'}
            </button>
            <button className={modalStyles.secondaryBtn} onClick={() => handleSave(false)}><FontAwesomeIcon icon={faFloppyDisk} style={{ marginRight: '4px' }} /> Save as Draft</button>
          </div>
          <div className={modalStyles.actions}>
            <button className={modalStyles.secondaryBtn} onClick={handlePreview}><FontAwesomeIcon icon={faEye} style={{ marginRight: '4px' }} /> Preview Invitation</button>
            {isEdit && payload.status === 'published' && (
              <button className={modalStyles.secondaryBtn} onClick={handleUnpublish}><FontAwesomeIcon icon={faPause} style={{ marginRight: '4px' }} /> Unpublish</button>
            )}
            {isEdit && (
              <button className={`${modalStyles.secondaryBtn} ${s.dangerBtn}`} onClick={handleDelete}><FontAwesomeIcon icon={faTrashCan} style={{ marginRight: '4px' }} /> Delete</button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
