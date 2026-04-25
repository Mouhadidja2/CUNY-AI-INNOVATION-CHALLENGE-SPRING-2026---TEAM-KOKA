import { useEffect } from 'react'
import styles from './toast.module.scss'

function Toast({ message, onClose }) {
    useEffect(() => {
        if (!message) {
            return undefined
        }

        const timeout = window.setTimeout(() => {
            onClose?.()
        }, 2800)

        return () => window.clearTimeout(timeout)
    }, [message, onClose])

    if (!message) {
        return null
    }

    return (
        <aside className={styles.toast} role="status" aria-live="polite">
            <p className={styles.toast__message}>{message}</p>
        </aside>
    )
}

export default Toast
