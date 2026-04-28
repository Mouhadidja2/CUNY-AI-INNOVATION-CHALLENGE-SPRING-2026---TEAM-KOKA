import cunyBlueLogo from '../assets/CUNY_Logo_Blue_RGB.png'
import bmccClubDirectoryCsvRaw from './2025-26 Club Directory Link.csv?raw'

export const BMCC_CAMPUS_ID = 'borough-of-manhattan-community-college'

function slugify(value) {
    return value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
}

function cleanField(value) {
    return (value || '').replace(/\s+/g, ' ').trim()
}

function parseCsvLine(line) {
    const cells = []
    let current = ''
    let inQuotes = false

    for (let index = 0; index < line.length; index += 1) {
        const character = line[index]

        if (character === '"') {
            if (inQuotes && line[index + 1] === '"') {
                current += '"'
                index += 1
            } else {
                inQuotes = !inQuotes
            }
            continue
        }

        if (character === ',' && !inQuotes) {
            cells.push(current)
            current = ''
            continue
        }

        current += character
    }

    cells.push(current)
    return cells
}

function normalizeHeader(value) {
    return cleanField(value)
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
}

function createHeaderIndexLookup(headers) {
    const normalizedHeaders = headers.map(normalizeHeader)

    const findIndex = (...candidates) => normalizedHeaders.findIndex((header) => candidates.some((candidate) => header.includes(candidate)))

    return {
        name: findIndex('clubname'),
        email: findIndex('clubemail'),
        room: findIndex('clubroom'),
        meeting: findIndex('meetinginformation', 'daytime', 'meetinginformationdaytime'),
        zoom: findIndex('zoomlink', 'meetingid', 'zoomlinkmeetingid'),
        advisor: findIndex('clubadvisor'),
    }
}

function parseBmccClubDirectory(csvText) {
    const lines = csvText
        .replace(/^\uFEFF/, '')
        .split(/\r?\n/)
        .filter((line) => cleanField(line))

    if (!lines.length) {
        return []
    }

    const headers = parseCsvLine(lines[0])
    const indices = createHeaderIndexLookup(headers)

    const clubs = lines
        .slice(1)
        .map((line) => parseCsvLine(line))
        .map((cells) => {
            const name = cleanField(cells[indices.name])
            const email = cleanField(cells[indices.email])
            const room = cleanField(cells[indices.room])
            const meeting = cleanField(cells[indices.meeting])
            const zoomLink = cleanField(cells[indices.zoom])
            const advisor = cleanField(cells[indices.advisor])

            if (!name) {
                return null
            }

            const id = slugify(name)
            const hasZoom = zoomLink && !/^n\/a$/i.test(zoomLink)
            const hasAdvisor = Boolean(advisor)

            return {
                id,
                name,
                campus: BMCC_CAMPUS_ID,
                category: 'Campus',
                shortDescription: `Campus club based in ${room || 'TBD room'} with weekly meetings.`,
                description: `${name} hosts community and student engagement activities at BMCC.`,
                banner: cunyBlueLogo,
                meetingTime: meeting || 'TBD',
                location: room || 'TBD',
                email,
                zoomLink: hasZoom ? zoomLink : '',
                advisor,
                officers: hasAdvisor ? [`Advisor: ${advisor}`] : [],
                members: [],
                publicEvents: meeting
                    ? [
                        {
                            id: `${id}-weekly-meeting`,
                            title: 'Weekly Club Meeting',
                            time: meeting,
                        },
                    ]
                    : [],
                trendingEvent: meeting ? 'Weekly Club Meeting' : 'Club Information Session',
            }
        })
        .filter(Boolean)

    return clubs
}

export const bmccClubDirectory20252026 = parseBmccClubDirectory(bmccClubDirectoryCsvRaw)

