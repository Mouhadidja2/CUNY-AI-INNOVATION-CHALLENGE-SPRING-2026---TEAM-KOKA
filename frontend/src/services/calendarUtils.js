/**
 * Calendar utility functions for iCal file generation,
 * Google Calendar / Outlook URL construction, and meeting-time parsing.
 *
 * Club meeting times are treated as weekly recurring events.
 */

const DAY_MAP = {
    sunday: 0, sun: 0,
    monday: 1, mon: 1,
    tuesday: 2, tue: 2, tues: 2,
    wednesday: 3, wed: 3,
    thursday: 4, thu: 4, thur: 4, thurs: 4,
    friday: 5, fri: 5,
    saturday: 6, sat: 6,
}

const DAY_ABBR_ICAL = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA']

/**
 * Best-effort parser for meeting time strings such as:
 *   "Thursdays 12:00 PM - 2:00 PM"
 *   "Monday/Wednesday 3:00PM-4:30PM"
 *   "Tue & Thu 1pm - 2pm"
 * Returns { days: [number], startHour, startMinute, endHour, endMinute } or null.
 */
export function parseEventTime(meetingTimeString) {
    if (!meetingTimeString || meetingTimeString === 'TBD') {
        return null
    }

    const text = meetingTimeString.toLowerCase().replace(/\s+/g, ' ').trim()

    // Extract day names
    const dayPattern = /\b(sun(?:day)?s?|mon(?:day)?s?|tue(?:s(?:day)?)?s?|wed(?:nesday)?s?|thu(?:r(?:s(?:day)?)?)?s?|fri(?:day)?s?|sat(?:urday)?s?)\b/gi
    const dayMatches = text.match(dayPattern) || []
    const days = []

    for (const match of dayMatches) {
        const cleaned = match.replace(/s$/, '').toLowerCase()
        const dayNum = DAY_MAP[cleaned]
        if (dayNum !== undefined && !days.includes(dayNum)) {
            days.push(dayNum)
        }
    }

    if (!days.length) {
        days.push(new Date().getDay())
    }

    // Extract time range
    const timePattern = /(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\s*[-–to]+\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i
    const timeMatch = text.match(timePattern)

    let startHour = 12
    let startMinute = 0
    let endHour = 13
    let endMinute = 0

    if (timeMatch) {
        startHour = parseInt(timeMatch[1], 10)
        startMinute = parseInt(timeMatch[2] || '0', 10)
        const startMeridiem = (timeMatch[3] || '').toLowerCase()
        endHour = parseInt(timeMatch[4], 10)
        endMinute = parseInt(timeMatch[5] || '0', 10)
        const endMeridiem = (timeMatch[6] || '').toLowerCase()

        if (startMeridiem === 'pm' && startHour !== 12) startHour += 12
        if (startMeridiem === 'am' && startHour === 12) startHour = 0
        if (endMeridiem === 'pm' && endHour !== 12) endHour += 12
        if (endMeridiem === 'am' && endHour === 12) endHour = 0

        // If no meridiem on start but end has pm and start looks like afternoon
        if (!startMeridiem && endMeridiem === 'pm' && startHour < 12) {
            startHour += 12
        }
    }

    return { days, startHour, startMinute, endHour, endMinute }
}

/**
 * Returns the next Date for a given day-of-week and time, starting from today.
 */
export function getNextOccurrence(dayOfWeek, hour, minute) {
    const now = new Date()
    const result = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute, 0, 0)

    const currentDay = now.getDay()
    let daysUntil = dayOfWeek - currentDay
    if (daysUntil < 0) daysUntil += 7
    if (daysUntil === 0 && result <= now) daysUntil = 7

    result.setDate(result.getDate() + daysUntil)
    return result
}

/**
 * Format a Date to iCal DTFORMAT: 20260425T120000
 */
function toICalDate(date) {
    const pad = (n) => String(n).padStart(2, '0')
    return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}T${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`
}

/**
 * Format a Date to Google Calendar format: 20260425T120000
 */
function toGoogleDate(date) {
    return toICalDate(date)
}

/**
 * Format a Date to ISO string for Outlook: 2026-04-25T12:00:00
 */
function toOutlookDate(date) {
    const pad = (n) => String(n).padStart(2, '0')
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

/**
 * Build a unique ID for an iCal event.
 */
function makeUid() {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}@clubbuilder`
}

/**
 * Fold long lines per RFC 5545 (max 75 octets).
 */
function foldLine(line) {
    const maxLen = 75
    if (line.length <= maxLen) return line

    const parts = []
    parts.push(line.slice(0, maxLen))
    let offset = maxLen
    while (offset < line.length) {
        parts.push(' ' + line.slice(offset, offset + maxLen - 1))
        offset += maxLen - 1
    }
    return parts.join('\r\n')
}

/**
 * Generate a valid iCalendar (.ics) string.
 * @param {{ title: string, time: string }} event
 * @param {{ name: string, location: string, meetingTime: string, email?: string }} club
 * @param {boolean} isRecurring - if true, adds RRULE for weekly recurrence
 * @returns {string} iCalendar content
 */
