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

export const clubDirectory = bmccClubDirectory20252026

export const trendingEvents = clubDirectory.slice(0, 4).map((club) => ({
    id: `${club.id}-featured`,
    title: club.publicEvents[0]?.title || 'Club Meeting',
    clubId: club.id,
    clubName: club.name,
    campus: club.campus,
    time: club.meetingTime,
    blurb: club.shortDescription,
    banner: club.banner,
}))

export const homeCategories = [...new Set(clubDirectory.map((club) => club.category))]

export const defaultUserProfile = {
    name: 'Jordan Student',
    role: 'student',
    assignedClub: '',
    recentEvents: trendingEvents.slice(0, 3).map((event) => event.title),
}
