import { useEffect, useState } from 'react'
import Header from './components/Header/Header'
import Footer from './components/Footer/Footer'
import Modal from './components/Modal/Modal'
import Toast from './components/Toast/Toast'
import Button from './components/Button/Button'
import Home from './pages/home'
import Club from './pages/club'
import Me from './pages/me'
import AuthPage from './pages/auth'
import Dashboard from './pages/Dashboard'
import ClubsPage from './pages/clubs'
import EventsOverview from './pages/events'
import StartClubPage from './pages/startClub'
import SearchResults from './pages/searchResults'
import { BMCC_CAMPUS_ID, clubDirectory, defaultUserProfile, trendingEvents } from './data/siteData'
import { initAttendanceLog, addAttendanceRecord } from './services/attendanceService'
import { campuses } from './data/campuses'
import { dashboardData } from './data/dashboardData'
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

    if (cleanPath === '/search') {
        return { name: 'search' }
    }

    if (cleanPath === '/start-club/new') {
        return { name: 'startClubForm' }
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
    const [selectedCampusId, setSelectedCampusId] = useState('')
    const [currentUser, setCurrentUser] = useState(null)
    const [signupRole, setSignupRole] = useState('student')
    const [signupAssignedClub, setSignupAssignedClub] = useState('')
    const [isHeaderHidden, setIsHeaderHidden] = useState(false)
    const [isDevContentVisible, setIsDevContentVisible] = useState(false)
    const [pendingPostAuthDestination, setPendingPostAuthDestination] = useState(null)
    const [toastMessage, setToastMessage] = useState('')
    const [registeredEvents, setRegisteredEvents] = useState(() => {
        try {
            return JSON.parse(window.localStorage.getItem('registered-events') || '[]')
        } catch {
            return []
        }
    })

    const requiresAssignedClub = (role) => ['club officer', 'club advisor', 'sga officer'].includes(role)

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

    const goToAuth = (mode = 'login', postAuthDestination = null) => {
        setPendingPostAuthDestination(postAuthDestination)

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

    const goToStartClub = () => {
        goToAuth('login', 'start-club-form')
    }

    const goToManageClub = () => {
        goToAuth('login', 'manage-club-dashboard')
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
    }

    const handleHeaderSearchSubmit = (query) => {
        if (query.trim()) {
            navigate('/search')
        }
    }

    const handleSignOut = () => {
        setCurrentUser(null)
        setStatusMessage('')
        navigate('/')
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

    const buildUserProfile = (name, role, assignedClub, email) => ({
        name,
        role,
        assignedClub,
        email,
        recentEvents: [],
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
        const userRole = (formData.get('role') || 'student').toString()
        const assignedClub = (formData.get('assignedClub') || '').toString()
        const derivedName = email.split('@')[0] || defaultUserProfile.name

        const loggedInUser = buildUserProfile(derivedName, userRole, assignedClub, email)

        setCurrentUser(loggedInUser)
        initAttendanceLog(loggedInUser)
        setStatusMessage(`Signed in as ${userRole}.`)
        event.currentTarget.reset()

        if (pendingPostAuthDestination === 'start-club-form') {
            setPendingPostAuthDestination(null)
            navigate('/start-club/new')
            return
        }

        if (pendingPostAuthDestination === 'manage-club-dashboard') {
            setPendingPostAuthDestination(null)
            if (dashboardRoles.includes(userRole)) {
                navigate('/admin')
            } else {
                setToastMessage('Only club officers, club advisors, and SGA officers can manage clubs.')
                navigate('/')
            }
            return
        }

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
        const role = signupRole
        const assignedClub = requiresAssignedClub(role) ? signupAssignedClub : ''

        const signedUpUser = buildUserProfile(name, role, assignedClub, email)

        setCurrentUser(signedUpUser)
        initAttendanceLog(signedUpUser)
        setStatusMessage(`Account created for ${role}.`)
        setSignupRole('student')
        setSignupAssignedClub('')
        event.currentTarget.reset()

        if (pendingPostAuthDestination === 'start-club-form') {
            setPendingPostAuthDestination(null)
            navigate('/start-club/new')
            return
        }

        if (pendingPostAuthDestination === 'manage-club-dashboard') {
            setPendingPostAuthDestination(null)
            if (dashboardRoles.includes(role)) {
                navigate('/admin')
            } else {
                setToastMessage('Only club officers, club advisors, and SGA officers can manage clubs.')
                navigate('/')
            }
            return
        }

        navigate(dashboardRoles.includes(role) ? '/admin' : '/me')
    }

    const route = resolveRoute(locationPath)
    const currentClub = route.name === 'club' ? clubDirectory.find((club) => club.id === route.clubId) || null : null
    const canAccessDashboard = currentUser && dashboardRoles.includes(currentUser.role)

    useEffect(() => {
        if (route.name === 'club' && currentClub && selectedCampusId !== currentClub.campus) {
            setSelectedCampusId(currentClub.campus)
        }
    }, [route.name, currentClub, selectedCampusId])

    const persistRegisteredEvents = (nextEvents) => {
        setRegisteredEvents(nextEvents)
        window.localStorage.setItem('registered-events', JSON.stringify(nextEvents))
    }

    const handleRsvp = (rsvpData) => {
        const registration = {
            id: `reg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            ...rsvpData,
            registeredAt: new Date().toISOString(),
            attended: false,
            feedback: '',
        }
        const nextEvents = [...registeredEvents, registration]
        persistRegisteredEvents(nextEvents)
        setToastMessage(`RSVP confirmed for ${rsvpData.eventTitle}.`)
    }

    const handleMarkAttended = (registrationId) => {
        const nextEvents = registeredEvents.map((reg) => {
            if (reg.id === registrationId) {
                if (currentUser) {
                    addAttendanceRecord(currentUser, {
                        eventTitle: reg.eventTitle,
                        eventDate: reg.eventDate,
                        clubName: reg.clubName,
                    })
                }
                return { ...reg, attended: true }
            }
            return reg
        })
        persistRegisteredEvents(nextEvents)
        setToastMessage('Attendance marked successfully.')
    }

    const handleAddFeedback = (registrationId, feedbackText) => {
        const nextEvents = registeredEvents.map((reg) =>
            reg.id === registrationId ? { ...reg, feedback: feedbackText } : reg
        )
        persistRegisteredEvents(nextEvents)
    }

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
                    onOpenSignup={goToStartClub}
                    onOpenLogin={goToManageClub}
                    onJoinClub={goToClubs}
                    onClubOpen={(clubId) => navigate(`/club/${clubId}`)}
                    onViewAllClubs={() => navigate('/clubs')}
                    onViewAllEvents={() => navigate('/events')}
                    onLightboxStateChange={setIsHeaderHidden}
                    showDevSections={isDevContentVisible}
                    currentUser={currentUser}
                    registeredEvents={registeredEvents}
                    onMarkAttended={handleMarkAttended}
                    onAddFeedback={handleAddFeedback}
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
            return <Me currentUser={currentUser} registeredEvents={registeredEvents} onOpenAuth={() => goToAuth('login')} onBackHome={() => navigate('/')} />
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

            return <Dashboard user={currentUser} data={dashboardData} />
        }

        if (route.name === 'clubs') {
            return <ClubsPage selectedCampus={selectedCampus} clubs={visibleClubs} events={visibleEvents} searchQuery={searchQuery} onSearchQueryChange={setSearchQuery} onClubOpen={(clubId) => navigate(`/club/${clubId}`)} onViewAllClubs={() => navigate('/clubs')} onViewAllEvents={() => navigate('/events')} onBackHome={() => navigate('/')} />
        }

        if (route.name === 'events') {
            return <EventsOverview events={visibleEvents} selectedCampus={selectedCampus} onBackHome={() => navigate('/')} />
        }

        if (route.name === 'search') {
            return (
                <SearchResults
                    searchQuery={searchQuery}
                    onSearchQueryChange={setSearchQuery}
                    allClubs={clubDirectory}
                    onClubOpen={(clubId) => navigate(`/club/${clubId}`)}
                    onBackHome={() => navigate('/')}
                />
            )
        }

        if (route.name === 'startClubForm') {
            return <StartClubPage currentUser={currentUser} selectedCampus={selectedCampus} onRequireAuth={goToStartClub} />
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
                onOpenSignup={goToStartClub}
                onOpenLogin={goToManageClub}
                onJoinClub={goToClubs}
                onClubOpen={(clubId) => navigate(`/club/${clubId}`)}
                onViewAllClubs={() => navigate('/clubs')}
                onViewAllEvents={() => navigate('/events')}
                onLightboxStateChange={setIsHeaderHidden}
                showDevSections={isDevContentVisible}
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
                        showTitle={Boolean(selectedCampusId) && selectedCampusId !== BMCC_CAMPUS_ID}
                        searchQuery={searchQuery}
                        onSearchChange={handleHeaderSearchChange}
                        onSearchSubmit={handleHeaderSearchSubmit}
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
                <Toast message={toastMessage} onClose={() => setToastMessage('')} />

                <Footer title={appTitle} onDevToggle={() => setIsDevContentVisible((visible) => !visible)} />
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
