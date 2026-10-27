import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { closeModal } from '../store/slices/uiSlice'
import { addEvent, editEvent, registerForEvent, incrementRegisteredCount, decrementRegisteredCount } from '../store/slices/eventsSlice'
import { addStudent, editStudent } from '../store/slices/studentsSlice'
import { addResult } from '../store/slices/resultsSlice'
import { addRegistration, removeRegistration } from '../store/slices/registrationsSlice'
import { toast } from '../store/slices/toastSlice'
import s from './Modal.module.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheckCircle, faRocket, faGraduationCap, faTrophy, faXmark, faCheck, faFloppyDisk, faPen, faCircleExclamation, faShieldHalved, faLock, faMedal, faIcons, faSeedling, faPersonRunning, faMasksTheater, faPalette, faMusic, faMicrophone, faPersonDress, faDrum, faClapperboard, faStar, faLaptop, faDesktop, faBook } from '@fortawesome/free-solid-svg-icons'

const ICON_OPTIONS = ['faIcons','faSeedling','faPersonRunning','faMasksTheater','faPalette','faMusic','faTrophy','faMicrophone','faPersonDress','faDrum','faClapperboard','faStar','faLaptop','faDesktop','faBook']
const ICON_MAP = {
  faIcons, faSeedling, faPersonRunning, faMasksTheater, faPalette, faMusic, faTrophy, faMicrophone, faPersonDress, faDrum, faClapperboard, faStar, faLaptop, faDesktop, faBook
}
const THEME_OPTIONS = [
  { value: 'generic',   label: 'Generic (Charcoal)' },
  { value: 'onam',      label: 'Onam (Warm Orange)'  },
  { value: 'sports',    label: 'Sports (Blue)'        },
  { value: 'freshers',  label: "Fresher's (Purple)"   },
  { value: 'farewell',  label: 'Farewell (Green)'     },
  { value: 'technical', label: 'Technical (Slate)'    },
]
const STATUS_OPTIONS = ['open', 'upcoming', 'planning', 'closed']
const CATEGORY_OPTIONS = ['Festival', 'Sports', 'Cultural', 'Technical']

const EMPTY_FORM = {
  name: '', category: 'Festival', status: 'planning',
  maxParticipants: '', registrationFee: '50', date: '', time: '', venue: '', deadline: '',
  subCategories: [], posterTheme: 'generic', accentColor: '#c9a84c', emoji: 'faIcons',
}

const EMPTY_STUDENT = {
  name: '', regNo: '', department: 'Computer Science',
  mobile: '', status: 'active', initials: '', color: 'gold',
}

const EMPTY_RESULT = {
  eventName: '', emoji: 'faTrophy',
  winners: [
    { rank: 1, medal: 'faMedal', name: '', department: '' },
    { rank: 2, medal: 'faMedal', name: '', department: '' },
    { rank: 3, medal: 'faMedal', name: '', department: '' },
  ],
}

const DEPARTMENTS = ['Computer Science','Commerce','Physics','Tamil','Maths','Chemistry','English','History']
const COLORS_OPT  = ['gold','orange','blue','green','purple']