// Inject events into Computer Programming Club
const cpcIndex = bmccClubDirectory20252026.findIndex((club) => club.id === 'computer-programming-club')
if (cpcIndex !== -1) {
    bmccClubDirectory20252026[cpcIndex].advisor = 'Dr. Azhar'
    bmccClubDirectory20252026[cpcIndex].officers = ['Advisor: Dr. Azhar']
    bmccClubDirectory20252026[cpcIndex].publicEvents = [
        // ── Past events ──
        {
            id: 'cpc-arduino-collab',
            title: 'Arduino Workshop + Competition — Computer Programming Club · Latinas in STEM · Society of Student Engineers',
            time: 'March 23, 2026 · 2:00 PM – 4:00 PM',
            fixedDate: '2026-03-23T14:00:00',
            fixedEndDate: '2026-03-23T16:00:00',
        },
        {
            id: 'cpc-arduino-continuation',
            title: 'Arduino Workshop (Continuation)',
            time: 'April 15, 2026 · 2:00 PM – 4:00 PM',
            fixedDate: '2026-04-15T14:00:00',
            fixedEndDate: '2026-04-15T16:00:00',
        },
        {
            id: 'cpc-data-science-workshop',
            title: 'Data Science Workshop',
            time: 'April 22, 2026 · 2:00 PM – 4:00 PM',
            fixedDate: '2026-04-22T14:00:00',
            fixedEndDate: '2026-04-22T16:00:00',
        },
        {
            id: 'cpc-ai-innovation-day1',
            title: 'AI Innovation Challenge: Tech for Change — Day 1',
            time: 'April 24, 2026 · 9:00 AM – 9:00 PM',
            fixedDate: '2026-04-24T09:00:00',
            fixedEndDate: '2026-04-24T21:00:00',
        },
        {
            id: 'cpc-ai-innovation-day2',
            title: 'AI Innovation Challenge: Tech for Change — Day 2',
            time: 'April 25, 2026 · 9:00 AM – 9:00 PM',
            fixedDate: '2026-04-25T09:00:00',
            fixedEndDate: '2026-04-25T21:00:00',
        },
        // ── Future events ──
        {
            id: 'cpc-big-tech-day',
            title: 'Big Tech Day',
            time: 'April 29, 2026 · 2:00 PM – 4:00 PM',
            fixedDate: '2026-04-29T14:00:00',
            fixedEndDate: '2026-04-29T16:00:00',
        },
        {
            id: 'cpc-resume-workshop',
            title: 'Resume Review / Workshop',
            time: 'May 6, 2026 · 2:00 PM – 4:00 PM',
            fixedDate: '2026-05-06T14:00:00',
            fixedEndDate: '2026-05-06T16:00:00',
        },
        {
            id: 'cpc-finals-relaxation',
            title: 'Finals Relaxation Event',
            time: 'May 13, 2026 · 2:00 PM – 4:00 PM',
            fixedDate: '2026-05-13T14:00:00',
            fixedEndDate: '2026-05-13T16:00:00',
        },
        // ── Weekly meeting ──
        ...bmccClubDirectory20252026[cpcIndex].publicEvents,
    ]

    // TBD events that members can vote on
    bmccClubDirectory20252026[cpcIndex].tbdEvents = [
        { id: 'cpc-tbd-game-design', title: 'Game Design Workshop' },
        { id: 'cpc-tbd-cloud-computing', title: 'Cloud Computing Workshop' },
        { id: 'cpc-tbd-mini-hackathon', title: 'Mini Hackathon' },
        { id: 'cpc-tbd-google-tour', title: 'Google Campus Tour' },
    ]
}

export const clubDirectory = bmccClubDirectory20252026

export const trendingEvents = [
    {
        id: 'cpc-ai-innovation-featured',
        title: 'AI Innovation Challenge: Tech for Change',
        clubId: 'computer-programming-club',
        clubName: 'Computer Programming Club',
        campus: BMCC_CAMPUS_ID,
        time: 'April 24–25, 2026 · 9 AM – 9 PM',
        blurb: 'A two-day hackathon-style challenge focused on AI for social good, hosted by the Computer Programming Club.',
        banner: cunyBlueLogo,
    },
    ...clubDirectory.slice(0, 3).map((club) => ({
        id: `${club.id}-featured`,
        title: club.publicEvents[0]?.title || 'Club Meeting',
        clubId: club.id,
        clubName: club.name,
        campus: club.campus,
        time: club.meetingTime,
        blurb: club.shortDescription,
        banner: club.banner,
    })),
]

export const homeCategories = [...new Set(clubDirectory.map((club) => club.category))]

export const defaultUserProfile = {
    name: 'Jordan Student',
    role: 'student',
    assignedClub: '',
    recentEvents: trendingEvents.slice(0, 3).map((event) => event.title),
}
