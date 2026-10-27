// ============================================================
// Builds a per-competition (sub-category) registration
// breakdown for an event — how many students registered for
// "Flower Rangoli" vs "Dancing" vs "Singing" etc, each counted
// separately, with the FULL real participant list for each one.
//
// This reads from the live `registrations` slice (real data —
// self-registrations + admin-added participants), so it is
// always exactly correct: counts, names, and departments all
// come from the same source of truth.
// ============================================================

/**
 * @param {object} event - the event object (needs id + subCategories)
 * @param {array}  registrations - state.registrations.list
 * @returns [{ subCategory, count, participants: [{id,name,regNo,department,source}] }]
 */
export function buildSubCategoryBreakdown(event, registrations) {
  const subCats = event.subCategories?.length ? event.subCategories : ['General']
  const forEvent = (registrations || []).filter(r => r.eventId === event.id)

  return subCats.map(sc => {
    const participants = forEvent
      .filter(r => r.subCategory === sc)
      .sort((a, b) => new Date(b.registeredAt) - new Date(a.registeredAt))
    return { subCategory: sc, count: participants.length, participants }
  })
}

/** All participants registered for an event, across every sub-category. */
export function getEventParticipants(event, registrations) {
  return (registrations || [])
    .filter(r => r.eventId === event.id)
    .sort((a, b) => new Date(b.registeredAt) - new Date(a.registeredAt))
}
