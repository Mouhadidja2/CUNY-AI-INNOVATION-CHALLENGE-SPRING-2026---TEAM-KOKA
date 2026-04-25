import Button from '../Button/Button'
import styles from './auth-portal.module.scss'

function AuthPortal({
    mode,
    onModeChange,
    signupRole,
    onSignupRoleChange,
    signupAssignedClub,
    onSignupAssignedClubChange,
    clubs,
    onLoginSubmit,
    onSignupSubmit,
    onViewFullPage,
    onBackHome,
    variant = 'page',
}) {
    const showAssignedClubField = ['club officer', 'club advisor', 'sga officer'].includes(signupRole)

    return (
        <section className={`${styles.authPortal} ${styles[`authPortal--${variant}`]}`.trim()}>
            <header className={styles.authPortal__header}>
                <p className={styles.authPortal__eyebrow}>Access portal</p>
                <h2 className={styles.authPortal__title}>{mode === 'login' ? 'Sign in to continue' : 'Create your account'}</h2>
            </header>

            <div className={styles.authPortal__switch}>
                <button
                    className={`${styles.authPortal__switchButton} ${mode === 'login' ? styles['authPortal__switchButton--active'] : ''}`.trim()}
                    type="button"
                    onClick={() => onModeChange('login')}
                >
                    Login
                </button>
                <button
                    className={`${styles.authPortal__switchButton} ${mode === 'signup' ? styles['authPortal__switchButton--active'] : ''}`.trim()}
                    type="button"
                    onClick={() => onModeChange('signup')}
                >
                    Sign up
                </button>
            </div>

            <div className={styles.authPortal__body}>
                {mode === 'login' ? (
                    <form className={styles.authPortal__form} onSubmit={onLoginSubmit}>
                        <label className={styles.authPortal__field}>
                            <span className={styles.authPortal__label}>Email</span>
                            <input className={styles.authPortal__input} name="email" type="email" placeholder="student@school.edu" required />
                        </label>
                        <label className={styles.authPortal__field}>
                            <span className={styles.authPortal__label}>Password</span>
                            <input className={styles.authPortal__input} name="password" type="password" placeholder="••••••••" required />
                        </label>
                        <label className={styles.authPortal__field}>
                            <span className={styles.authPortal__label}>Role</span>
                            <select className={styles.authPortal__input} name="role" defaultValue="student">
                                <option value="student">Student</option>
                                <option value="club officer">Club Officer</option>
                                <option value="club advisor">Club Advisor</option>
                                <option value="sga officer">SGA Officer</option>
                            </select>
                        </label>
                        <label className={styles.authPortal__field}>
                            <span className={styles.authPortal__label}>Assigned club</span>
                            <select className={styles.authPortal__input} name="assignedClub" defaultValue="">
                                <option value="">None</option>
                                {clubs.map((club) => (
                                    <option key={club.id} value={club.name}>
                                        {club.name}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <Button type="submit" variant="primary" fullWidth>
                            Enter portal
                        </Button>
                    </form>
                ) : (
                    <form className={styles.authPortal__form} onSubmit={onSignupSubmit}>
                        <label className={styles.authPortal__field}>
                            <span className={styles.authPortal__label}>Full name</span>
                            <input className={styles.authPortal__input} name="name" type="text" placeholder="Jordan Student" required />
                        </label>
                        <label className={styles.authPortal__field}>
                            <span className={styles.authPortal__label}>Email</span>
                            <input className={styles.authPortal__input} name="email" type="email" placeholder="student@school.edu" required />
                        </label>
                        <label className={styles.authPortal__field}>
                            <span className={styles.authPortal__label}>Password</span>
                            <input className={styles.authPortal__input} name="password" type="password" placeholder="Create a password" required />
                        </label>
                        <label className={styles.authPortal__field}>
                            <span className={styles.authPortal__label}>Role</span>
                            <select
                                className={styles.authPortal__input}
                                name="role"
                                value={signupRole}
                                onChange={(event) => onSignupRoleChange(event.target.value)}
                            >
                                <option value="student">Student</option>
                                <option value="club officer">Club Officer</option>
                                <option value="club advisor">Club Advisor</option>
                                <option value="sga officer">SGA Officer</option>
                            </select>
                        </label>
                        {showAssignedClubField ? (
                            <label className={styles.authPortal__field}>
                                <span className={styles.authPortal__label}>Which club do you oversee?</span>
                                <select
                                    className={styles.authPortal__input}
                                    name="assignedClub"
                                    value={signupAssignedClub}
                                    onChange={(event) => onSignupAssignedClubChange(event.target.value)}
                                    required
                                >
                                    <option value="" disabled>
                                        Choose a club
                                    </option>
                                    {clubs.map((club) => (
                                        <option key={club.id} value={club.name}>
                                            {club.name}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        ) : null}
                        <Button type="submit" variant="primary" fullWidth>
                            Create account
                        </Button>
                    </form>
                )}

                <div className={styles.authPortal__sidePanel}>
                    <h3 className={styles.authPortal__sideTitle}>What this portal unlocks</h3>
                    <ul className={styles.authPortal__list}>
                        <li className={styles.authPortal__listItem}>Students can register for events and see their recent activity.</li>
                        <li className={styles.authPortal__listItem}>Club officers can create events, edit club info, and manage requests.</li>
                        <li className={styles.authPortal__listItem}>SGA officers can approve or deny budget proposals with comments.</li>
                    </ul>
                    {variant === 'modal' ? (
                        <Button variant="ghost" onClick={onViewFullPage} fullWidth>
                            Open full auth page
                        </Button>
                    ) : null}
                    {onBackHome ? (
                        <Button variant="ghost" onClick={onBackHome} fullWidth>
                            Back to home
                        </Button>
                    ) : null}
                </div>
            </div>
        </section>
    )
}

export default AuthPortal
