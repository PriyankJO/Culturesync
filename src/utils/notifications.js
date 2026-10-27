// ============================================================
// Event Notification helpers
// Builds a live notification feed straight from the events
// state, so every reminder always shows the *real* date/time
// of the event (no hardcoded/fake data).
// ============================================================

const DAY_MS = 24 * 60 * 60 * 1000

/** Parse an event's `date` + `time` strings into a real Date object. */
export function eventDateTime(dateStr, timeStr) {
  return new Date(`${dateStr}T${timeStr || '00:00'}:00`)
}

export function formatDateLabel(dt) {
  return dt.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
}

export function formatTimeLabel(dt) {
  return dt.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true })
}

/** Human friendly "when" string — Today at 10:00 AM / Tomorrow / In 5 days ... */
export function countdownLabel(dt) {
  const diff = dt.getTime() - Date.now()
  const sameDay = dt.toDateString() === new Date().toDateString()

  if (sameDay) {
    if (diff <= 0) return 'Happening today'
    const mins = Math.floor(diff / 60000)
    const hrs = Math.floor(mins / 60)
    if (hrs === 0) return `Starts in ${Math.max(mins, 1)} min`
    return `Starts in ${hrs}h ${mins % 60}m`
  }

  if (diff <= 0) return 'Already happened'

  const days = Math.ceil(diff / DAY_MS)
  if (days === 1) return 'Tomorrow'
  if (days <= 7) return `In ${days} days`
  const weeks = Math.round(days / 7)
  if (days <= 30) return `In ${weeks} week${weeks > 1 ? 's' : ''}`
  return `In ${Math.round(days / 30)} month${Math.round(days / 30) > 1 ? 's' : ''}`
}

/**
 * Builds "winners announced" notifications from published results —
 * these always sort to the top of the feed since they have no future
 * date (they're announcements, not scheduled events).
 */
export function buildResultNotifications(results) {
  return results.map((res, i) => {
    const summary = res.winners
      .slice()
      .sort((a, b) => a.rank - b.rank)
      .map(w => `${w.name} (Rank ${w.rank})`)
      .join(' • ')

    return {
      id: `result-${res.id}`,
      kind: 'result',
      eventId: res.id,
      icon: res.emoji || 'faTrophy',
      accentColor: '#c9a84c',
      title: `${res.eventName} — Results Announced`,
      body: summary,
      winners: res.winners,
      dateLabel: 'Results Announced',
      timeLabel: '',
      countdown: 'Winners declared',
      sortKey: -1000 + i, // always pinned above upcoming events/deadlines
    }
  })
}
/**
 * Builds the notification feed from real event data:
 *  - "event"    → reminder for every event happening today or in the future
 *  - "deadline" → registration closing soon (open events only, within 3 days)
 * Sorted soonest-first.
 */
export function buildEventNotifications(events) {
  const now = Date.now()
  const notifs = []

  events.forEach(evt => {
    const dt = eventDateTime(evt.date, evt.time)
    const diff = dt.getTime() - now
    const isToday = dt.toDateString() === new Date().toDateString()

    // Event day / upcoming reminder — skip events already fully in the past
    if (diff > -DAY_MS) {
      notifs.push({
        id: `event-${evt.id}`,
        kind: isToday ? 'today' : 'event',
        eventId: evt.id,
        icon: evt.emoji || 'faIcons',
        accentColor: evt.accentColor || '#c9a84c',
        title: evt.name,
        body: `${evt.category} · ${evt.venue}`,
        dateLabel: formatDateLabel(dt),
        timeLabel: formatTimeLabel(dt),
        countdown: countdownLabel(dt),
        sortKey: dt.getTime(),
      })
    }

    // Registration deadline reminder
    if (evt.deadline && evt.status === 'open') {
      const ddl = eventDateTime(evt.deadline, '23:59')
      const ddlDiff = ddl.getTime() - now
      if (ddlDiff > 0 && ddlDiff < 3 * DAY_MS) {
        notifs.push({
          id: `deadline-${evt.id}`,
          kind: 'deadline',
          eventId: evt.id,
          icon: 'faHourglassHalf',
          accentColor: '#f06a35',
          title: `${evt.name} — registration closing soon`,
          body: `Register before the deadline`,
          dateLabel: formatDateLabel(ddl),
          timeLabel: '11:59 PM',
          countdown: countdownLabel(ddl),
          sortKey: ddl.getTime(),
        })
      }
    }
  })

  return notifs.sort((a, b) => a.sortKey - b.sortKey)
}

/**
 * Builds "Registration Confirmed" notifications for students.
 */
export function buildRegistrationNotifications(myRegistrations, events) {
  const notifs = []
  
  myRegistrations.forEach((reg, i) => {
    if (reg.status === 'confirmed' && reg.tokenNumber) {
      const event = events.find(e => e.id === reg.eventId)
      if (!event) return
      
      const allocDateStr = reg.allocatedDate || event.date
      const allocTimeStr = reg.allocatedTime || event.time
      const allocDt = eventDateTime(allocDateStr, allocTimeStr)
      const updatedAt = new Date(reg.updatedAt || reg.registeredAt || Date.now()).getTime()

      notifs.push({
        id: `reg-confirm-${reg.id}`,
        kind: 'registration',
        eventId: reg.eventId,
        icon: 'faCheckCircle',
        accentColor: '#10b981', // green
        title: `Registration Confirmed — ${reg.subCategory}`,
        body: `Token: ${reg.tokenNumber}. Venue: ${reg.allocatedVenue || event.venue}`,
        dateLabel: formatDateLabel(allocDt),
        timeLabel: formatTimeLabel(allocDt),
        countdown: 'Confirmed',
        sortKey: -500 + i // Place them after results (-1000) but before upcoming events (timestamp)
      })
    }
  })
  
  return notifs
}
