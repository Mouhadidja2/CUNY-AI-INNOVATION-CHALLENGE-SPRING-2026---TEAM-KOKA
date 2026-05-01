import { useEffect, useState } from 'react'
import Header from './components/Header/Header'
import Footer from './components/Footer/Footer'
import Modal from './components/Modal/Modal'
import Button from './components/Button/Button'
import Home from './pages/home'
import Club from './pages/club'
import Me from './pages/me'
import AuthPage from './pages/auth'
import Dashboard from './pages/Dashboard'
import ClubsPage from './pages/clubs'
import EventsOverview from './pages/events'
import { clubDirectory, defaultUserProfile, trendingEvents } from './data/siteData'
import { campuses } from './data/campuses'
import { dashboardData } from './data/dashboardData'
import { addClubAttendance, addRsvpRecord } from './services/clubAttendanceService'
import cunyClubBuilderDefault from './assets/CUNY-College-Club-Builder.png'
import cunyClubBuilderSnow from './assets/CUNY-College-Club-Builder_snow.png'
import cunyClubBuilderNight from './assets/CUNY-College-Club-Builder_night.png'
import bmccClubBuilderDefault from './assets/BMCC-Club-Builder.png'
import bmccClubBuilderSnow from './assets/BMCC-Club-Builder_snow.png'
import bmccClubBuilderNight from './assets/BMCC-Club-Builder_night.png'
import modalStyles from './components/Modal/modal.module.scss'
import styles from './styles/global.module.scss'

const dashboardRoles = ['club officer', 'club advisor', 'sga officer']
const themeModes = ['default', 'snow', 'night']

function normalizePath(pathname) {
    const cleanedPath = pathname.replace(/\/+$/, '')
    return cleanedPath || '/'
}

function resolveRoute(pathname) {
    const cleanPath = normalizePath(pathname)

    if (cleanPath === '/') {
        return { name: 'home' }
    }

    if (cleanPath === '/auth') {
        return { name: 'auth' }
    }

    if (cleanPath === '/me') {
        return { name: 'me' }
    }

    if (cleanPath === '/admin') {
        return { name: 'admin' }
    }

    if (cleanPath === '/clubs') {
        return { name: 'clubs' }
    }

    if (cleanPath === '/events') {
        return { name: 'events' }
    }

    if (cleanPath.startsWith('/club/')) {
        return { name: 'club', clubId: decodeURIComponent(cleanPath.split('/')[2] || '') }
    }

    return { name: 'home' }
}

