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
}) {
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
                    <p className={styles.authPage__campusTag}>{selectedCampus.name}</p>
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
