import chessClubBanner from '../assets/BMCC-College-Club-Builder.png'
import cunyBlueLogo from '../assets/CUNY_Logo_Blue_RGB.png'

export const clubDirectory = [
    {
        id: 'chess-club',
        name: 'Chess Club',
        category: 'Academic',
        shortDescription: 'Strategy sessions, open boards, and weekly challenges for every skill level.',
        description:
            'Chess Club keeps the board moving with beginner lessons, rapid tournaments, and relaxed study hall meetups.',
        banner: chessClubBanner,
        meetingTime: 'Mondays at 4:00 PM',
        location: 'Room 214, Student Center',
        officers: ['President: Maya Chen', 'Vice President: Jordan Lee', 'Treasurer: Sam Rivera', 'Secretary: Priya Patel'],
        members: ['Maya Chen', 'Jordan Lee', 'Sam Rivera', 'Priya Patel', 'Avery Brooks', 'Noah Kim', 'Ella Johnson'],
        publicEvents: [
            { id: 'chess-open-house', title: 'Open House Blitz Night', time: 'Tomorrow, 6:00 PM' },
            { id: 'chess-training', title: 'Opening Theory Workshop', time: 'Friday, 5:00 PM' },
            { id: 'chess-scrimmage', title: 'Intercampus Scrimmage', time: 'Next Tuesday, 7:00 PM' },
        ],
        trendingEvent: 'Open House Blitz Night',
    },
    {
        id: 'debate-society',
        name: 'Debate Society',
        category: 'Academic',
        shortDescription: 'Policy, parliamentary, and public speaking practice with fast-paced feedback.',
        description:
            'Debate Society hosts argument labs, guest speakers, and competitive prep sessions that sharpen every voice in the room.',
        banner: cunyBlueLogo,
        meetingTime: 'Wednesdays at 3:30 PM',
        location: 'Room 318, Academic Annex',
        officers: ['President: Lina Ortiz', 'Vice President: Marcus Grant', 'Treasurer: Keisha Brown', 'Secretary: Daniel Park'],
        members: ['Lina Ortiz', 'Marcus Grant', 'Keisha Brown', 'Daniel Park', 'Sofia Torres', 'Ethan Wright'],
        publicEvents: [
            { id: 'debate-workshop', title: 'Policy Debate Workshop', time: 'Today, 5:30 PM' },
            { id: 'debate-panel', title: 'Guest Speaker Panel', time: 'Thursday, 4:30 PM' },
            { id: 'debate-marathon', title: 'Practice Round Marathon', time: 'Saturday, 11:00 AM' },
        ],
        trendingEvent: 'Policy Debate Workshop',
    },
    {
        id: 'robotics-guild',
        name: 'Robotics Guild',
        category: 'Creative',
        shortDescription: 'Prototype builds, code reviews, and showcase prep for curious makers.',
        description:
            'Robotics Guild mixes hardware tinkering with code sprints, from first sensor tests to final demo day rehearsals.',
        banner: chessClubBanner,
        meetingTime: 'Thursdays at 5:00 PM',
        location: 'Maker Lab, North Hall',
        officers: ['President: Hana Silva', 'Vice President: Omar Ali', 'Treasurer: Tessa Miller', 'Secretary: Julian Reyes'],
        members: ['Hana Silva', 'Omar Ali', 'Tessa Miller', 'Julian Reyes', 'Mina Shah', 'Leo Carter'],
        publicEvents: [
            { id: 'robot-build', title: 'Robot Build Jam', time: 'Tomorrow, 7:00 PM' },
            { id: 'robot-review', title: 'Code Review Sprint', time: 'Friday, 4:00 PM' },
            { id: 'robot-demo', title: 'Demo Day Rehearsal', time: 'Sunday, 2:00 PM' },
        ],
        trendingEvent: 'Robot Build Jam',
    },
    {
        id: 'intramural-soccer',
        name: 'Intramural Soccer',
        category: 'Sports',
        shortDescription: 'Friendly scrimmages, attendance tracking, and game-day coordination.',
        description:
            'Intramural Soccer keeps the field active with pickup games, strategy check-ins, and sign-ups for weekly matches.',
        banner: cunyBlueLogo,
        meetingTime: 'Fridays at 4:30 PM',
        location: 'Field House, South Campus',
        officers: ['President: Isabel Gomez', 'Vice President: Aaron Scott', 'Treasurer: Chloe Nguyen', 'Secretary: Noah Price'],
        members: ['Isabel Gomez', 'Aaron Scott', 'Chloe Nguyen', 'Noah Price', 'Bella King', 'Ryan James'],
        publicEvents: [
            { id: 'soccer-pickup', title: 'Pick-Up Scrimmage', time: 'Today, 6:00 PM' },
            { id: 'soccer-roster', title: 'Roster and Captains Meet', time: 'Wednesday, 5:30 PM' },
            { id: 'soccer-tournament', title: 'Weekend Tournament Warm-Up', time: 'Saturday, 9:00 AM' },
        ],
        trendingEvent: 'Pick-Up Scrimmage',
    },
]

export const trendingEvents = [
    {
        id: 'open-house-blitz',
        title: 'Open House Blitz Night',
        clubId: 'chess-club',
        clubName: 'Chess Club',
        time: 'Tomorrow, 6:00 PM',
        blurb: 'Bring a friend, grab a board, and jump into fast rounds with club mentors.',
        banner: chessClubBanner,
    },
    {
        id: 'policy-workshop',
        title: 'Policy Debate Workshop',
        clubId: 'debate-society',
        clubName: 'Debate Society',
        time: 'Today, 5:30 PM',
        blurb: 'Work through case prep, crossfire drills, and speaking coaching in one session.',
        banner: cunyBlueLogo,
    },
    {
        id: 'robot-build-jam',
        title: 'Robot Build Jam',
        clubId: 'robotics-guild',
        clubName: 'Robotics Guild',
        time: 'Tomorrow, 7:00 PM',
        blurb: 'Prototype, wire, test, and document the next build cycle with the team.',
        banner: chessClubBanner,
    },
    {
        id: 'pickup-scrimmage',
        title: 'Pick-Up Scrimmage',
        clubId: 'intramural-soccer',
        clubName: 'Intramural Soccer',
        time: 'Today, 6:00 PM',
        blurb: 'Drop in for warmups, drills, and short-sided matches on the field house turf.',
        banner: cunyBlueLogo,
    },
]

export const homeCategories = ['Academic', 'Creative', 'Sports']

export const defaultUserProfile = {
    name: 'Jordan Student',
    role: 'student',
    assignedClub: '',
    recentEvents: ['Open House Blitz Night', 'Policy Debate Workshop', 'Robot Build Jam'],
}
