import styles from './modal.module.scss'

function Modal({ isOpen, title, onClose, children, panelClassName = '' }) {
    if (!isOpen) {
        return null
    }

    return (
        <div className={styles.modal} role="dialog" aria-modal="true" aria-label={title}>
            <button className={styles.modal__backdrop} type="button" aria-label="Close modal" onClick={onClose} />
            <div className={`${styles.modal__panel} ${panelClassName}`.trim()} onClick={(event) => event.stopPropagation()}>
                <div className={styles.modal__header}>
                    <h2 className={styles.modal__title}>{title}</h2>
                    <button className={styles.modal__close} type="button" onClick={onClose} aria-label="Close modal">
                        x
                    </button>
                </div>
                <div className={styles.modal__content}>{children}</div>
            </div>
        </div>
    )
}

export default Modal