export default function Modal() {
  const dispatch = useDispatch()
  const modal    = useSelector(st => st.ui.modal)
  const role     = useSelector(st => st.auth.role)
  const authUser = useSelector(st => st.auth.user)
  const isAdmin  = role === 'admin'

  const [done, setDone]             = useState(false)
  const [form, setForm]             = useState(() =>
    modal?.type === 'addEvent' && modal.payload
      ? { ...EMPTY_FORM, ...modal.payload, maxParticipants: String(modal.payload.maxParticipants ?? ''), registrationFee: String(modal.payload.registrationFee ?? '50') }
      : EMPTY_FORM
  )
  const [studentForm, setStudentForm] = useState(EMPTY_STUDENT)
  const [resultForm, setResultForm]   = useState(EMPTY_RESULT)
  const [compInput, setCompInput]   = useState('')
  const [errors, setErrors]         = useState({})

  if (!modal) return null

  const isRegister   = modal.type === 'register'
  const isAddEvent   = modal.type === 'addEvent'
  const isEditEvent  = isAddEvent && !!modal.payload?.id
  const isAddStudent = modal.type === 'addStudent'
  const isAddResult  = modal.type === 'addResult'

  function setField(key, val) {
    setForm(f => ({ ...f, [key]: val }))
    setErrors(e => ({ ...e, [key]: '' }))
  }

  function addComp() {
    const t = compInput.trim()
    if (!t || form.subCategories.includes(t)) return
    setField('subCategories', [...form.subCategories, t])
    setCompInput('')
  }

  function removeComp(sc) {
    setField('subCategories', form.subCategories.filter(x => x !== sc))
  }

  function validate() {
    const e = {}
    if (!form.name.trim())                       e.name = 'Event name is required'
    if (!form.date)                              e.date = 'Date is required'
    if (!form.time)                              e.time = 'Time is required'
    if (!form.venue.trim())                      e.venue = 'Venue is required'
    if (!form.maxParticipants || Number(form.maxParticipants) < 1) e.maxParticipants = 'Enter a valid count'
    if (!form.registrationFee || Number(form.registrationFee) < 0) e.registrationFee = 'Enter a valid fee'
    if (!form.deadline)                          e.deadline = 'Deadline is required'
    if (form.subCategories.length === 0)         e.subCategories = 'Add at least one competition'
    return e
  }

  function handleSubmit() {
    if (isRegister) {
      const subCategory = form.subCategory || modal.payload.subCategories?.[0] || 'General'
      dispatch(registerForEvent({
        eventId: modal.payload.eventId,
        subCategory,
      }))
      // Record the real participant so they show up for organisers/admin
      // in the Participants list, competition breakdown, and result entry.
      dispatch(addRegistration({
        eventId: modal.payload.eventId,
        subCategory,
        name: authUser?.name || 'Unknown Student',
        regNo: authUser?.regNo || 'N/A',
        department: authUser?.department || 'N/A',
        source: 'self',
      }))
      dispatch(toast.success('Registration confirmed! You\'re all set.'))
      setDone(true)
      return
    }

    if (!isAdmin) return
    const e = validate()
    if (Object.keys(e).length > 0) { setErrors(e); return }

    if (isEditEvent) {
      dispatch(editEvent({
        ...form,
        id: modal.payload.id,
        maxParticipants: Number(form.maxParticipants),
        registrationFee: Number(form.registrationFee),
      }))
      dispatch(toast.success(`"${form.name}" updated successfully!`))
    } else {
      dispatch(addEvent({
        ...form,
        maxParticipants: Number(form.maxParticipants),
        registrationFee: Number(form.registrationFee),
      }))
      dispatch(toast.success(`"${form.name}" published successfully!`))
    }
    setDone(true)
  }

  function handleClose() {
    dispatch(closeModal())
    setDone(false)
    setForm(EMPTY_FORM)
    setStudentForm(EMPTY_STUDENT)
    setResultForm(EMPTY_RESULT)
    setCompInput('')
    setErrors({})
  }

  /* ── REGISTER MODAL ─────────────────────────────── */
  if (isRegister) {
    return (
      <div className={s.overlay} onClick={e => e.target === e.currentTarget && handleClose()}>
        <div className={s.modal}>
          <div className={s.modalTop}>
            <div>
              <h2 className={s.modalTitle}>Register for Event</h2>
              <p className={s.modalSub}>{modal.payload?.name}</p>
            </div>
            <button className={s.closeBtn} onClick={handleClose}><FontAwesomeIcon icon={faXmark} /></button>
          </div>

          {done ? (
            <div className={s.successState}>
              <div className={s.successIcon}><FontAwesomeIcon icon={faCheckCircle} style={{ color: 'var(--green)' }} /></div>
              <h3 className={s.successTitle}>Registration Confirmed!</h3>
              <p className={s.successSub}>You're all set. A notification has been sent.</p>
              <button className={s.doneBtn} onClick={handleClose}>Done</button>
            </div>
          ) : (
            <div className={s.body}>
              <div className={s.fieldGroup}>
                <label className={s.label}>Select Competition *</label>
                <select
                  className={s.input}
                  onChange={e => setField('subCategory', e.target.value)}
                >
                  <option value="">Choose a competition…</option>
                  {(modal.payload?.subCategories || []).map(sc => (
                    <option key={sc} value={sc}>{sc}</option>
                  ))}
                </select>
              </div>
              <div className={s.row2}>
                <div className={s.fieldGroup}>
                  <label className={s.label}>Your Name</label>
                  <input className={s.input} value={authUser?.name || ''} readOnly />
                </div>
                <div className={s.fieldGroup}>
                  <label className={s.label}>Reg. Number</label>
                  <input className={s.input} value={authUser?.regNo || ''} readOnly />
                </div>
              </div>
              <div className={s.fieldGroup}>
                <label className={s.label}>Department</label>
                <input className={s.input} value={authUser?.department || ''} readOnly />
              </div>
              <div className={s.actions}>
                <button className={s.submitBtn} onClick={handleSubmit}>
                  <FontAwesomeIcon icon={faCheck} style={{ marginRight: '6px' }} /> Confirm Registration
                </button>
                <button className={s.secondaryBtn} onClick={handleClose}>Cancel</button>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  /* ── ADD EVENT MODAL ────────────────────────────── */
  return (
    <div className={s.overlay} onClick={e => e.target === e.currentTarget && handleClose()}>
      <div className={`${s.modal} ${s.modalWide}`}>

        <div className={s.modalTop}>
          <div>
            <h2 className={s.modalTitle}>{isEditEvent ? 'Edit Event' : 'Add New Event'}</h2>
            <p className={s.modalSub}>{isEditEvent ? 'Update the event details below' : 'Fill in all details to publish the event'}</p>
          </div>
          <div className={s.topRight}>
            {isAdmin
              ? <span className={s.adminBadge}><FontAwesomeIcon icon={faShieldHalved} style={{ marginRight: '4px' }} /> Admin</span>
              : <span className={s.restrictedBadge}><FontAwesomeIcon icon={faLock} style={{ marginRight: '4px' }} /> Admin Only</span>
            }
            <button className={s.closeBtn} onClick={handleClose}><FontAwesomeIcon icon={faXmark} /></button>
          </div>
        </div>

        {!isAdmin && (
          <div className={s.errorBanner}><FontAwesomeIcon icon={faCircleExclamation} style={{ marginRight: '6px' }} /> You need admin privileges to create events.</div>
        )}

        {done ? (
          <div className={s.successState}>
            <div className={s.successIcon}><FontAwesomeIcon icon={faRocket} style={{ color: 'var(--green)' }} /></div>
            <h3 className={s.successTitle}>{isEditEvent ? 'Event Updated!' : 'Event Published!'}</h3>
            <p className={s.successSub}>{isEditEvent ? 'The event details have been updated successfully.' : 'The event is now live and visible to all students.'}</p>
            <button className={s.doneBtn} onClick={handleClose}>Back to Events</button>
          </div>
        ) : (
          <div className={s.body} style={{ opacity: isAdmin ? 1 : 0.4, pointerEvents: isAdmin ? 'auto' : 'none' }}>

            {/* Section: Basic Info */}
            <div className={s.sectionLabel}>Basic Information</div>

            <div className={s.fieldGroup}>
              <label className={s.label}>Event Name *</label>
              <input
                className={`${s.input} ${errors.name ? s.inputError : ''}`}
                placeholder="e.g. Onam Celebrations 2025"
                value={form.name}
                onChange={e => setField('name', e.target.value)}
              />
              {errors.name && <span className={s.errMsg}>{errors.name}</span>}
            </div>

            <div className={s.row3}>
              <div className={s.fieldGroup}>
                <label className={s.label}>Category *</label>
                <select className={s.input} value={form.category} onChange={e => setField('category', e.target.value)}>
                  {CATEGORY_OPTIONS.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div className={s.fieldGroup}>
                <label className={s.label}>Status</label>
                <select className={s.input} value={form.status} onChange={e => setField('status', e.target.value)}>
                  {STATUS_OPTIONS.map(o => <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>)}
                </select>
              </div>
              <div className={s.fieldGroup}>
                <label className={s.label}>Reg. Fee (₹) *</label>
                <input
                  className={`${s.input} ${errors.registrationFee ? s.inputError : ''}`}
                  type="number" min="0" placeholder="50"
                  value={form.registrationFee}
                  onChange={e => setField('registrationFee', e.target.value)}
                />
                {errors.registrationFee && <span className={s.errMsg}>{errors.registrationFee}</span>}
              </div>
            </div>

            <div className={s.row2}>
              <div className={s.fieldGroup}>
                <label className={s.label}>Max Participants *</label>
                <input
                  className={`${s.input} ${errors.maxParticipants ? s.inputError : ''}`}
                  type="number" min="1" placeholder="200"
                  value={form.maxParticipants}
                  onChange={e => setField('maxParticipants', e.target.value)}
                />
                {errors.maxParticipants && <span className={s.errMsg}>{errors.maxParticipants}</span>}
              </div>
            </div>

            <div className={s.row2}>
              <div className={s.fieldGroup}>
                <label className={s.label}>Date *</label>
                <input
                  className={`${s.input} ${errors.date ? s.inputError : ''}`}
                  type="date" value={form.date}
                  onChange={e => setField('date', e.target.value)}
                />
                {errors.date && <span className={s.errMsg}>{errors.date}</span>}
              </div>
              <div className={s.fieldGroup}>
                <label className={s.label}>Time *</label>
                <input
                  className={`${s.input} ${errors.time ? s.inputError : ''}`}
                  type="time" value={form.time}
                  onChange={e => setField('time', e.target.value)}
                />
                {errors.time && <span className={s.errMsg}>{errors.time}</span>}
              </div>
            </div>

            <div className={s.row2}>
              <div className={s.fieldGroup}>
                <label className={s.label}>Venue *</label>
                <input
                  className={`${s.input} ${errors.venue ? s.inputError : ''}`}
                  placeholder="e.g. College Auditorium"
                  value={form.venue}
                  onChange={e => setField('venue', e.target.value)}
                />
                {errors.venue && <span className={s.errMsg}>{errors.venue}</span>}
              </div>
              <div className={s.fieldGroup}>
                <label className={s.label}>Registration Deadline *</label>
                <input
                  className={`${s.input} ${errors.deadline ? s.inputError : ''}`}
                  type="date" value={form.deadline}
                  onChange={e => setField('deadline', e.target.value)}
                />
                {errors.deadline && <span className={s.errMsg}>{errors.deadline}</span>}
              </div>
            </div>

            {/* Section: Competitions */}
            <div className={s.sectionLabel}>Competitions / Sub-Categories *</div>
            <div className={s.fieldGroup}>
              <div className={s.addCompRow}>
                <input
                  className={s.input}
                  placeholder="e.g. Classical Dance, 100m Sprint…"
                  value={compInput}
                  onChange={e => setCompInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addComp())}
                />
                <button className={s.addCompBtn} type="button" onClick={addComp}>+ Add</button>
              </div>
              {errors.subCategories && <span className={s.errMsg}>{errors.subCategories}</span>}
              {form.subCategories.length > 0 && (
                <div className={s.compTags}>
                  {form.subCategories.map(sc => (
                    <span key={sc} className={s.compTag}>
                      {sc}
                      <button className={s.compRemove} onClick={() => removeComp(sc)}>×</button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Section: Appearance */}
            <div className={s.sectionLabel}>Appearance</div>
            <div className={s.row2}>
              <div className={s.fieldGroup}>
                <label className={s.label}>Poster Theme</label>
                <select className={s.input} value={form.posterTheme} onChange={e => setField('posterTheme', e.target.value)}>
                  {THEME_OPTIONS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div className={s.fieldGroup}>
                <label className={s.label}>Accent Color</label>
                <div className={s.colorRow}>
                  {['#c9a84c','#e85d26','#3498db','#2ecc71','#9b59b6','#f05252','#3ecf8e'].map(c => (
                    <button
                      key={c}
                      className={`${s.colorSwatch} ${form.accentColor === c ? s.colorActive : ''}`}
                      style={{ background: c }}
                      onClick={() => setField('accentColor', c)}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className={s.fieldGroup}>
              <label className={s.label}>Event Icon</label>
              <div className={s.emojiGrid}>
                {ICON_OPTIONS.map(em => (
                  <button
                    key={em}
                    className={`${s.emojiBtn} ${form.emoji === em ? s.emojiBtnActive : ''}`}
                    onClick={() => setField('emoji', em)}
                  >
                    <FontAwesomeIcon icon={ICON_MAP[em] || faIcons} />
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className={s.actions}>
              <button className={s.submitBtn} onClick={handleSubmit}>
                {isEditEvent ? <><FontAwesomeIcon icon={faFloppyDisk} /> Save Changes</> : <><FontAwesomeIcon icon={faRocket} /> Publish Event</>}
              </button>
              <button className={s.secondaryBtn} onClick={handleClose}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── Separate named modal exports used by Students / Results pages ─────────
   They render when modal.type === 'addStudent' / 'addResult'.
   Modal.jsx is a single mount-point so we check type and render from here.
   We achieve this by having the Modal component route to sub-renders below. */

// NOTE: These are reached from the main Modal() component body via early-return.
// We attach them as properties so they can be inspected for docs but the real
// routing happens through the modal.type check in Modal().
// The lines below are intentionally placed OUTSIDE the function so they are
// importable as named exports from other files if needed.

export function AddStudentModal({ onClose, payload }) {
  const dispatch = useDispatch()
  const isEdit = !!payload?.id
  const [form, setForm] = useState({
    name: payload?.name || '', regNo: payload?.regNo || '',
    department: payload?.department || 'Computer Science',
    mobile: payload?.mobile || '', dob: payload?.dob || '',
    status: payload?.status || 'active',
    color: payload?.color || 'gold',
  })
  const [errors, setErrors] = useState({})
  const [done, setDone] = useState(false)

  function setF(k, v) { setForm(f => ({...f, [k]: v})); setErrors(e => ({...e, [k]: ''})) }

  function submit() {
    const e = {}
    if (!form.name.trim())  e.name  = 'Name is required'
    if (!form.regNo.trim()) e.regNo = 'Register number is required'
    if (!form.mobile.trim()) e.mobile = 'Mobile is required'
    if (Object.keys(e).length) { setErrors(e); return }
    const initials = form.name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase()
    if (isEdit) {
      dispatch(editStudent({ ...form, id: payload.id, initials }))
      dispatch(toast.success(`${form.name} updated successfully!`))
    } else {
      dispatch(addStudent({ ...form, initials }))
      dispatch(toast.success(`${form.name} added successfully!`))
    }
    setDone(true)
  }

  return (
    <div className={s.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={s.modal}>
        <div className={s.modalTop}>
          <div>
            <h2 className={s.modalTitle}>{isEdit ? 'Edit Student' : 'Add Student'}</h2>
            <p className={s.modalSub}>{isEdit ? 'Update this student\'s details' : 'Register a new student in the system'}</p>
          </div>
          <button className={s.closeBtn} onClick={onClose}><FontAwesomeIcon icon={faXmark} /></button>
        </div>
        {done ? (
          <div className={s.successState}>
            <div className={s.successIcon}><FontAwesomeIcon icon={faGraduationCap} style={{ color: 'var(--blue)' }} /></div>
            <h3 className={s.successTitle}>{isEdit ? 'Student Updated!' : 'Student Added!'}</h3>
            <p className={s.successSub}>{isEdit ? `${form.name}'s details have been updated.` : `${form.name} has been registered successfully.`}</p>
            <button className={s.doneBtn} onClick={onClose}>Done</button>
          </div>
        ) : (
          <div className={s.body}>
            <div className={s.row2}>
              <div className={s.fieldGroup}>
                <label className={s.label}>Full Name *</label>
                <input className={`${s.input} ${errors.name ? s.inputError : ''}`}
                  value={form.name} onChange={e => setF('name', e.target.value)}
                  placeholder="e.g. Kavitha Arumugam" />
                {errors.name && <span className={s.errMsg}>{errors.name}</span>}
              </div>
              <div className={s.fieldGroup}>
                <label className={s.label}>Register Number *</label>
                <input className={`${s.input} ${errors.regNo ? s.inputError : ''}`}
                  value={form.regNo} onChange={e => setF('regNo', e.target.value)}
                  placeholder="e.g. 21CS001" />
                {errors.regNo && <span className={s.errMsg}>{errors.regNo}</span>}
              </div>
            </div>
            <div className={s.row2}>
              <div className={s.fieldGroup}>
                <label className={s.label}>Department</label>
                <select className={s.input} value={form.department} onChange={e => setF('department', e.target.value)}>
                  {['Computer Science','Commerce','Physics','Tamil','Maths','Chemistry','English','History'].map(d =>
                    <option key={d}>{d}</option>)}
                </select>
              </div>
              <div className={s.fieldGroup}>
                <label className={s.label}>Mobile *</label>
                <input className={`${s.input} ${errors.mobile ? s.inputError : ''}`}
                  value={form.mobile} onChange={e => setF('mobile', e.target.value)}
                  placeholder="e.g. 98765 43210" />
                {errors.mobile && <span className={s.errMsg}>{errors.mobile}</span>}
              </div>
            </div>
            <div className={s.row2}>
              <div className={s.fieldGroup}>
                <label className={s.label}>Date of Birth</label>
                <input type="date" className={s.input}
                  value={form.dob} onChange={e => setF('dob', e.target.value)} />
              </div>
              <div className={s.fieldGroup}>
                <label className={s.label}>Status</label>
                <select className={s.input} value={form.status} onChange={e => setF('status', e.target.value)}>
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>
            <div className={s.row2}>
              <div className={s.fieldGroup}>
                <label className={s.label}>Avatar Color</label>
                <select className={s.input} value={form.color} onChange={e => setF('color', e.target.value)}>
                  {['gold','orange','blue','green','purple'].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className={s.actions}>
              <button className={s.submitBtn} onClick={submit}>
                {isEdit ? <><FontAwesomeIcon icon={faFloppyDisk} /> Save Changes</> : <><FontAwesomeIcon icon={faGraduationCap} /> Add Student</>}
              </button>
              <button className={s.secondaryBtn} onClick={onClose}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export function ViewStudentModal({ onClose, student }) {
  const registrations = useSelector(st => st.registrations.list)
  const events = useSelector(st => st.events.list)
  if (!student) return null
  const color = { orange:'#f06a35', blue:'#4e9af1', green:'#3ecf8e', gold:'#c9a84c', purple:'#9b7cf7' }[student.color] || '#c9a84c'

  const studentRegs = registrations.filter(r => r.regNo === student.regNo)

  return (
    <div className={s.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={`${s.modal} ${s.modalWide}`}>
        <div className={s.modalTop}>
          <div>
            <h2 className={s.modalTitle}>Student Profile</h2>
            <p className={s.modalSub}>Full registration details</p>
          </div>
          <button className={s.closeBtn} onClick={onClose}><FontAwesomeIcon icon={faXmark} /></button>
        </div>

        <div className={s.body}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
            <div
              style={{
                width: 52, height: 52, borderRadius: '50%', display: 'flex',
                alignItems: 'center', justifyContent: 'center', fontWeight: 700,
                fontSize: 16, background: color + '22', color, border: `1px solid ${color}44`,
              }}
            >
              {student.initials}
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 600 }}>{student.name}</div>
              <div style={{ fontSize: 13, color: 'var(--muted)' }}>{student.regNo}</div>
            </div>
          </div>

          <div className={s.row2}>
            <div className={s.fieldGroup}>
              <label className={s.label}>Department</label>
              <div className={s.input} style={{ pointerEvents: 'none' }}>{student.department}</div>
            </div>
            <div className={s.fieldGroup}>
              <label className={s.label}>Mobile</label>
              <div className={s.input} style={{ pointerEvents: 'none' }}>{student.mobile}</div>
            </div>
          </div>
          <div className={s.row2}>
            <div className={s.fieldGroup}>
              <label className={s.label}>Date of Birth</label>
              <div className={s.input} style={{ pointerEvents: 'none' }}>{student.dob || '—'}</div>
            </div>
            <div className={s.fieldGroup}>
              <label className={s.label}>Status</label>
              <div className={s.input} style={{ pointerEvents: 'none' }}>
                {student.status === 'active' ? 'Active' : 'Pending'}
              </div>
            </div>
          </div>
          
          <div className={s.sectionLabel} style={{ marginTop: '20px' }}>Event Registrations ({studentRegs.length})</div>
          
          {studentRegs.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {studentRegs.map(r => {
                const event = events.find(e => e.id === r.eventId)
                return (
                  <div key={r.id || r.regId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'var(--bg3)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                    <div>
                      <div style={{ fontWeight: '600', color: 'var(--text)' }}>{event?.name || r.eventId}</div>
                      <div style={{ fontSize: '13px', color: 'var(--muted)' }}>{r.subCategory}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 'bold', color: r.status === 'confirmed' ? 'var(--green)' : 'var(--orange)' }}>
                        {r.status === 'confirmed' ? (r.tokenNumber || 'Token pending') : 'Pending'}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
                        {r.paymentStatus === 'paid' ? 'Paid' : 'Unpaid'}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div style={{ padding: '20px', textAlign: 'center', background: 'var(--bg3)', borderRadius: '8px', color: 'var(--muted)' }}>
              No registrations found for this student.
            </div>
          )}

          <div className={s.actions} style={{ marginTop: '24px' }}>
            <button className={s.secondaryBtn} onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── PUBLISH RESULTS ────────────────────────────────
   Winners are picked from the REAL registered participants of the
   chosen event + competition (so names/departments can't drift from
   the actual registration data). "Not listed here" still allows a
   manual name/department entry as a fallback. */
export function AddResultModal({ onClose }) {
  const dispatch = useDispatch()
  const events = useSelector(st => st.events.list)
  const registrations = useSelector(st => st.registrations.list)

  const [eventId, setEventId] = useState('')
  const [subCategory, setSubCategory] = useState('')
  const [winners, setWinners] = useState([
    { rank: 1, medal: 'faMedal', mode: 'pick', regNo: '', name: '', department: '' },
    { rank: 2, medal: 'faMedal', mode: 'pick', regNo: '', name: '', department: '' },
    { rank: 3, medal: 'faMedal', mode: 'pick', regNo: '', name: '', department: '' },
  ])
  const [errors, setErrors] = useState({})
  const [done, setDone] = useState(false)

  const selectedEvent = events.find(ev => ev.id === eventId)
  const participants = eventId && subCategory
    ? registrations.filter(r => r.eventId === eventId && r.subCategory === subCategory)
    : []

  function handleEventChange(id) {
    setEventId(id)
    setSubCategory('')
    setErrors(e => ({ ...e, eventId: '' }))
  }

  function setWinner(idx, patch) {
    setWinners(w => {
      const next = [...w]
      next[idx] = { ...next[idx], ...patch }
      return next
    })
    setErrors(e => ({ ...e, winners: '' }))
  }

  function pickParticipant(idx, regNo) {
    const p = participants.find(x => x.regNo === regNo)
    setWinner(idx, {
      regNo,
      name: p?.name || '',
      department: p?.department || '',
    })
  }

  function submit() {
    const e = {}
    if (!eventId) e.eventId = 'Select an event'
    if (!subCategory) e.subCategory = 'Select a competition'
    if (winners.some(w => !w.name.trim() || !w.department.trim())) {
      e.winners = 'Name and department are required for all 3 winners'
    }
    if (Object.keys(e).length) { setErrors(e); return }

    dispatch(addResult({
      eventId,
      subCategory,
      eventName: `${selectedEvent.name} — ${subCategory}`,
      emoji: selectedEvent.emoji,
      winners: winners.map(({ rank, medal, name, department }) => ({ rank, medal, name, department })),
    }))
    dispatch(toast.success('Results published successfully!'))
    setDone(true)
  }

  return (
    <div className={s.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={`${s.modal} ${s.modalWide}`}>
        <div className={s.modalTop}>
          <div>
            <h2 className={s.modalTitle}>Publish Results</h2>
            <p className={s.modalSub}>Announce winners for a completed event</p>
          </div>
          <button className={s.closeBtn} onClick={onClose}><FontAwesomeIcon icon={faXmark} /></button>
        </div>
        {done ? (
          <div className={s.successState}>
            <div className={s.successIcon}><FontAwesomeIcon icon={faTrophy} style={{ color: 'var(--gold)' }} /></div>
            <h3 className={s.successTitle}>Results Published!</h3>
            <p className={s.successSub}>Winners have been announced for {selectedEvent?.name} — {subCategory}.</p>
            <button className={s.doneBtn} onClick={onClose}>Done</button>
          </div>
        ) : (
          <div className={s.body}>
            <div className={s.row2}>
              <div className={s.fieldGroup}>
                <label className={s.label}>Event *</label>
                <select
                  className={`${s.input} ${errors.eventId ? s.inputError : ''}`}
                  value={eventId}
                  onChange={e => handleEventChange(e.target.value)}
                >
                  <option value="">Select an event…</option>
                  {events.map(ev => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
                </select>
                {errors.eventId && <span className={s.errMsg}>{errors.eventId}</span>}
              </div>
              <div className={s.fieldGroup}>
                <label className={s.label}>Competition *</label>
                <select
                  className={`${s.input} ${errors.subCategory ? s.inputError : ''}`}
                  value={subCategory}
                  disabled={!selectedEvent}
                  onChange={e => { setSubCategory(e.target.value); setErrors(er => ({ ...er, subCategory: '' })) }}
                >
                  <option value="">Select…</option>
                  {selectedEvent?.subCategories.map(sc => <option key={sc} value={sc}>{sc}</option>)}
                </select>
                {errors.subCategory && <span className={s.errMsg}>{errors.subCategory}</span>}
              </div>
            </div>

            <div className={s.sectionLabel}>Winners</div>
            {subCategory && participants.length === 0 && (
              <p className={s.errMsg} style={{ marginBottom: 8 }}>
                No registered participants for this competition yet — you can still enter winners manually below.
              </p>
            )}
            {errors.winners && <span className={s.errMsg}>{errors.winners}</span>}

            {winners.map((w, i) => (
              <div key={i} className={s.row2} style={{ alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 22 }}>
                    <FontAwesomeIcon icon={faMedal} style={{ color: i === 0 ? 'var(--gold)' : i === 1 ? '#c0c0c0' : '#cd7f32' }} />
                  </span>
                  <div className={s.fieldGroup} style={{ flex: 1 }}>
                    <label className={s.label}>{['1st', '2nd', '3rd'][i]} Place</label>
                    {w.mode === 'pick' ? (
                      <select
                        className={s.input}
                        value={w.regNo}
                        disabled={!subCategory}
                        onChange={e => {
                          if (e.target.value === '__manual__') {
                            setWinner(i, { mode: 'manual', regNo: '', name: '', department: '' })
                          } else {
                            pickParticipant(i, e.target.value)
                          }
                        }}
                      >
                        <option value="">Choose participant…</option>
                        {participants.map(p => (
                          <option key={p.regNo} value={p.regNo}>{p.name} · {p.regNo}</option>
                        ))}
                        <option value="__manual__">+ Not listed here — type manually</option>
                      </select>
                    ) : (
                      <input
                        className={s.input}
                        value={w.name}
                        onChange={e => setWinner(i, { name: e.target.value })}
                        placeholder="Student name"
                      />
                    )}
                  </div>
                </div>
                <div className={s.fieldGroup}>
                  <label className={s.label}>Department</label>
                  {w.mode === 'pick' ? (
                    <div className={s.input} style={{ pointerEvents: 'none', opacity: w.department ? 1 : 0.5 }}>
                      {w.department || '—'}
                    </div>
                  ) : (
                    <select className={s.input} value={w.department}
                      onChange={e => setWinner(i, { department: e.target.value })}>
                      <option value="">Select…</option>
                      {['Computer Science', 'Commerce', 'Physics', 'Tamil', 'Maths', 'Chemistry', 'English', 'History'].map(d =>
                        <option key={d}>{d}</option>)}
                    </select>
                  )}
                </div>
              </div>
            ))}

            <div className={s.actions}>
              <button className={s.submitBtn} onClick={submit}><FontAwesomeIcon icon={faTrophy} style={{ marginRight: '6px' }} /> Publish Results</button>
              <button className={s.secondaryBtn} onClick={onClose}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/* ── ADD PARTICIPANT ────────────────────────────────
   Lets an admin/organiser register a student for a specific event —
   either picking an existing student from the Students directory, or
   entering a brand-new student on the spot (who also gets added to
   the Students directory so they show up there too). */
export function AddParticipantModal({ onClose, event }) {
  const dispatch = useDispatch()
  const students = useSelector(st => st.students.list)
  const registrations = useSelector(st => st.registrations.list)

  const [mode, setMode] = useState('existing') // 'existing' | 'new'
  const [studentId, setStudentId] = useState('')
  const [subCategory, setSubCategory] = useState(event?.subCategories?.[0] || '')
  const [newStudent, setNewStudent] = useState({ name: '', regNo: '', department: 'Computer Science', mobile: '' })
  const [errors, setErrors] = useState({})
  const [done, setDone] = useState(false)
  const [addedName, setAddedName] = useState('')

  if (!event) return null

  const alreadyRegistered = (regNo) =>
    registrations.some(r => r.eventId === event.id && r.subCategory === subCategory && r.regNo === regNo)

  function submit() {
    const e = {}
    if (!subCategory) e.subCategory = 'Select a competition'

    let participant = null
    if (mode === 'existing') {
      if (!studentId) e.studentId = 'Select a student'
      else participant = students.find(st => st.id === studentId)
    } else {
      if (!newStudent.name.trim()) e.name = 'Name is required'
      if (!newStudent.regNo.trim()) e.regNo = 'Register number is required'
      if (Object.keys(e).length === 0) participant = newStudent
    }

    if (Object.keys(e).length) { setErrors(e); return }

    if (participant && alreadyRegistered(participant.regNo)) {
      dispatch(toast.warning(`${participant.name} is already registered for "${subCategory}".`))
      return
    }

    dispatch(addRegistration({
      eventId: event.id,
      subCategory,
      name: participant.name,
      regNo: participant.regNo,
      department: participant.department,
      source: 'admin',
    }))
    dispatch(incrementRegisteredCount(event.id))

    // Brand-new students also get added to the Students directory.
    if (mode === 'new') {
      const exists = students.some(st => st.regNo.toLowerCase() === newStudent.regNo.trim().toLowerCase())
      if (!exists) {
        const initials = newStudent.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
        dispatch(addStudent({ ...newStudent, initials, status: 'active', color: 'gold' }))
      }
    }

    setAddedName(participant.name)
    dispatch(toast.success(`${participant.name} added to "${event.name}".`))
    setDone(true)
  }

  function reset() {
    setMode('existing'); setStudentId(''); setNewStudent({ name: '', regNo: '', department: 'Computer Science', mobile: '' })
    setErrors({}); setDone(false); setAddedName('')
  }

  function handleClose() { reset(); onClose() }

  return (
    <div className={s.overlay} onClick={e => e.target === e.currentTarget && handleClose()}>
      <div className={s.modal}>
        <div className={s.modalTop}>
          <div>
            <h2 className={s.modalTitle}>Add Participant</h2>
            <p className={s.modalSub}><FontAwesomeIcon icon={ICON_MAP[event.emoji] || faIcons} style={{ marginRight: '6px' }} /> {event.name}</p>
          </div>
          <button className={s.closeBtn} onClick={handleClose}><FontAwesomeIcon icon={faXmark} /></button>
        </div>

        {done ? (
          <div className={s.successState}>
            <div className={s.successIcon}><FontAwesomeIcon icon={faGraduationCap} style={{ color: 'var(--blue)' }} /></div>
            <h3 className={s.successTitle}>Participant Added!</h3>
            <p className={s.successSub}>{addedName} is now registered for {subCategory}.</p>
            <div className={s.actions}>
              <button className={s.submitBtn} onClick={reset}>+ Add Another</button>
              <button className={s.secondaryBtn} onClick={handleClose}>Done</button>
            </div>
          </div>
        ) : (
          <div className={s.body}>
            <div className={s.fieldGroup}>
              <label className={s.label}>Competition *</label>
              <select
                className={`${s.input} ${errors.subCategory ? s.inputError : ''}`}
                value={subCategory}
                onChange={e => { setSubCategory(e.target.value); setErrors(er => ({ ...er, subCategory: '' })) }}
              >
                <option value="">Select…</option>
                {event.subCategories.map(sc => <option key={sc} value={sc}>{sc}</option>)}
              </select>
              {errors.subCategory && <span className={s.errMsg}>{errors.subCategory}</span>}
            </div>

            <div className={s.sectionLabel} style={{ marginTop: 4 }}>Student</div>
            <div className={s.roleSelectorRow}>
              <button
                type="button"
                className={`${s.modeTab} ${mode === 'existing' ? s.modeTabActive : ''}`}
                onClick={() => setMode('existing')}
              >
                From Students directory
              </button>
              <button
                type="button"
                className={`${s.modeTab} ${mode === 'new' ? s.modeTabActive : ''}`}
                onClick={() => setMode('new')}
              >
                + New student
              </button>
            </div>

            {mode === 'existing' ? (
              <div className={s.fieldGroup}>
                <label className={s.label}>Select Student *</label>
                <select
                  className={`${s.input} ${errors.studentId ? s.inputError : ''}`}
                  value={studentId}
                  onChange={e => { setStudentId(e.target.value); setErrors(er => ({ ...er, studentId: '' })) }}
                >
                  <option value="">Choose a student…</option>
                  {students.map(st => (
                    <option key={st.id} value={st.id}>{st.name} · {st.regNo} · {st.department}</option>
                  ))}
                </select>
                {errors.studentId && <span className={s.errMsg}>{errors.studentId}</span>}
              </div>
            ) : (
              <>
                <div className={s.row2}>
                  <div className={s.fieldGroup}>
                    <label className={s.label}>Full Name *</label>
                    <input className={`${s.input} ${errors.name ? s.inputError : ''}`}
                      value={newStudent.name}
                      onChange={e => setNewStudent(f => ({ ...f, name: e.target.value }))}
                      placeholder="e.g. Kavitha Arumugam" />
                    {errors.name && <span className={s.errMsg}>{errors.name}</span>}
                  </div>
                  <div className={s.fieldGroup}>
                    <label className={s.label}>Register Number *</label>
                    <input className={`${s.input} ${errors.regNo ? s.inputError : ''}`}
                      value={newStudent.regNo}
                      onChange={e => setNewStudent(f => ({ ...f, regNo: e.target.value }))}
                      placeholder="e.g. 22CS099" />
                    {errors.regNo && <span className={s.errMsg}>{errors.regNo}</span>}
                  </div>
                </div>
                <div className={s.row2}>
                  <div className={s.fieldGroup}>
                    <label className={s.label}>Department</label>
                    <select className={s.input} value={newStudent.department}
                      onChange={e => setNewStudent(f => ({ ...f, department: e.target.value }))}>
                      {['Computer Science', 'Commerce', 'Physics', 'Tamil', 'Maths', 'Chemistry', 'English', 'History'].map(d =>
                        <option key={d}>{d}</option>)}
                    </select>
                  </div>
                  <div className={s.fieldGroup}>
                    <label className={s.label}>Mobile</label>
                    <input className={s.input}
                      value={newStudent.mobile}
                      onChange={e => setNewStudent(f => ({ ...f, mobile: e.target.value }))}
                      placeholder="Optional" />
                  </div>
                </div>
              </>
            )}

            <div className={s.actions}>
              <button className={s.submitBtn} onClick={submit}><FontAwesomeIcon icon={faGraduationCap} style={{ marginRight: '6px' }} /> Add to Event</button>
              <button className={s.secondaryBtn} onClick={handleClose}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
