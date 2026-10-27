
// Default certificate text layout — used when the admin hasn't customised
// the design yet. Each element is positioned with x/y as a percentage of
// the certificate canvas (0-100), anchored at its own center, so it scales
// cleanly at any size. `text` can contain tokens like {winnerName} that get
// swapped for real data when a certificate is actually generated.

export const CERTIFICATE_TOKENS = [
  { token: '{winnerName}', label: "Winner's Name" },
  { token: '{department}', label: 'Department' },
  { token: '{rankText}',   label: 'Rank (e.g. First Place)' },
  { token: '{medal}',      label: 'Medal Emoji' },
  { token: '{eventName}',  label: 'Event Name' },
  { token: '{eventEmoji}', label: 'Event Emoji' },
  { token: '{date}',       label: "Today's Date" },
]

export const DEFAULT_CERTIFICATE_LAYOUT = [
  { id: 'collegeName',      text: 'Sri Parasakthi College for Women',                          x: 50, y: 18, fontSize: 32,   bold: true,  italic: false, color: '#c9a84c', font: 'display', maxWidth: 90 },
  { id: 'instTag',          text: 'CultureSync — Cultural Affairs Committee',                   x: 50, y: 25, fontSize: 12,   bold: false, italic: false, color: '#a39b8b', font: 'body',    maxWidth: 90, letterSpacing: '0.15em', textTransform: 'uppercase' },
  { id: 'certKind',         text: 'Certificate of Achievement',                                 x: 50, y: 39, fontSize: 44,   bold: true,  italic: false, color: '#f5f5f5', font: 'display', maxWidth: 90 },
  { id: 'presentedTo',      text: 'This certificate is proudly presented to',                   x: 50, y: 47, fontSize: 15,   bold: false, italic: false, color: '#b8b4aa', font: 'body',    maxWidth: 90 },
  { id: 'winnerName',       text: '{winnerName}',                                               x: 50, y: 56, fontSize: 48,   bold: true,  italic: true,  color: '#c9a84c', font: 'display', maxWidth: 90 },
  { id: 'department',       text: '{department}',                                               x: 50, y: 64, fontSize: 14,   bold: false, italic: false, color: '#a39b8b', font: 'body',    maxWidth: 90 },
  { id: 'bodyText',         text: 'for securing {rankText} {medal} in {eventName} {eventEmoji}',x: 50, y: 73, fontSize: 17,   bold: false, italic: false, color: '#b8b4aa', font: 'body',    maxWidth: 62 },
  { id: 'coordinatorLabel', text: 'Event Coordinator',                                          x: 22, y: 90, fontSize: 11,   bold: true,  italic: false, color: '#b8b4aa', font: 'body',    maxWidth: 30, borderTop: true, letterSpacing: '0.05em', textTransform: 'uppercase' },
  { id: 'dateValue',        text: '{date}',                                                     x: 50, y: 86, fontSize: 15,   bold: false, italic: false, color: '#f5f5f5', font: 'display', maxWidth: 30 },
  { id: 'dateCaption',      text: 'Date',                                                       x: 50, y: 90, fontSize: 11,   bold: true,  italic: false, color: '#b8b4aa', font: 'body',    maxWidth: 30, borderTop: true, letterSpacing: '0.05em', textTransform: 'uppercase' },
  { id: 'principalLabel',   text: 'Principal',                                                  x: 78, y: 90, fontSize: 11,   bold: true,  italic: false, color: '#b8b4aa', font: 'body',    maxWidth: 30, borderTop: true, letterSpacing: '0.05em', textTransform: 'uppercase' },
]

const RANK_TEXT = { 1: 'First Place', 2: 'Second Place', 3: 'Third Place' }

// Builds the token → value map for one winner/event pair.
export function buildCertificateData(winner, event) {
  const today = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
  const medalColor = winner?.rank === 1 ? '#e2c97e' : winner?.rank === 2 ? '#d1d5db' : '#f97316'
  
  return {
    winnerName: winner?.name || '',
    department: winner?.department || '',
    rankText:   (winner && RANK_TEXT[winner.rank]) || `Rank ${winner?.rank ?? ''}`,
    medal:      '',
    eventName:  event?.eventName || '',
    eventEmoji: '',
    date:       today,
  }
}

// Swaps {token} placeholders in a template string for real values (can be strings or React nodes).
export function renderCertificateText(template, data) {
  if (!template) return ''
  const parts = template.split(/\{(\w+)\}/g)
  return parts.map((part, i) => {
    if (i % 2 === 1) {
      return part in data ? data[part] : `{${part}}`
    }
    return part
  })
}
