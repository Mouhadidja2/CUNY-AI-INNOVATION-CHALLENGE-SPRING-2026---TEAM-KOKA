import styles from './club-selector.module.scss'

function ClubSelector({ clubs, selectedClub, onChange, disabled }) {
    return (
        <div className={styles.clubSelector}>
            <label className={styles.clubSelector__label} htmlFor="dashboard-club-select">
                Select club
            </label>
            <select
                id="dashboard-club-select"
                className={styles.clubSelector__input}
                value={selectedClub}
                onChange={(event) => onChange(event.target.value)}
                disabled={disabled}
            >
                {clubs.map((club) => (
                    <option key={club} value={club}>
                        {club}
                    </option>
                ))}
            </select>
        </div>
    )
}

export default ClubSelector
