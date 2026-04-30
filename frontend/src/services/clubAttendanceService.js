/**
 * Per-club attendance service.
 * Stores attendance records in localStorage keyed by club slug,
 * simulating a data/by-clubs/<club-name>/attendance.json file.
 *
 * Record shape:
 * { name: string, emplid: string, status: 'present' | 'absent' | 'pending', date: string }
 */

const STORAGE_PREFIX = 'club-attendance-'

function getKey(clubSlug) {
    return `${STORAGE_PREFIX}${clubSlug}`
}

function generateEmplid() {
    return String(Math.floor(10000000 + Math.random() * 90000000))
}

/** Seed data for Computer Programming Club */
const CPC_SLUG = 'computer-programming-club'
const CPC_SEED = [
    { name: 'Kadidja Traore', emplid: generateEmplid(), status: 'present', date: new Date().toISOString().split('T')[0] },
    { name: 'Kyame Israel', emplid: generateEmplid(), status: 'present', date: new Date().toISOString().split('T')[0] },
    { name: 'Adrian Olivares Cruz', emplid: generateEmplid(), status: 'present', date: new Date().toISOString().split('T')[0] },
]

function ensureSeed() {
    const key = getKey(CPC_SLUG)
    const existing = window.localStorage.getItem(key)
    if (!existing) {
        window.localStorage.setItem(key, JSON.stringify(CPC_SEED))
    }
}

// Run seed on module load
ensureSeed()

/**
 * Get all attendance records for a club.
 * @param {string} clubSlug - kebab-case club id
 * @returns {Array}
 */
export function getClubAttendance(clubSlug) {
    const raw = window.localStorage.getItem(getKey(clubSlug))
    if (!raw) return []
    try {
        return JSON.parse(raw)
    } catch {
        return []
    }
}

/**
 * Add a student attendance record for a club.
 */
export function addClubAttendance(clubSlug, { name, emplid, status = 'pending', date }) {
    const records = getClubAttendance(clubSlug)
    records.push({ name, emplid: emplid || generateEmplid(), status, date: date || new Date().toISOString().split('T')[0] })
    window.localStorage.setItem(getKey(clubSlug), JSON.stringify(records))
    return records
}

/**
 * Update the status of a specific attendance record by index.
 */
export function updateAttendanceStatus(clubSlug, index, newStatus) {
    const records = getClubAttendance(clubSlug)
    if (records[index]) {
        records[index].status = newStatus
        window.localStorage.setItem(getKey(clubSlug), JSON.stringify(records))
    }
    return records
}

/**
 * Add an RSVP record for a club event.
 */
export function addRsvpRecord(clubSlug, { name, emplid, eventTitle, date }) {
    const key = `rsvp-${clubSlug}`
    let records = []
    try {
        records = JSON.parse(window.localStorage.getItem(key) || '[]')
    } catch { /* ignore */ }
    records.push({ name, emplid: emplid || '', eventTitle, date: date || new Date().toISOString().split('T')[0], status: 'registered' })
    window.localStorage.setItem(key, JSON.stringify(records))
    return records
}

/**
 * Get all RSVP records for a club.
 */
export function getRsvpRecords(clubSlug) {
    const key = `rsvp-${clubSlug}`
    try {
        return JSON.parse(window.localStorage.getItem(key) || '[]')
    } catch {
        return []
    }
}

/**
 * Export the club attendance data as a downloadable JSON file.
 */
export function downloadClubAttendanceJson(clubSlug) {
    const records = getClubAttendance(clubSlug)
    const blob = new Blob([JSON.stringify(records, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${clubSlug}-attendance.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
}
