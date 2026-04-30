import { useMemo, useState } from 'react'
import styles from './campusesTree.module.scss'
import { campuses } from '../data/campuses'
import { clubDirectory } from '../data/siteData'
import { buildingOptions, getRoomsByBuilding } from '../data/roomData'

const FORM_NODES = [
    'Attendance',
    'Budget proposals',
    'MBJ orders',
    'Out of network orders',
    'Ordering supplies',
    'Reserving a room',
    'Outside event forms',
    'Club events',
    'Club social media profiles',
]

const CHALLENGE_NODES = [
    'Constitution updates',
    'Identifying future leaders',
    'Onboarding and domain knowledge',
    'Setting up post event forms',
    'Interclub relations and past events',
]

function RoomsModal({ isOpen, onClose, buildingList }) {
    if (!isOpen) return null

    return (
        <div className={styles.rooms__overlay} onClick={onClose}>
            <div className={styles.rooms__panel} onClick={(e) => e.stopPropagation()}>
                <div className={styles.rooms__header}>
                    <h3>Rooms and Buildings</h3>
                    <button type="button" onClick={onClose}>Close</button>
                </div>
                <div className={styles.rooms__content}>
                    {buildingList.map((b) => (
                        <section key={b.id} className={styles.rooms__building}>
                            <h4>{b.name}</h4>
                            <div className={styles.rooms__floors}>Floors: {b.floors.join(', ')}</div>
                            <div className={styles.rooms__sample}>
                                {getRoomsByBuilding(b.id).slice(0, 8).map((r) => (
                                    <div key={r.id} className={styles.rooms__room}>
                                        <strong>{r.roomNumber}</strong> — {r.status}
                                    </div>
                                ))}
                            </div>
                        </section>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default function CampusesTree() {
    const [selectedCampusId, setSelectedCampusId] = useState(null)
    const [selectedClubId, setSelectedClubId] = useState(null)
    const [roomsOpen, setRoomsOpen] = useState(false)

    const clubsByCampus = useMemo(() => {
        const map = {}
        clubDirectory.forEach((club) => {
            if (!map[club.campus]) map[club.campus] = []
            map[club.campus].push(club)
        })
        return map
    }, [])

    const visibleClubs = selectedCampusId ? (clubsByCampus[selectedCampusId] || []) : []

    return (
        <main className={styles.page}>
            <header className={styles.header}>
                <h2>CUNY Campuses — Interactive Tree</h2>
                <div>
                    <button className={styles.roomsBtn} onClick={() => setRoomsOpen(true)}>Rooms</button>
                </div>
            </header>

            <section className={styles.treeWrap}>
                <ul className={styles.tree}>
                    {campuses.map((campus) => {
                        const campusClubs = clubsByCampus[campus.id] || []
                        const isCampusOpen = selectedCampusId === campus.id
                        const branchClass = `${styles.branch} ${isCampusOpen ? styles.expanded : styles.collapsed}`

                        return (
                            <li
                                key={campus.id}
                                className={`${styles.node} ${isCampusOpen ? styles['node--active'] : ''}`}
                            >
                                <button
                                    type="button"
                                    onClick={() => setSelectedCampusId((prev) => (prev === campus.id ? null : campus.id))}
                                    aria-expanded={isCampusOpen}
                                >
                                    <img src={campus.logo} alt="" aria-hidden="true" />
                                    <span>{campus.name}</span>
                                    {campusClubs.length > 0 && (
                                        <svg className={`${styles.caret} ${isCampusOpen ? styles.caretRotate : ''}`} viewBox="0 0 24 24" aria-hidden>
                                            <polyline points="8 5 16 12 8 19" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    )}
                                </button>

                                <ul className={branchClass} aria-hidden={!isCampusOpen}>
                                    {campusClubs.length === 0 ? (
                                        <li className={styles.placeholder}>No clubs found</li>
                                    ) : (
                                        campusClubs.map((club) => {
                                            const isClubOpen = selectedClubId === club.id
                                            const thirdClass = `${styles.branchThird} ${isClubOpen ? styles.expanded : styles.collapsed}`

                                            return (
                                                <li key={club.id} className={styles.nodeChild}>
                                                    <button
                                                        type="button"
                                                        onClick={() => setSelectedClubId((prev) => (prev === club.id ? null : club.id))}
                                                        aria-expanded={isClubOpen}
                                                    >
                                                        <span>{club.name}</span>
                                                        <svg className={`${styles.caret} ${isClubOpen ? styles.caretRotate : ''}`} viewBox="0 0 24 24" aria-hidden>
                                                            <polyline points="8 5 16 12 8 19" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                        </svg>
                                                    </button>

                                                    <ul className={thirdClass} aria-hidden={!isClubOpen}>
                                                        <li className={styles.branchHeader}>Forms</li>
                                                        {FORM_NODES.map((f) => (
                                                            <li key={f} className={styles.leaf}>{f}</li>
                                                        ))}

                                                        <li className={styles.branchHeader}>Other challenges</li>
                                                        {CHALLENGE_NODES.map((c) => (
                                                            <li key={c} className={styles.leaf}>{c}</li>
                                                        ))}
                                                    </ul>
                                                </li>
                                            )
                                        })
                                    )}
                                </ul>
                            </li>
                        )
                    })}
                </ul>
            </section>

            <RoomsModal isOpen={roomsOpen} onClose={() => setRoomsOpen(false)} buildingList={buildingOptions} />
        </main>
    )
}
