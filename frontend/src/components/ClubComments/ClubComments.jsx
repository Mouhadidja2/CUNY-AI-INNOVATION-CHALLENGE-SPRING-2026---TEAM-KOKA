import { useState } from 'react'
import Button from '../Button/Button'
import styles from './clubComments.module.scss'

function ClubComments({ clubId, currentUser }) {
    const storageKey = `club-comments-${clubId}`

    const [comments, setComments] = useState(() => {
        try {
            return JSON.parse(window.localStorage.getItem(storageKey) || '[]')
        } catch {
            return []
        }
    })
    const [newComment, setNewComment] = useState('')

    const persistComments = (next) => {
        setComments(next)
        window.localStorage.setItem(storageKey, JSON.stringify(next))
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        const text = newComment.trim()
        if (!text || !currentUser) return

        const comment = {
            id: `cmt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            author: currentUser.name,
            role: currentUser.role,
            text,
            createdAt: new Date().toISOString(),
        }
        persistComments([comment, ...comments])
        setNewComment('')
    }

    const formatDate = (iso) => {
        const d = new Date(iso)
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
            ' at ' +
            d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    }

    return (
        <section className={styles.comments} aria-labelledby="comments-title">
            <h3 className={styles.comments__title} id="comments-title">Comments</h3>

            {currentUser ? (
                <form className={styles.comments__form} onSubmit={handleSubmit}>
                    <textarea
                        className={styles.comments__textarea}
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Share your thoughts about this club..."
                        rows={3}
                        required
                    />
                    <Button type="submit" variant="primary" disabled={!newComment.trim()}>
                        Post Comment
                    </Button>
                </form>
            ) : (
                <p className={styles.comments__loginHint}>Sign in to leave a comment.</p>
            )}

            <div className={styles.comments__list}>
                {comments.length ? (
                    comments.map((comment) => (
                        <article key={comment.id} className={styles.comments__item}>
                            <div className={styles.comments__header}>
                                <span className={styles.comments__author}>{comment.author}</span>
                                <span className={styles.comments__role}>{comment.role}</span>
                                <span className={styles.comments__date}>{formatDate(comment.createdAt)}</span>
                            </div>
                            <p className={styles.comments__text}>{comment.text}</p>
                        </article>
                    ))
                ) : (
                    <p className={styles.comments__empty}>No comments yet. Be the first to share your thoughts!</p>
                )}
            </div>
        </section>
    )
}

export default ClubComments
