import { useState } from 'react'
import Button from '../Button/Button'
import styles from './clubElections.module.scss'

const MOCK_ELECTIONS = [
    {
        id: 'election-1',
        clubName: 'Computer Science Club',
        position: 'President',
        deadline: 'May 5, 2026',
        candidates: [
            { id: 'c1', name: 'Maria Santos', statement: 'I will organize more hackathons and coding workshops to build a stronger tech community on campus.' },
            { id: 'c2', name: 'James Liu', statement: 'My goal is to strengthen industry partnerships and bring guest speakers every month.' },
            { id: 'c3', name: 'Aisha Patel', statement: 'I plan to launch a peer tutoring network and make CS accessible to every student.' },
        ],
    },
    {
        id: 'election-2',
        clubName: 'Debate Society',
        position: 'Vice President',
        deadline: 'May 8, 2026',
        candidates: [
            { id: 'c4', name: 'David Kim', statement: 'I want to expand our tournament participation and create beginner-friendly practice rounds.' },
            { id: 'c5', name: 'Sophia Brown', statement: 'My focus will be on inter-campus debate events and community outreach.' },
        ],
    },
    {
        id: 'election-3',
        clubName: 'Art & Design Collective',
        position: 'Treasurer',
        deadline: 'May 12, 2026',
        candidates: [
            { id: 'c6', name: 'Carlos Rivera', statement: 'I will ensure transparent budgeting and secure more funding for art supplies and exhibitions.' },
            { id: 'c7', name: 'Nina Zhao', statement: 'I plan to create fundraising events and partnerships with local galleries to grow our budget.' },
        ],
    },
]

function ClubElections({ currentUser }) {
    const [votes, setVotes] = useState({})
    const [votedElections, setVotedElections] = useState(new Set())

    const handleVote = (electionId, candidateId) => {
        if (votedElections.has(electionId)) return
        setVotes((prev) => ({ ...prev, [electionId]: candidateId }))
    }

    const handleSubmitVote = (electionId) => {
        if (!votes[electionId] || votedElections.has(electionId)) return
        setVotedElections((prev) => new Set([...prev, electionId]))
    }

    const isLoggedIn = Boolean(currentUser)

    return (
        <section className={styles.elections} aria-labelledby="elections-title">
            <div className={styles.elections__header}>
                <div>
                    <h3 className={styles.elections__title} id="elections-title">Club Elections</h3>
                    <p className={styles.elections__subtitle}>Vote for your next club leaders — open to all students</p>
                </div>
            </div>

            <div className={styles.elections__grid}>
                {MOCK_ELECTIONS.map((election) => {
                    const hasVoted = votedElections.has(election.id)
                    const selectedCandidate = votes[election.id]

                    return (
                        <article key={election.id} className={styles.elections__card}>
                            <div className={styles.elections__cardHeader}>
                                <span className={styles.elections__badge}>{election.position}</span>
                                <span className={styles.elections__deadline}>Ends {election.deadline}</span>
                            </div>
                            <h4 className={styles.elections__clubName}>{election.clubName}</h4>

                            <div className={styles.elections__candidates}>
                                {election.candidates.map((candidate) => (
                                    <label
                                        key={candidate.id}
                                        className={`${styles.elections__candidate} ${selectedCandidate === candidate.id ? styles['elections__candidate--selected'] : ''} ${hasVoted ? styles['elections__candidate--locked'] : ''}`.trim()}
                                    >
                                        <input
                                            type="radio"
                                            name={`election-${election.id}`}
                                            value={candidate.id}
                                            checked={selectedCandidate === candidate.id}
                                            onChange={() => handleVote(election.id, candidate.id)}
                                            disabled={hasVoted || !isLoggedIn}
                                            className={styles.elections__radio}
                                        />
                                        <div className={styles.elections__candidateInfo}>
                                            <span className={styles.elections__candidateName}>{candidate.name}</span>
                                            <span className={styles.elections__candidateStatement}>{candidate.statement}</span>
                                        </div>
                                    </label>
                                ))}
                            </div>

                            <div className={styles.elections__actions}>
                                {hasVoted ? (
                                    <p className={styles.elections__voted}>Your vote has been recorded. Thank you!</p>
                                ) : isLoggedIn ? (
                                    <Button
                                        variant="primary"
                                        onClick={() => handleSubmitVote(election.id)}
                                        disabled={!selectedCandidate}
                                    >
                                        Cast Vote
                                    </Button>
                                ) : (
                                    <p className={styles.elections__loginHint}>Sign in as a student to vote</p>
                                )}
                            </div>
                        </article>
                    )
                })}
            </div>
        </section>
    )
}

export default ClubElections
