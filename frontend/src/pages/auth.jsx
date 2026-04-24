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
    onLoginSubmit,
    onSignupSubmit,
    onBackHome,
    onOpenModal,
}) {
    return (
        <main className={styles.authPage}>
            <section className={styles.authPage__card}>
                <div className={styles.authPage__topline}>
                    <div>
                        <p className={styles.authPage__eyebrow}>Dedicated auth page</p>
                        <h2 className={styles.authPage__title}>Sign in or create a role-aware account</h2>
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
                    onViewFullPage={onOpenModal}
                    onBackHome={onBackHome}
                    variant="page"
                />
            </section>
        </main>
    )
}

export default AuthPage
