import React, { useMemo, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { openModal } from '../store/slices/uiSlice'
import { registerForEvent } from '../store/slices/eventsSlice'
import { addRegistration, selectMyRegistrations } from '../store/slices/registrationsSlice'
import { publishCompetition, unpublishCompetition } from '../store/slices/competitionsSlice'
import { toast } from '../store/slices/toastSlice'
import {
  computeInvitationStatus, getCompetitionRegisteredCount,
  buildIcsContent, triggerFileDownload,
} from '../utils/competitions'
import usePageTitle from '../hooks/usePageTitle'
import { motion, AnimatePresence } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faShieldHalved, faPen, faPause, faRocket, faCheckCircle, faCalendarDay, faClock, faLocationDot, faUsers, faTicket, faFileSignature, faCheck, faLink, faPrint, faDownload, faCalendarPlus, faMedal, faStar, faGraduationCap, faPhone, faEnvelope, faMasksTheater, faPersonRunning, faLaptopCode, faIcons } from '@fortawesome/free-solid-svg-icons'
import s from './CompetitionInvitation.module.css'

const CATEGORY_ICONS = {
  Festival: <FontAwesomeIcon icon={faIcons} />,
  Sports: <FontAwesomeIcon icon={faPersonRunning} />,
  Cultural: <FontAwesomeIcon icon={faMasksTheater} />,
  Technical: <FontAwesomeIcon icon={faLaptopCode} />,
}

const COLLEGE_NAME = 'Sri Parasakthi College for Women'
const STATUS_META = {
  draft: { label: 'Draft', cls: 'stDraft' },
  published: { label: 'Published', cls: 'stPub' },
  open: { label: 'Registration Open', cls: 'stOpen' },
  closing: { label: 'Registration Closing Soon', cls: 'stClosing' },
  closed: { label: 'Registration Closed', cls: 'stClosed' },
  completed: { label: 'Competition Completed', cls: 'stDone' },
  cancelled: { label: 'Competition Cancelled', cls: 'stClosed' },
}