export function generateIcsFile(event, club, isRecurring) {
    const parsed = parseEventTime(club.meetingTime)

    let dtStart, dtEnd, rruleDays

    if (parsed) {
        const nextDate = getNextOccurrence(parsed.days[0], parsed.startHour, parsed.startMinute)
        const endDate = new Date(nextDate)
        endDate.setHours(parsed.endHour, parsed.endMinute, 0, 0)
        if (endDate <= nextDate) endDate.setDate(endDate.getDate() + 1)

        dtStart = toICalDate(nextDate)
        dtEnd = toICalDate(endDate)
        rruleDays = parsed.days.map((d) => DAY_ABBR_ICAL[d]).join(',')
    } else {
        const fallback = new Date()
        fallback.setDate(fallback.getDate() + 1)
        fallback.setHours(12, 0, 0, 0)
        const fallbackEnd = new Date(fallback)
        fallbackEnd.setHours(13, 0, 0, 0)
        dtStart = toICalDate(fallback)
        dtEnd = toICalDate(fallbackEnd)
        rruleDays = DAY_ABBR_ICAL[fallback.getDay()]
    }

    const lines = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//ClubBuilder//CUNY//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'BEGIN:VEVENT',
        foldLine(`UID:${makeUid()}`),
        `DTSTART:${dtStart}`,
        `DTEND:${dtEnd}`,
        foldLine(`SUMMARY:${event.title} — ${club.name}`),
        foldLine(`DESCRIPTION:${club.name} club meeting. ${club.meetingTime}. Location: ${club.location}`),
        foldLine(`LOCATION:${club.location}`),
    ]

    if (club.email) {
        lines.push(foldLine(`ORGANIZER;CN=${club.name}:mailto:${club.email}`))
    }

    if (isRecurring) {
        lines.push(`RRULE:FREQ=WEEKLY;BYDAY=${rruleDays}`)
    }

    lines.push('STATUS:CONFIRMED', 'END:VEVENT', 'END:VCALENDAR')

    return lines.join('\r\n')
}

/**
 * Download an .ics file to the user's computer.
 */
export function downloadIcsFile(icsContent, filename) {
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename.endsWith('.ics') ? filename : `${filename}.ics`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
}

/**
 * Build a Google Calendar event creation URL.
 */
export function buildGoogleCalendarUrl(event, club, isRecurring) {
    const parsed = parseEventTime(club.meetingTime)

    let startStr, endStr

    if (parsed) {
        const nextDate = getNextOccurrence(parsed.days[0], parsed.startHour, parsed.startMinute)
        const endDate = new Date(nextDate)
        endDate.setHours(parsed.endHour, parsed.endMinute, 0, 0)
        if (endDate <= nextDate) endDate.setDate(endDate.getDate() + 1)
        startStr = toGoogleDate(nextDate)
        endStr = toGoogleDate(endDate)
    } else {
        const fallback = new Date()
        fallback.setDate(fallback.getDate() + 1)
        fallback.setHours(12, 0, 0, 0)
        const fallbackEnd = new Date(fallback)
        fallbackEnd.setHours(13, 0, 0, 0)
        startStr = toGoogleDate(fallback)
        endStr = toGoogleDate(fallbackEnd)
    }

    const params = new URLSearchParams({
        action: 'TEMPLATE',
        text: `${event.title} — ${club.name}`,
        dates: `${startStr}/${endStr}`,
        details: `${club.name} club meeting. ${club.meetingTime}. Location: ${club.location}`,
        location: club.location,
    })

    if (isRecurring) {
        const rruleDays = parsed
            ? parsed.days.map((d) => DAY_ABBR_ICAL[d]).join(',')
            : DAY_ABBR_ICAL[new Date().getDay()]
        params.set('recur', `RRULE:FREQ=WEEKLY;BYDAY=${rruleDays}`)
    }

    return `https://calendar.google.com/calendar/r/eventedit?${params.toString()}`
}

/**
 * Build an Outlook Web calendar URL.
 */
export function buildOutlookCalendarUrl(event, club, isRecurring) {
    const parsed = parseEventTime(club.meetingTime)

    let startStr, endStr

    if (parsed) {
        const nextDate = getNextOccurrence(parsed.days[0], parsed.startHour, parsed.startMinute)
        const endDate = new Date(nextDate)
        endDate.setHours(parsed.endHour, parsed.endMinute, 0, 0)
        if (endDate <= nextDate) endDate.setDate(endDate.getDate() + 1)
        startStr = toOutlookDate(nextDate)
        endStr = toOutlookDate(endDate)
    } else {
        const fallback = new Date()
        fallback.setDate(fallback.getDate() + 1)
        fallback.setHours(12, 0, 0, 0)
        const fallbackEnd = new Date(fallback)
        fallbackEnd.setHours(13, 0, 0, 0)
        startStr = toOutlookDate(fallback)
        endStr = toOutlookDate(fallbackEnd)
    }

    const params = new URLSearchParams({
        rru: 'addevent',
        startdt: startStr,
        enddt: endStr,
        subject: `${event.title} — ${club.name}`,
        body: `${club.name} club meeting. ${club.meetingTime}. Location: ${club.location}`,
        location: club.location,
        path: '/calendar/action/compose',
    })

    return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`
}

/**
 * Get the next event occurrence date for a club.
 * Returns an ISO string.
 */
export function getNextEventDate(meetingTimeString) {
    const parsed = parseEventTime(meetingTimeString)
    if (!parsed) {
        const fallback = new Date()
        fallback.setDate(fallback.getDate() + 1)
        fallback.setHours(12, 0, 0, 0)
        return fallback.toISOString()
    }

    const nextDate = getNextOccurrence(parsed.days[0], parsed.startHour, parsed.startMinute)
    return nextDate.toISOString()
}