function App() {
    const appTitle = 'Club Builder'
    const [locationPath, setLocationPath] = useState(window.location.pathname)
    const [authMode, setAuthMode] = useState('login')
    const [pendingAuthMode, setPendingAuthMode] = useState('login')
    const [pendingCampusDestination, setPendingCampusDestination] = useState('/auth')
    const [isCampusModalOpen, setIsCampusModalOpen] = useState(false)
    const [themeMode, setThemeMode] = useState('default')
    const [searchQuery, setSearchQuery] = useState('')
    const [statusMessage, setStatusMessage] = useState('')
    const [selectedCampusId, setSelectedCampusId] = useState(() => {
        return window.localStorage.getItem('selectedCampusId') || ''
    })
    const [currentUser, setCurrentUser] = useState(() => {
        try {
            const saved = window.localStorage.getItem('currentUser')
            return saved ? JSON.parse(saved) : null
        } catch { return null }
    })
    const [signupRole, setSignupRole] = useState('student')
    const [signupAssignedClub, setSignupAssignedClub] = useState('')
    const [isHeaderHidden, setIsHeaderHidden] = useState(false)
    const [registeredEvents, setRegisteredEvents] = useState([])

    const requiresAssignedClub = (role) => ['club officer', 'club advisor', 'sga officer'].includes(role)

    // Persist currentUser to localStorage whenever it changes
    useEffect(() => {
        if (currentUser) {
            window.localStorage.setItem('currentUser', JSON.stringify(currentUser))
        } else {
            window.localStorage.removeItem('currentUser')
        }
    }, [currentUser])

    // Persist selectedCampusId to localStorage whenever it changes
    useEffect(() => {
        if (selectedCampusId) {
            window.localStorage.setItem('selectedCampusId', selectedCampusId)
        }
    }, [selectedCampusId])

    useEffect(() => {
        const handlePopState = () => {
            setLocationPath(window.location.pathname)
        }

        window.addEventListener('popstate', handlePopState)
        return () => window.removeEventListener('popstate', handlePopState)
    }, [])

    const navigate = (nextPath) => {
        const nextLocation = normalizePath(nextPath)

        if (window.location.pathname !== nextLocation) {
            window.history.pushState({}, '', nextLocation)
        }

        setLocationPath(nextLocation)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const goToAuth = (mode = 'login') => {
        if (!selectedCampusId) {
            setPendingAuthMode(mode)
            setPendingCampusDestination('/auth')
            setIsCampusModalOpen(true)
            return
        }

        setAuthMode(mode)
        navigate('/auth')
    }

    const goToClubs = () => {
        if (!selectedCampusId) {
            setPendingCampusDestination('/clubs')
            setIsCampusModalOpen(true)
            return
        }

        navigate('/clubs')
    }

    const handleCampusPickedFromModal = (campusId) => {
        setSelectedCampusId(campusId)
        setIsCampusModalOpen(false)

        if (pendingCampusDestination === '/clubs') {
            navigate('/clubs')
            return
        }

        setAuthMode(pendingAuthMode)
        navigate('/auth')
    }

    const handleHeaderSearchChange = (nextQuery) => {
        setSearchQuery(nextQuery)

        if (normalizePath(locationPath) !== '/') {
            navigate('/')
        }
    }

    const selectedCampus = campuses.find((campus) => campus.id === selectedCampusId) || null

    const resolveSiteLogo = () => {
        const logoByTheme = {
            default: selectedCampusId === 'borough-of-manhattan-community-college' ? bmccClubBuilderDefault : cunyClubBuilderDefault,
            snow: selectedCampusId === 'borough-of-manhattan-community-college' ? bmccClubBuilderSnow : cunyClubBuilderSnow,
            night: selectedCampusId === 'borough-of-manhattan-community-college' ? bmccClubBuilderNight : cunyClubBuilderNight,
        }

        return logoByTheme[themeMode] || logoByTheme.default
    }

    const cycleThemeMode = () => {
        const currentIndex = themeModes.indexOf(themeMode)
        const nextTheme = themeModes[(currentIndex + 1) % themeModes.length]
        setThemeMode(nextTheme)
    }

    const visibleClubs = selectedCampusId
        ? clubDirectory.filter((club) => club.campus === selectedCampusId)
        : []

    const visibleEvents = selectedCampusId
        ? trendingEvents.filter((event) => event.campus === selectedCampusId)
        : []

    const buildUserProfile = (name, role, assignedClub, email, emplid) => ({
        name,
        role,
        assignedClub,
        email,
        emplid: emplid || '',
        recentEvents: role === 'student' ? [...defaultUserProfile.recentEvents] : [],
    })

    const handleLoginSubmit = (event) => {
        event.preventDefault()

        if (!selectedCampusId) {
            setStatusMessage('Select a campus first to continue to authentication.')
            navigate('/')
            return
        }

        const formData = new FormData(event.currentTarget)
        const email = (formData.get('email') || '').toString()
        const emplid = (formData.get('emplid') || '').toString()
        const userRole = (formData.get('role') || 'student').toString()
        const assignedClub = (formData.get('assignedClub') || '').toString()
        const derivedName = email.split('@')[0] || defaultUserProfile.name

        const loggedInUser = buildUserProfile(derivedName, userRole, assignedClub, email, emplid)

        setCurrentUser(loggedInUser)
        setStatusMessage(`Signed in as ${userRole}.`)
        event.currentTarget.reset()
        navigate(dashboardRoles.includes(userRole) ? '/admin' : '/me')
    }

    const handleSignupSubmit = (event) => {
        event.preventDefault()

        if (!selectedCampusId) {
            setStatusMessage('Select a campus first to continue to authentication.')
            navigate('/')
            return
        }

        const formData = new FormData(event.currentTarget)
        const name = (formData.get('name') || defaultUserProfile.name).toString()
        const email = (formData.get('email') || '').toString()
        const emplid = (formData.get('emplid') || '').toString()
        const role = signupRole
        const assignedClub = requiresAssignedClub(role) ? signupAssignedClub : ''

        const signedUpUser = buildUserProfile(name, role, assignedClub, email, emplid)

        setCurrentUser(signedUpUser)
        setStatusMessage(`Account created for ${role}.`)
        setSignupRole('student')
        setSignupAssignedClub('')
        event.currentTarget.reset()
        navigate(dashboardRoles.includes(role) ? '/admin' : '/me')
    }

    const handleSignOut = () => {
        setCurrentUser(null)
        window.localStorage.removeItem('currentUser')
        navigate('/')
    }

    const handleRsvp = (rsvpData) => {
        setRegisteredEvents((prev) => [...prev, rsvpData])

        // Record RSVP in per-club storage
        if (rsvpData.clubId) {
            addRsvpRecord(rsvpData.clubId, {
                name: currentUser?.name || 'Anonymous',
                emplid: currentUser?.emplid || '',
                eventTitle: rsvpData.eventTitle,
                date: rsvpData.eventDate,
            })
        }

        // Also add a pending attendance record for the club
        if (rsvpData.clubId && currentUser) {
            addClubAttendance(rsvpData.clubId, {
                name: currentUser.name,
                emplid: currentUser.emplid || '',
                status: 'pending',
                date: rsvpData.eventDate ? new Date(rsvpData.eventDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            })
        }
    }

    const route = resolveRoute(locationPath)
    const currentClub = route.name === 'club'
        ? clubDirectory.find((club) => club.id === route.clubId) || null
        : null
    const canAccessDashboard = currentUser && dashboardRoles.includes(currentUser.role)

    const renderRoute = () => {
        if (route.name === 'home') {
            return (
                <Home
                    selectedCampus={selectedCampus}
                    campuses={campuses}
                    selectedCampusId={selectedCampusId}
                    clubs={visibleClubs}
                    events={visibleEvents}
                    searchQuery={searchQuery}
                    onSearchQueryChange={setSearchQuery}
                    onOpenSignup={() => goToAuth('signup')}
                    onOpenLogin={() => goToAuth('login')}
                    onJoinClub={goToClubs}
                    onViewAllClubs={() => navigate('/clubs')}
                    onViewAllEvents={() => navigate('/events')}
                    onLightboxStateChange={setIsHeaderHidden}
                />
            )
        }

        if (route.name === 'auth') {
            return (
                <AuthPage
                    authMode={authMode}
                    setAuthMode={setAuthMode}
                    signupRole={signupRole}
                    setSignupRole={(role) => {
                        setSignupRole(role)

                        if (!requiresAssignedClub(role)) {
                            setSignupAssignedClub('')
                        }
                    }}
                    signupAssignedClub={signupAssignedClub}
                    setSignupAssignedClub={setSignupAssignedClub}
                    clubs={visibleClubs}
                    selectedCampus={selectedCampus}
                    onLoginSubmit={handleLoginSubmit}
                    onSignupSubmit={handleSignupSubmit}
                    onBackHome={() => navigate('/')}
                />
            )
        }

        if (route.name === 'club') {
            return <Club club={currentClub} currentUser={currentUser} onBackHome={() => navigate('/')} onOpenAuth={() => goToAuth('login')} onRsvp={handleRsvp} registeredEvents={registeredEvents} />
        }

        if (route.name === 'me') {
            return <Me currentUser={currentUser} onOpenAuth={() => goToAuth('login')} onBackHome={() => navigate('/')} onSignOut={handleSignOut} />
        }

        if (route.name === 'admin') {
            if (!canAccessDashboard) {
                return (
                    <main className={styles.app__content}>
                        <section className={styles.app__contentText}>
                            <h2 className={styles.app__contentTitle}>Restricted management center</h2>
                            <p className={styles.app__contentStatus}>
                                Club officers, club advisors, and SGA officers can enter this area. Sign in with a permitted role to continue.
                            </p>
                            <Button onClick={() => goToAuth('login')}>Sign in</Button>
                        </section>
                    </main>
                )
            }

            return <Dashboard user={currentUser} clubs={visibleClubs} data={dashboardData} />
        }

        if (route.name === 'clubs') {
            return <ClubsPage selectedCampus={selectedCampus} clubs={visibleClubs} events={visibleEvents} searchQuery={searchQuery} onSearchQueryChange={setSearchQuery} onClubOpen={(clubId) => navigate(`/club/${clubId}`)} onViewAllClubs={() => navigate('/clubs')} onViewAllEvents={() => navigate('/events')} />
        }

        if (route.name === 'events') {
            return <EventsOverview events={visibleEvents} selectedCampus={selectedCampus} onBackHome={() => navigate('/')} />
        }

        return (
            <Home
                selectedCampus={selectedCampus}
                campuses={campuses}
                selectedCampusId={selectedCampusId}
                clubs={visibleClubs}
                events={visibleEvents}
                searchQuery={searchQuery}
                onSearchQueryChange={setSearchQuery}
                onOpenSignup={() => goToAuth('signup')}
                onOpenLogin={() => goToAuth('login')}
                onJoinClub={goToClubs}
                onViewAllClubs={() => navigate('/clubs')}
                onViewAllEvents={() => navigate('/events')}
                onLightboxStateChange={setIsHeaderHidden}
            />
        )
    }

    return (
        <div className={`${styles.page} ${styles.app}`}>
            <div className={styles.app__shell}>
                {!isHeaderHidden ? (
                    <Header
                        title={appTitle}
                        logoSrc={resolveSiteLogo()}
                        showTitle={Boolean(selectedCampusId)}
                        searchQuery={searchQuery}
                        onSearchChange={handleHeaderSearchChange}
                        onClubsClick={goToClubs}
                        onAuthClick={() => goToAuth('login')}
                        themeMode={themeMode}
                        onThemeToggle={cycleThemeMode}
                        onHomeClick={() => navigate('/')}
                        currentUser={currentUser}
                        onSignOut={handleSignOut}
                        onProfileClick={() => navigate('/me')}
                    />
                ) : null}

                {renderRoute()}

                {statusMessage ? <p className={styles.app__contentStatus}>{statusMessage}</p> : null}

                <Footer title={appTitle} />
            </div>

            <Modal
                isOpen={isCampusModalOpen}
                title="Search by college"
                onClose={() => setIsCampusModalOpen(false)}
                panelClassName={modalStyles['modal__panel--wide']}
            >
                <div className={styles.app__campusModalIntro}>
                    <p className={styles.app__contentMeta}>Pick your campus to continue to clubs or authentication.</p>
                </div>
                <div className={styles.app__campusModalGrid}>
                    {campuses.map((campus) => (
                        <button
                            key={campus.id}
                            type="button"
                            className={`${styles.app__campusModalButton} ${selectedCampusId === campus.id ? styles['app__campusModalButton--active'] : ''}`.trim()}
                            onClick={() => handleCampusPickedFromModal(campus.id)}
                            aria-label={campus.name}
                        >
                            <img className={styles.app__campusModalLogo} src={campus.logo} alt="" aria-hidden="true" />
                        </button>
                    ))}
                </div>
            </Modal>
        </div>
    )
}

export default App
