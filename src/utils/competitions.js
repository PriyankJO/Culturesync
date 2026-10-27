// ============================================================
// Competition Invitation helpers.
//
// Status is never stored — it is always computed live from the
// parent event's date/time/venue/deadline plus the competition's
// own registrationOpensOn + maxParticipants, so an admin edit to
// the event instantly updates every invitation built on it.
// ============================================================
import { formatDateLabel, formatTimeLabel, countdownLabel, eventDateTime } from './notifications'

export function getCompetitionRegisteredCount(eventId, subCategory, registrations, comp) {
  if (comp && typeof comp.registered === 'number') {
    return comp.registered;
  }
  return (registrations || []).filter(r => r.eventId === eventId && r.subCategory === subCategory).length
}



/**
 * Returns { code, label, full } where code is one of:
 * draft | published | open | closing | closed | completed | cancelled
 */
export function computeInvitationStatus({ competition, event, registeredCount = 0 }) {
  if (!competition) return { code: 'draft', label: 'Draft', full: false }
  if (competition.status === 'cancelled') return { code: 'cancelled', label: 'Competition Cancelled', full: false }
  if (competition.status === 'draft') return { code: 'draft', label: 'Draft', full: false }
  if (!event) return { code: 'draft', label: 'Draft', full: false }

  const now = Date.now()
  const eventDt = eventDateTime(event.date, event.time).getTime()
  const opensDt = competition.registrationOpensOn
    ? new Date(`${competition.registrationOpensOn}T00:00:00`).getTime()
    : -Infinity
  const closesDt = event.deadline
    ? new Date(`${event.deadline}T23:59:59`).getTime()
    : Infinity
  const cap = Number(competition.maxParticipants) || Infinity
  const full = registeredCount >= cap

  if (now > eventDt) return { code: 'completed', label: 'Competition Completed', full }
  if (now < opensDt) return { code: 'published', label: 'Published', full }
  if (full) return { code: 'closed', label: 'Registration Full', full: true }
  if (now > closesDt) return { code: 'closed', label: 'Registration Closed', full }
  if ((closesDt - now) <= 2 * 86400000) return { code: 'closing', label: 'Registration Closing Soon', full }
  return { code: 'open', label: 'Registration Open', full }
}

/**
 * Builds the "New Competition Available" / "Closing soon" / "Full"
 * notification feed from live competitions + events + registrations —
 * same pattern as buildEventNotifications / buildResultNotifications.
 */
export function buildCompetitionNotifications(competitions, events, registrations) {
  const now = Date.now()
  const notifs = []

  competitions.forEach(comp => {
    if (comp.status !== 'published') return
    const event = events.find(e => e.id === comp.eventId)
    if (!event) return

    const registeredCount = getCompetitionRegisteredCount(comp.eventId, comp.subCategory, registrations, comp)
    const st = computeInvitationStatus({ competition: comp, event, registeredCount })
    const dt = eventDateTime(event.date, event.time)

    if (comp.publishedAt && st.code !== 'completed') {
      const publishedDt = new Date(comp.publishedAt).getTime()
      if (now - publishedDt < 5 * 86400000) {
        notifs.push({
          id: `newcomp-${comp.id}`,
          kind: 'competition',
          competitionId: comp.id,
          icon: comp.posterEmoji || event.emoji || 'faTrophy',
          accentColor: comp.accentColor || event.accentColor,
          title: `New Competition Available — ${comp.subCategory}`,
          body: `${comp.subCategory} has been announced. Registration is open until ${event.deadline}.`,
          dateLabel: formatDateLabel(dt),
          timeLabel: formatTimeLabel(dt),
          countdown: countdownLabel(dt),
          sortKey: publishedDt,
        })
      }
    }

    if (st.code === 'closing') {
      const ddl = new Date(`${event.deadline}T23:59:59`)
      notifs.push({
        id: `closingsoon-${comp.id}`,
        kind: 'competition',
        competitionId: comp.id,
        icon: '⏳',
        accentColor: '#f06a35',
        title: `${comp.subCategory} — registration closing soon`,
        body: 'Register before the deadline.',
        dateLabel: formatDateLabel(ddl),
        timeLabel: '11:59 PM',
        countdown: countdownLabel(ddl),
        sortKey: ddl.getTime(),
      })
    }

    if (st.full && st.code === 'closed') {
      notifs.push({
        id: `full-${comp.id}`,
        kind: 'competition',
        competitionId: comp.id,
        icon: '🚫',
        accentColor: '#f05252',
        title: `${comp.subCategory} — Registration Full`,
        body: `Maximum participants (${comp.maxParticipants}) reached.`,
        dateLabel: formatDateLabel(dt),
        timeLabel: formatTimeLabel(dt),
        countdown: 'Registration full',
        sortKey: now - 1, // pin near top, just under result announcements
      })
    }
  })

  return notifs
}

/** Builds a minimal .ics calendar file's text content for "Add to Calendar". */
export function buildIcsContent(competition, event, collegeName = 'CultureSync') {
  const start = eventDateTime(event.date, event.time)
  const end = new Date(start.getTime() + 2 * 60 * 60 * 1000) // default 2hr block
  const fmt = d => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  const esc = t => String(t || '').replace(/[,;]/g, ' ').replace(/\n/g, '\\n')

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//CultureSync//Competition Invitation//EN',
    'BEGIN:VEVENT',
    `UID:${competition.id}@culturesync`,
    `DTSTAMP:${fmt(new Date())}`,
    `DTSTART:${fmt(start)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:${esc(`${competition.subCategory} — ${event.name}`)}`,
    `LOCATION:${esc(event.venue)}`,
    `DESCRIPTION:${esc(`${collegeName} — ${competition.description || competition.subCategory}`)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')
}

export function triggerFileDownload(filename, content, mime = 'text/plain;charset=utf-8;') {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