function buildInvitationHtml(comp, event, status, registeredCount) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${comp.subCategory} — Invitation</title>
<style>
body{font-family:Georgia,serif;background:#fff;color:#111;max-width:720px;margin:40px auto;padding:0 24px;}
h1{font-size:26px;margin-bottom:2px;} h2{font-size:14px;color:#555;font-weight:normal;margin-top:0;}
.badge{display:inline-block;padding:4px 12px;border:1px solid #c9a84c;color:#a07830;border-radius:99px;font-size:12px;margin:10px 0;}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:6px 20px;margin:16px 0;font-size:14px;}
ul{padding-left:18px;} table{border-collapse:collapse;width:100%;} td,th{border:1px solid #ccc;padding:6px 10px;font-size:13px;text-align:left;}
hr{border:none;border-top:1px solid #ddd;margin:18px 0;}
</style></head><body>
<p style="letter-spacing:2px;text-transform:uppercase;font-size:12px;color:#a07830;">${COLLEGE_NAME}</p>
<h1>${comp.subCategory}</h1>
<h2>${event.name} · CultureSync Cultural Management System</h2>
<span class="badge">${status.label}</span>
<div class="grid">
<div><strong>Date:</strong> ${event.date}</div>
<div><strong>Time:</strong> ${event.time}</div>
<div><strong>Venue:</strong> ${event.venue}</div>
<div><strong>Type:</strong> ${comp.individualOrTeam}</div>
<div><strong>Registration Deadline:</strong> ${event.deadline}</div>
<div><strong>Capacity:</strong> ${registeredCount}/${comp.maxParticipants}</div>
</div>
<p>${comp.description || ''}</p>
<hr/><h3>Rules & Regulations</h3><ul>${comp.rules.map(r => `<li>${r}</li>`).join('')}</ul>
<hr/><h3>Judging Criteria</h3>
<table><tr><th>Criteria</th><th>Weightage</th></tr>${comp.judgingCriteria.map(c => `<tr><td>${c.criteria}</td><td>${c.weightage}%</td></tr>`).join('')}</table>
<hr/><h3>Prizes</h3>
<p>🥇 First: ${comp.prizes.first || '—'} &nbsp; 🥈 Second: ${comp.prizes.second || '—'} &nbsp; 🥉 Third: ${comp.prizes.third || '—'}</p>
${comp.prizes.special ? `<p>Special Prize: ${comp.prizes.special}</p>` : ''}
<p>${comp.prizes.certificates || ''}</p>
<hr/><h3>Contact</h3>
<p>${comp.contactPerson || ''} ${comp.contactPhone ? '· ' + comp.contactPhone : ''} ${comp.contactEmail ? '· ' + comp.contactEmail : ''}</p>
</body></html>`
}

export default function CompetitionInvitation() {
  const { id } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const comp = useSelector(st => st.competitions.list.find(c => c.id === id))
  const events = useSelector(st => st.events.list)
  const registrations = useSelector(st => st.registrations.list)
  const myRegistrations = useSelector(selectMyRegistrations)
  const { role, user } = useSelector(st => st.auth)
  const isAdmin = role === 'admin'

  usePageTitle(comp ? comp.subCategory : 'Competition')

  const [justRegistered, setJustRegistered] = useState(false)

  const event = useMemo(() => events.find(e => e.id === comp?.eventId), [events, comp])
  const registeredCount = comp ? getCompetitionRegisteredCount(comp.eventId, comp.subCategory, registrations, comp) : 0
  const status = useMemo(
    () => computeInvitationStatus({ competition: comp, event, registeredCount }),
    [comp, event, registeredCount]
  )

  if (!comp || !event || (comp.status === 'draft' && !isAdmin)) {
    return (
      <div className={`${s.page} page-enter`}>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className={s.notFound}>
          <span style={{ fontSize: '48px', color: 'var(--muted)' }}><FontAwesomeIcon icon={faMasksTheater} /></span>
          <h2>Invitation not found</h2>
          <p>This competition invitation doesn't exist or hasn't been published yet.</p>
          <Link to="/competitions" className={s.backBtn}>← Back to Competitions</Link>
        </motion.div>
      </div>
    )
  }

  const meta = STATUS_META[status.code] || STATUS_META.published
  const accent = comp.accentColor || event.accentColor
  const slotsLeft = Math.max(0, (comp.maxParticipants || 0) - registeredCount)
  const myReg = myRegistrations.find(r => r.eventId === comp.eventId)
  const isRegisteredHere = myReg?.subCategory === comp.subCategory
  const isRegisteredElsewhere = myReg && !isRegisteredHere
  const canRegister = status.code === 'open' || status.code === 'closing'

  function handleRegister() {
    if (isAdmin) return
    if (isRegisteredHere) return
    if (isRegisteredElsewhere) {
      dispatch(toast.warning(`You're already registered for "${myReg.subCategory}" in this event.`))
      return
    }
    if (status.code !== 'open' && status.code !== 'closing') {
      dispatch(toast.error(status.full ? 'Registration is full for this competition.' : 'Registration is not open right now.'))
      return
    }
    const depts = comp.eligibility?.departments || []
    if (!depts.includes('All Departments') && user?.department && !depts.includes(user.department)) {
      dispatch(toast.error(`This competition is only open to: ${depts.join(', ')}.`))
      return
    }
    dispatch(openModal({ type: 'registerComp', payload: { competition: comp, event } }))
  }

  function handleShare() {
    const url = window.location.href
    if (navigator.share) {
      navigator.share({ title: `${comp.subCategory} — ${event.name}`, text: comp.description, url }).catch(() => { })
    } else {
      navigator.clipboard?.writeText(url)
      dispatch(toast.info('Invitation link copied to clipboard.'))
    }
  }

  function handlePrint() {
    window.print()
  }

  function handleDownload() {
    const html = buildInvitationHtml(comp, event, status, registeredCount)
    triggerFileDownload(`${comp.subCategory.toLowerCase().replace(/\s+/g, '-')}-invitation.html`, html, 'text/html;charset=utf-8;')
  }

  function handleCalendar() {
    const ics = buildIcsContent(comp, event, 'CultureSync')
    triggerFileDownload(`${comp.subCategory.toLowerCase().replace(/\s+/g, '-')}.ics`, ics, 'text/calendar;charset=utf-8;')
  }

  return (
    <div className={`${s.page} page-enter`}>

      {/* Admin controls */}
      {isAdmin && (
        <div className={s.adminBar}>
          <span className={s.adminTag}><FontAwesomeIcon icon={faShieldHalved} style={{ marginRight: '6px' }} /> Admin</span>
          <button className={s.adminBtn} onClick={() => dispatch(openModal({ type: 'competitionForm', payload: comp }))}><FontAwesomeIcon icon={faPen} style={{ marginRight: '6px' }} /> Edit Invitation</button>
          {comp.status === 'published'
            ? <button className={s.adminBtn} onClick={() => { dispatch(unpublishCompetition(comp.id)); dispatch(toast.info('Unpublished — now a draft.')) }}><FontAwesomeIcon icon={faPause} style={{ marginRight: '6px' }} /> Unpublish</button>
            : <button className={s.adminBtn} onClick={() => { dispatch(publishCompetition(comp.id)); dispatch(toast.success('Invitation published!')) }}><FontAwesomeIcon icon={faRocket} style={{ marginRight: '6px' }} /> Publish</button>}
        </div>
      )}

      <motion.div
        id="invitation-print-area"
        className={s.sheet}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0, transition: { type: 'spring', damping: 24, stiffness: 200 } }}
      >

        {/* Registration confirmation banner */}
        {justRegistered && (
          <div className={s.confirmBanner}>
            <FontAwesomeIcon icon={faCheckCircle} style={{ color: 'var(--gold-dk)', marginRight: '8px' }} /> You're confirmed for <strong>{comp.subCategory}</strong>! A notification has been added to your Notice Board.
          </div>
        )}

        {/* ── Poster header ───────────────────────────── */}
        <div className={s.banner} style={{ background: `linear-gradient(135deg, ${accent}2a 0%, ${accent}0a 100%)`, borderColor: accent + '44' }}>
          <span className={`${s.statusBadge} ${s[meta.cls]}`}>{meta.label}</span>
          <div className={s.collegeLine}>{COLLEGE_NAME}</div>
          <div className={s.sysLine}>CultureSync — Cultural Management System</div>
          {comp.posterImage
            ? <img src={comp.posterImage} alt={`${comp.subCategory} poster`} className={s.bannerImage} />
            : <div className={s.bannerEmoji} style={{ color: accent }}>{CATEGORY_ICONS[event.category] || <FontAwesomeIcon icon={faIcons} />}</div>}
          <h1 className={s.compName}>{comp.subCategory}</h1>
          <p className={s.eventLine}>{event.category} · {event.name}</p>

          <div className={s.quickGrid}>
            <div><span><FontAwesomeIcon icon={faCalendarDay} /></span>{new Date(event.date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
            <div><span><FontAwesomeIcon icon={faClock} /></span>{event.time}</div>
            <div><span><FontAwesomeIcon icon={faLocationDot} /></span>{event.venue}</div>
            <div><span><FontAwesomeIcon icon={faUsers} /></span>{comp.individualOrTeam}</div>
            <div><span><FontAwesomeIcon icon={faTicket} /></span>Max {comp.maxParticipants}</div>
            <div><span><FontAwesomeIcon icon={faFileSignature} /></span>Closes {event.deadline}</div>
          </div>

          {!isAdmin && (
            isRegisteredHere ? (
              <span className={s.registeredPill}><FontAwesomeIcon icon={faCheck} style={{ marginRight: '6px' }} /> You're Registered</span>
            ) : (
              <button
                className={s.registerBtn}
                disabled={!canRegister || isRegisteredElsewhere}
                style={{ background: `linear-gradient(135deg, ${accent}cc, ${accent})` }}
                onClick={handleRegister}
              >
                {isRegisteredElsewhere ? 'Registered for Another Competition' : status.full ? 'Registration Full' : 'Register Now'}
              </button>
            )
          )}
        </div>

        {/* ── Actions (hidden on print) ───────────────── */}
        <div className={s.actionsBar}>
          <button className={s.actionBtn} onClick={handleShare}><FontAwesomeIcon icon={faLink} style={{ marginRight: '6px' }} /> Share Invitation</button>
          <button className={s.actionBtn} onClick={handlePrint}><FontAwesomeIcon icon={faPrint} style={{ marginRight: '6px' }} /> Print Invitation</button>
          <button className={s.actionBtn} onClick={handleDownload}><FontAwesomeIcon icon={faDownload} style={{ marginRight: '6px' }} /> Download Invitation</button>
          <button className={s.actionBtn} onClick={handleCalendar}><FontAwesomeIcon icon={faCalendarPlus} style={{ marginRight: '6px' }} /> Add to Calendar</button>
        </div>

        {/* ── Overview ─────────────────────────────────── */}
        <section className={s.section}>
          <h3 className={s.sectionTitle}>Overview</h3>
          <p className={s.description}>{comp.description || 'No description provided yet.'}</p>
        </section>

        {/* ── Eligibility ──────────────────────────────── */}
        <section className={s.section}>
          <h3 className={s.sectionTitle}>Eligibility</h3>
          <div className={s.eligGrid}>
            <div><span className={s.eligLabel}>Departments</span><span>{(comp.eligibility?.departments || []).join(', ')}</span></div>
            <div><span className={s.eligLabel}>Year</span><span>{comp.eligibility?.year || 'All Years'}</span></div>
            <div><span className={s.eligLabel}>Type</span><span>{comp.individualOrTeam}</span></div>
          </div>
          {comp.eligibility?.other && <p className={s.eligOther}>{comp.eligibility.other}</p>}
        </section>

        {/* ── Registration ─────────────────────────────── */}
        <section className={s.section}>
          <h3 className={s.sectionTitle}>Registration</h3>
          <div className={s.regGrid}>
            <div><span className={s.eligLabel}>Opens</span><span>{comp.registrationOpensOn}</span></div>
            <div><span className={s.eligLabel}>Deadline</span><span>{event.deadline}</span></div>
            <div><span className={s.eligLabel}>Status</span><span>{meta.label}</span></div>
          </div>
          <div className={s.progressWrap}>
            <div className={s.progressInfo}>
              <strong>{registeredCount} / {comp.maxParticipants} Registered</strong>
              {status.full
                ? <span className={s.fullTag}>Registration Full</span>
                : <span>{slotsLeft} Slot{slotsLeft !== 1 ? 's' : ''} Available</span>}
            </div>
            <div className={s.progressTrack}>
              <div
                className={s.progressFill}
                style={{ width: `${Math.min(100, Math.round((registeredCount / (comp.maxParticipants || 1)) * 100))}%`, background: accent }}
              />
            </div>
          </div>
        </section>

        {/* ── Rules ────────────────────────────────────── */}
        <section className={s.section}>
          <h3 className={s.sectionTitle}>Rules & Regulations</h3>
          <ul className={s.rulesList}>
            {comp.rules.map((r, i) => <li key={i}>{r}</li>)}
          </ul>
        </section>

        {/* ── Judging criteria ─────────────────────────── */}
        <section className={s.section}>
          <h3 className={s.sectionTitle}>Judging Criteria</h3>
          <table className={s.jcTable}>
            <thead><tr><th>Criteria</th><th>Weightage</th></tr></thead>
            <tbody>
              {comp.judgingCriteria.map(c => (
                <tr key={c.id}><td>{c.criteria}</td><td>{c.weightage}</td></tr>
              ))}
              <tr className={s.jcTotal}>
                <td>Total</td>
                <td>{comp.judgingCriteria.reduce((a, c) => a + Number(c.weightage || 0), 0)}</td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* ── Prizes ───────────────────────────────────── */}
        <section className={s.section}>
          <h3 className={s.sectionTitle}>Prize Details</h3>
          <div className={s.prizeGrid}>
            <div className={s.prizeCard}><span><FontAwesomeIcon icon={faMedal} style={{ color: '#e2c97e' }} /></span><strong>First Prize</strong><p>{comp.prizes.first || '—'}</p></div>
            <div className={s.prizeCard}><span><FontAwesomeIcon icon={faMedal} style={{ color: '#d1d5db' }} /></span><strong>Second Prize</strong><p>{comp.prizes.second || '—'}</p></div>
            <div className={s.prizeCard}><span><FontAwesomeIcon icon={faMedal} style={{ color: '#f97316' }} /></span><strong>Third Prize</strong><p>{comp.prizes.third || '—'}</p></div>
            {comp.prizes.special && <div className={s.prizeCard}><span><FontAwesomeIcon icon={faStar} style={{ color: 'var(--gold-dk)' }} /></span><strong>Special Prize</strong><p>{comp.prizes.special}</p></div>}
          </div>
          {comp.prizes.certificates && <p className={s.certNote}><FontAwesomeIcon icon={faGraduationCap} style={{ marginRight: '6px', color: 'var(--gold-dk)' }} /> {comp.prizes.certificates}</p>}
        </section>

        {/* ── Contact ──────────────────────────────────── */}
        <section className={s.section}>
          <h3 className={s.sectionTitle}>Contact</h3>
          <p className={s.contactLine}>
            {comp.contactPerson}
            {comp.contactPhone && <span style={{ marginLeft: '8px' }}><FontAwesomeIcon icon={faPhone} style={{ marginRight: '4px', color: 'var(--gold-dk)' }} /> {comp.contactPhone}</span>}
            {comp.contactEmail && <span style={{ marginLeft: '8px' }}><FontAwesomeIcon icon={faEnvelope} style={{ marginRight: '4px', color: 'var(--gold-dk)' }} /> {comp.contactEmail}</span>}
          </p>
        </section>
      </motion.div>
    </div>
  )
}
