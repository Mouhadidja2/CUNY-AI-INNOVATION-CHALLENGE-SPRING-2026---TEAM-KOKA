import { useState, useRef, useEffect } from 'react'
import AuthPortal from '../components/Auth/AuthPortal'
import styles from './auth.module.scss'

function AuthPage({
    authMode,
    setAuthMode,
    signupRole,
    setSignupRole,
    signupAssignedClub,
    setSignupAssignedClub,
    clubs,
    selectedCampus,
    onLoginSubmit,
    onSignupSubmit,
    onBackHome,
    onChangeCampus,
}) {
    const [showTooltip, setShowTooltip] = useState(false)
    const tooltipRef = useRef(null)
    const tagRef = useRef(null)

    // Close tooltip when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (tooltipRef.current && !tooltipRef.current.contains(event.target) &&
                tagRef.current && !tagRef.current.contains(event.target)) {
                setShowTooltip(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleTagClick = () => {
        setShowTooltip(!showTooltip)
    }

    const handleChangeSchool = () => {
        setShowTooltip(false)
        if (onChangeCampus) {
            onChangeCampus()
        }
    }

    if (!selectedCampus) {
        return (
            <main className={styles.authPage}>
                <section className={styles.authPage__card}>
                    <h2 className={styles.authPage__title}>Select a campus first</h2>
                    <p className={styles.authPage__guardMessage}>Choose your college on the home page before signing in or creating an account.</p>
                    <div className={styles.authPage__back}>
                        <button className={styles.authPage__backButton} type="button" onClick={onBackHome}>
                            Go to home
                        </button>
                    </div>
                </section>
            </main>
        )
    }

    return (
        <main className={styles.authPage}>
            <section className={styles.authPage__card}>
                <div className={styles.authPage__topline}>
                    <div className={styles.authPage__campusTagWrapper}>
                        <button
                            ref={tagRef}
                            type="button"
                            className={styles.authPage__campusTag}
                            onClick={handleTagClick}
                            aria-label={`Current campus: ${selectedCampus.name}. Click to change.`}
                        >
                            {selectedCampus.name}
                        </button>
                        {showTooltip && (
                            <div ref={tooltipRef} className={styles.authPage__tooltip}>
                                <button
                                    type="button"
                                    className={styles.authPage__tooltipButton}
                                    onClick={handleChangeSchool}
                                >
                                    Change school
                                </button>
                            </div>
                        )}
                    </div>
                    <div className={styles.authPage__back}>
                        <button className={styles.authPage__backButton} type="button" onClick={onBackHome}>
                            Back home
                        </button>
                    </div>
                </div>

                <AuthPortal
                    mode={authMode}
                    onModeChange={setAuthMode}
                    signupRole={signupRole}
                    onSignupRoleChange={setSignupRole}
                    signupAssignedClub={signupAssignedClub}
                    onSignupAssignedClubChange={setSignupAssignedClub}
                    clubs={clubs}
                    onLoginSubmit={onLoginSubmit}
                    onSignupSubmit={onSignupSubmit}
                    onBackHome={onBackHome}
                    variant="page"
                />
            </section>
        </main>
    )
}

export default AuthPage
