import { useMemo, useState } from 'react'
import Button from '../components/Button/Button'
import styles from './startClub.module.scss'

function slugify(value) {
    return value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
}

function buildSubmissionPayload(formData, selectedCampus, currentUser) {
    const clubName = (formData.get('clubName') || '').toString().trim()
    const clubId = slugify(clubName)
    const exampleActivitiesRaw = (formData.get('exampleActivities') || '').toString()

    return {
        id: clubId,
        submittedAt: new Date().toISOString(),
        campus: selectedCampus?.id || '',
        submittedBy: currentUser?.email || '',
        publicProfile: {
            clubName,
            clubEmail: (formData.get('clubEmail') || '').toString().trim(),
            meetingTimes: (formData.get('meetingTimes') || '').toString().trim(),
            zoomLink: (formData.get('zoomLink') || '').toString().trim(),
            advisorName: (formData.get('advisorName') || '').toString().trim(),
            advisorEmail: (formData.get('advisorEmail') || '').toString().trim(),
        },
        internal: {
            clubDescription: (formData.get('clubDescription') || '').toString().trim(),
            clubExampleActivities: exampleActivitiesRaw
                .split('\n')
                .map((line) => line.trim())
                .filter(Boolean),
        },
    }
}

function StartClubPage({ currentUser, selectedCampus, onRequireAuth }) {
    const [submittedFileName, setSubmittedFileName] = useState('')
    const [statusMessage, setStatusMessage] = useState('')
    const canSubmit = Boolean(currentUser && selectedCampus)

    const destinationPath = useMemo(() => 'frontend/src/data/club-submissions/', [])

    const handleSubmit = (event) => {
        event.preventDefault()

        if (!canSubmit) {
            setStatusMessage('Sign in with a selected campus before submitting a new club request.')
            return
        }

        const formData = new FormData(event.currentTarget)
        const payload = buildSubmissionPayload(formData, selectedCampus, currentUser)
        const fileName = `${payload.id || `club-${Date.now()}`}.json`
        const jsonString = JSON.stringify(payload, null, 2)

        const blob = new Blob([jsonString], { type: 'application/json' })
        const blobUrl = URL.createObjectURL(blob)
        const downloadLink = document.createElement('a')
        downloadLink.href = blobUrl
        downloadLink.download = fileName
        downloadLink.click()
        URL.revokeObjectURL(blobUrl)

        const existingQueue = JSON.parse(window.localStorage.getItem('club-submission-queue') || '[]')
        const queuedSubmission = { fileName, payload }
        window.localStorage.setItem('club-submission-queue', JSON.stringify([...existingQueue, queuedSubmission]))

        setSubmittedFileName(fileName)
        setStatusMessage(`JSON generated as ${fileName}. Move it into ${destinationPath} when ready.`)
        event.currentTarget.reset()
    }

    if (!currentUser) {
        return (
            <main className={styles.startClub}>
                <section className={styles.startClub__panel}>
                    <h2 className={styles.startClub__title}>Sign in to start a club</h2>
                    <p className={styles.startClub__description}>You need to sign in before creating a new club submission.</p>
                    <Button onClick={onRequireAuth}>Sign in</Button>
                </section>
            </main>
        )
    }

    return (
        <main className={styles.startClub}>
            <section className={styles.startClub__panel}>
                <p className={styles.startClub__meta}>Campus: {selectedCampus?.name || 'Not selected'}</p>
                <h2 className={styles.startClub__title}>Start a club submission</h2>
                <p className={styles.startClub__description}>Complete this form to generate a JSON draft for a new club profile.</p>

                <form className={styles.startClub__form} onSubmit={handleSubmit}>
                    <label className={styles.startClub__field}>
                        <span>Club name</span>
                        <input className={styles.startClub__input} name="clubName" type="text" required />
                    </label>
                    <label className={styles.startClub__field}>
                        <span>Club email</span>
                        <input className={styles.startClub__input} name="clubEmail" type="email" required />
                    </label>
                    <label className={styles.startClub__field}>
                        <span>Club meeting times</span>
                        <input className={styles.startClub__input} name="meetingTimes" type="text" required />
                    </label>
                    <label className={styles.startClub__field}>
                        <span>Zoom link (optional)</span>
                        <input className={styles.startClub__input} name="zoomLink" type="url" placeholder="https://..." />
                    </label>
                    <label className={styles.startClub__field}>
                        <span>Advisor name</span>
                        <input className={styles.startClub__input} name="advisorName" type="text" required />
                    </label>
                    <label className={styles.startClub__field}>
                        <span>Advisor email</span>
                        <input className={styles.startClub__input} name="advisorEmail" type="email" required />
                    </label>
                    <label className={styles.startClub__field}>
                        <span>Club description (internal)</span>
                        <textarea className={styles.startClub__textarea} name="clubDescription" rows="4" required />
                    </label>
                    <label className={styles.startClub__field}>
                        <span>Club example activities (internal, one per line)</span>
                        <textarea className={styles.startClub__textarea} name="exampleActivities" rows="4" required />
                    </label>

                    <Button type="submit" variant="primary" disabled={!canSubmit}>
                        Generate club JSON
                    </Button>
                </form>

                {statusMessage ? <p className={styles.startClub__status}>{statusMessage}</p> : null}
                {submittedFileName ? <p className={styles.startClub__meta}>Latest file: {submittedFileName}</p> : null}
            </section>
        </main>
    )
}

export default StartClubPage
