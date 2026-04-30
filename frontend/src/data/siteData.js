import cunyBlueLogo from '../assets/CUNY_Logo_Blue_RGB.png'
import bmccClubDirectoryCsvRaw from './2025-26 Club Directory Link.csv?raw'

// Media pool for club banners and trending event thumbnails
const mediaModules = import.meta.glob('../assets/media/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}', { eager: true, import: 'default' })
const mediaPool = Object.values(mediaModules)

function pickMediaByIndex(index) {
    if (!mediaPool.length) return cunyBlueLogo
    return mediaPool[index % mediaPool.length]
}

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
        .map((cells, index) => {
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
                banner: pickMediaByIndex(index),
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
    bmccClubDirectory20252026[cpcIndex].instagram = 'https://www.instagram.com/bmcc_programmingclub/'
    bmccClubDirectory20252026[cpcIndex].instagramHandle = '@bmcc_programmingclub'
    bmccClubDirectory20252026[cpcIndex].socialLinks = {
        instagram: 'https://www.instagram.com/bmcc_programmingclub/',
    }
    bmccClubDirectory20252026[cpcIndex].officerRoster = [
        { name: 'Giovanna (Gia)', role: 'President', discord: 'vaana', email: 'gia.president@bmccprogramming.club' },
        { name: 'Roselyn', role: 'Vice President', discord: 'roselynm55', email: 'roselyn.vp@bmccprogramming.club' },
        { name: 'Adrian', role: 'Secretary', discord: 'heyimadrian', email: 'adrian.secretary@bmccprogramming.club' },
        { name: 'Jon', role: 'Treasurer', discord: '_jonyo_', email: 'jon.treasurer@bmccprogramming.club' },
    ]
    bmccClubDirectory20252026[cpcIndex].officers = [
        'Giovanna (Gia) — President',
        'Roselyn — Vice President',
        'Adrian — Secretary',
        'Jon — Treasurer',
    ]
    bmccClubDirectory20252026[cpcIndex].semester = 'Spring 2026'
    bmccClubDirectory20252026[cpcIndex].instagramPosts = [
        'DPhEDUODtpo',
        'DFvOHVHO_hE',
        'DFWYNMmvVjS',
    ]
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

// ── Inject Bike Club (not in CSV) ──
bmccClubDirectory20252026.push({
    id: 'bike-club',
    name: 'Bike Club',
    campus: BMCC_CAMPUS_ID,
    category: 'Campus',
    shortDescription: 'Learn to ride, repair, and maintain bikes with fellow students.',
    description: 'Bike Club brings BMCC students together for group rides, maintenance workshops, and cycling advocacy on campus.',
    banner: pickMediaByIndex(70),
    meetingTime: 'Thursday 2pm-4pm',
    location: 'F-101',
    email: 'bmccbikeclub@gmail.com',
    zoomLink: '',
    advisor: 'TBD',
    officers: [],
    members: [],
    publicEvents: [
        {
            id: 'bike-club-repair-workshop',
            title: 'Riding and Repairing Bikes Workshop',
            time: 'May 1, 2026 · 2:00 PM – 4:00 PM',
            fixedDate: '2026-05-01T14:00:00',
            fixedEndDate: '2026-05-01T16:00:00',
        },
        {
            id: 'bike-club-weekly-meeting',
            title: 'Weekly Club Meeting',
            time: 'Thursday 2pm-4pm',
        },
    ],
    trendingEvent: 'Riding and Repairing Bikes Workshop',
})

// ── Inject Chess Club Tournament event ──
const chessIndex = bmccClubDirectory20252026.findIndex((c) => c.id === 'chess-club')
if (chessIndex !== -1) {
    bmccClubDirectory20252026[chessIndex].publicEvents.unshift({
        id: 'chess-tournament-beginner',
        title: 'Chess Club Tournament *Beginner-friendly!*',
        time: 'May 3, 2026 · 5:00 PM – 7:00 PM',
        fixedDate: '2026-05-03T17:00:00',
        fixedEndDate: '2026-05-03T19:00:00',
    })
}

// ── Inject 80s DJ Party into Music Club ──
const musicIndex = bmccClubDirectory20252026.findIndex((c) => c.id === 'music-club')
if (musicIndex !== -1) {
    bmccClubDirectory20252026[musicIndex].publicEvents.unshift({
        id: 'music-80s-dj-party',
        title: '80s Costume DJ Party',
        time: 'May 8, 2026 · 6:00 PM – 9:00 PM',
        fixedDate: '2026-05-08T18:00:00',
        fixedEndDate: '2026-05-08T21:00:00',
    })
}

export const clubDirectory = bmccClubDirectory20252026

// Helper to find a club's banner by id
function clubBanner(id) {
    const club = clubDirectory.find((c) => c.id === id)
    return club ? club.banner : cunyBlueLogo
}

export const trendingEvents = [
    {
        id: 'cpc-ai-innovation-featured',
        title: 'AI Innovation Challenge: Tech for Change',
        clubId: 'computer-programming-club',
        clubName: 'Computer Programming Club',
        campus: BMCC_CAMPUS_ID,
        time: 'April 24–25, 2026 · 9 AM – 9 PM',
        blurb: 'A two-day hackathon-style challenge focused on AI for social good, hosted by the Computer Programming Club.',
        banner: clubBanner('computer-programming-club'),
    },
    {
        id: 'chess-tournament-featured',
        title: 'Chess Club Tournament *Beginner-friendly!*',
        clubId: 'chess-club',
        clubName: 'Chess Club',
        campus: BMCC_CAMPUS_ID,
        time: 'May 3, 2026 · 5:00 PM – 7:00 PM',
        blurb: 'All skill levels welcome! Compete in a friendly tournament with prizes and coaching from experienced players.',
        banner: clubBanner('chess-club'),
    },
    {
        id: 'bike-repair-featured',
        title: 'Riding and Repairing Bikes Workshop',
        clubId: 'bike-club',
        clubName: 'Bike Club',
        campus: BMCC_CAMPUS_ID,
        time: 'May 1, 2026 · 2:00 PM – 4:00 PM',
        blurb: 'Hands-on workshop: learn basic bike maintenance, tire changes, and safe riding techniques.',
        banner: clubBanner('bike-club'),
    },
    {
        id: 'music-80s-dj-featured',
        title: '80s Costume DJ Party',
        clubId: 'music-club',
        clubName: 'Music Club',
        campus: BMCC_CAMPUS_ID,
        time: 'May 8, 2026 · 6:00 PM – 9:00 PM',
        blurb: 'Dress up in your best 80s outfit and dance the night away with live DJ sets and retro vibes.',
        banner: clubBanner('music-club'),
    },
]

export const homeCategories = [...new Set(clubDirectory.map((club) => club.category))]

export const defaultUserProfile = {
    name: 'Jordan Student',
    role: 'student',
    assignedClub: '',
    emplid: '',
    recentEvents: trendingEvents.slice(0, 3).map((event) => event.title),
}
