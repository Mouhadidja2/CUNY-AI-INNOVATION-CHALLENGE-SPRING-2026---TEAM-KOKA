import { useEffect, useState } from 'react'
import Header from './components/Header/Header'
import Footer from './components/Footer/Footer'
import Modal from './components/Modal/Modal'
import AuthPortal from './components/Auth/AuthPortal'
import Button from './components/Button/Button'
import Home from './pages/home'
import Club from './pages/club'
import Me from './pages/me'
import AuthPage from './pages/auth'
import Dashboard from './pages/Dashboard'
import { clubDirectory, defaultUserProfile } from './data/siteData'
import { dashboardData } from './data/dashboardData'
// import logoPlaceholder from './assets/CUNY_Logo_Blue_RGB.png'
import logoPlaceholder from './assets/BMCC-Club-Builder.png'
import styles from './styles/global.module.scss'

const dashboardRoles = ['club officer', 'club advisor', 'sga officer']

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

    if (cleanPath.startsWith('/club/')) {
        return { name: 'club', clubId: decodeURIComponent(cleanPath.split('/')[2] || '') }
    }

    return { name: 'home' }
}

function App() {
    const appTitle = 'Club Builder'
    const [locationPath, setLocationPath] = useState(window.location.pathname)
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
    const [authMode, setAuthMode] = useState('login')
    const [searchQuery, setSearchQuery] = useState('')
    const [statusMessage, setStatusMessage] = useState('')
    const [currentUser, setCurrentUser] = useState(null)
    const [signupRole, setSignupRole] = useState('student')
    const [signupAssignedClub, setSignupAssignedClub] = useState('')

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

    const openAuth = (mode = 'login') => {
        setAuthMode(mode)
        setIsAuthModalOpen(true)
    }

    const closeAuth = () => setIsAuthModalOpen(false)

    const buildUserProfile = (name, role, assignedClub, email) => ({
        name,
        role,
        assignedClub,
        email,
        recentEvents: role === 'student' ? [...defaultUserProfile.recentEvents] : [],
    })

    const handleLoginSubmit = (event) => {
        event.preventDefault()
        const formData = new FormData(event.currentTarget)
        const email = (formData.get('email') || '').toString()
        const userRole = (formData.get('role') || 'student').toString()
        const assignedClub = (formData.get('assignedClub') || '').toString()
        const derivedName = email.split('@')[0] || defaultUserProfile.name

        const loggedInUser = buildUserProfile(derivedName, userRole, assignedClub, email)

        setCurrentUser(loggedInUser)
        setStatusMessage(`Signed in as ${userRole}.`)
        closeAuth()
        event.currentTarget.reset()
        navigate(dashboardRoles.includes(userRole) ? '/admin' : '/me')
    }

    const handleSignupSubmit = (event) => {
        event.preventDefault()

        const formData = new FormData(event.currentTarget)
        const name = (formData.get('name') || defaultUserProfile.name).toString()
        const email = (formData.get('email') || '').toString()
        const role = signupRole
        const assignedClub = role === 'club officer' ? signupAssignedClub : ''

        const signedUpUser = buildUserProfile(name, role, assignedClub, email)

        setCurrentUser(signedUpUser)
        setStatusMessage(`Account created for ${role}.`)
        closeAuth()
        setSignupRole('student')
        setSignupAssignedClub('')
        event.currentTarget.reset()
        navigate(dashboardRoles.includes(role) ? '/admin' : '/me')
    }

    const route = resolveRoute(locationPath)
    const currentClub = route.name === 'club' ? clubDirectory.find((club) => club.id === route.clubId) || null : null
    const canAccessDashboard = currentUser && dashboardRoles.includes(currentUser.role)

    const renderRoute = () => {
        if (route.name === 'home') {
            return (
                <Home
                    clubs={clubDirectory}
                    searchQuery={searchQuery}
                    onSearchQueryChange={setSearchQuery}
                    onOpenSignup={() => openAuth('signup')}
                    onOpenLogin={() => openAuth('login')}
                    onClubOpen={(clubId) => navigate(`/club/${clubId}`)}
                />
            )
        }

        if (route.name === 'auth') {
            return (
                <AuthPage
                    authMode={authMode}
                    setAuthMode={setAuthMode}
                    signupRole={signupRole}
                    setSignupRole={setSignupRole}
                    signupAssignedClub={signupAssignedClub}
                    setSignupAssignedClub={setSignupAssignedClub}
                    clubs={clubDirectory}
                    onLoginSubmit={handleLoginSubmit}
                    onSignupSubmit={handleSignupSubmit}
                    onBackHome={() => navigate('/')}
                    onOpenModal={() => openAuth(authMode)}
                />
            )
        }

        if (route.name === 'club') {
            return <Club club={currentClub} currentUser={currentUser} onBackHome={() => navigate('/')} onOpenAuth={() => openAuth('login')} />
        }

        if (route.name === 'me') {
            return <Me currentUser={currentUser} onOpenAuth={() => openAuth('login')} onBackHome={() => navigate('/')} />
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
                            <Button onClick={() => openAuth('login')}>Sign in</Button>
                        </section>
                    </main>
                )
            }

            return <Dashboard user={currentUser} data={dashboardData} />
        }

        return <Home clubs={clubDirectory} searchQuery={searchQuery} onSearchQueryChange={setSearchQuery} onOpenSignup={() => openAuth('signup')} onOpenLogin={() => openAuth('login')} onClubOpen={(clubId) => navigate(`/club/${clubId}`)} />
    }

    return (
        <div className={`${styles.page} ${styles.app}`}>
            <div className={styles.app__shell}>
                <Header
                    title={appTitle}
                    logoSrc={logoPlaceholder}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    onAuthClick={() => openAuth('login')}
                    onHomeClick={() => navigate('/')}
                />

                {renderRoute()}

                {statusMessage ? <p className={styles.app__contentStatus}>{statusMessage}</p> : null}

                <Footer title={appTitle} />
            </div>

            <Modal isOpen={isAuthModalOpen} title={authMode === 'login' ? 'Login' : 'Create account'} onClose={closeAuth}>
                <AuthPortal
                    mode={authMode}
                    onModeChange={setAuthMode}
                    signupRole={signupRole}
                    onSignupRoleChange={(role) => {
                        setSignupRole(role)
                        if (role !== 'club officer') {
                            setSignupAssignedClub('')
                        }
                    }}
                    signupAssignedClub={signupAssignedClub}
                    onSignupAssignedClubChange={setSignupAssignedClub}
                    clubs={clubDirectory}
                    onLoginSubmit={handleLoginSubmit}
                    onSignupSubmit={handleSignupSubmit}
                    onViewFullPage={() => {
                        closeAuth()
                        navigate('/auth')
                    }}
                    variant="modal"
                />
            </Modal>
        </div>
    )
}

export default App
