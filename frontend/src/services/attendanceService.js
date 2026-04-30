/**
 * Attendance tracking service.
 * Manages a per-user attendance JSON log in localStorage.
 *
 * Structure:
 * {
 *   userName: string,
 *   userEmail: string,
 *   records: [
 *     { eventRegistered: string, eventDate: string, clubName: string }
 *   ]
 * }
 */

import { createAttendanceRecord as apiCreateAttendanceRecord } from './api'

const STORAGE_KEY_PREFIX = 'attendance-log-'

function getStorageKey(user) {
    const identifier = (user.email || user.name || 'anonymous').toLowerCase().replace(/[^a-z0-9]+/g, '-')
    return `${STORAGE_KEY_PREFIX}${identifier}`
}

/**
 * Initialize the attendance log for a user. Called at signup.
 * If a log already exists, it is preserved.
 */
export function initAttendanceLog(user) {
    const key = getStorageKey(user)
    const existing = window.localStorage.getItem(key)

    if (!existing) {
        const log = {
            userName: user.name,
            userEmail: user.email || '',
            records: [],
        }
        window.localStorage.setItem(key, JSON.stringify(log))
    }
}

/**
 * Add an attendance record for a user.
 * @param {object} user - { name, email }
 * @param {object} registration - { eventTitle, eventDate, clubName }
 */
export function addAttendanceRecord(user, registration) {
    const key = getStorageKey(user)
    const raw = window.localStorage.getItem(key)

    let log
    if (raw) {
        try {
            log = JSON.parse(raw)
        } catch {
            log = { userName: user.name, userEmail: user.email || '', records: [] }
        }
    } else {
        log = { userName: user.name, userEmail: user.email || '', records: [] }
    }

    log.records.push({
        eventRegistered: registration.eventTitle,
        eventDate: registration.eventDate,
        clubName: registration.clubName,
    })

    window.localStorage.setItem(key, JSON.stringify(log))

    // Also POST to backend API if an event ID is available
    if (registration.eventId) {
        const nameParts = (user.name || '').split(' ')
        apiCreateAttendanceRecord({
            event: registration.eventId,
            first_name: nameParts[0] || '',
            last_name: nameParts.slice(1).join(' ') || '',
            school_email: user.email || '',
            emplid: user.emplid || '',
        }).catch(() => { /* API save failed, localStorage record preserved */ })
    }

    return log
}

/**
 * Get the full attendance log for a user.
 */
export function getAttendanceLog(user) {
    const key = getStorageKey(user)
    const raw = window.localStorage.getItem(key)

    if (!raw) {
        return { userName: user.name, userEmail: user.email || '', records: [] }
    }

    try {
        return JSON.parse(raw)
    } catch {
        return { userName: user.name, userEmail: user.email || '', records: [] }
    }
}

/**
 * Download the attendance log as a JSON file.
 */
export function downloadAttendanceLog(user) {
    const log = getAttendanceLog(user)
    const jsonString = JSON.stringify(log, null, 2)
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    const safeName = (user.name || 'user').toLowerCase().replace(/[^a-z0-9]+/g, '-')
    link.href = url
    link.download = `${safeName}-attendance-log.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
}
