import styles from './button.module.scss'

function Button({ children, onClick, type = 'button', variant = 'primary', fullWidth = false, disabled = false }) {
    const variantClass = styles[`button--${variant}`] || styles['button--primary']

    return (
        <button
            className={`${styles.button} ${variantClass} ${fullWidth ? styles['button--full-width'] : ''}`.trim()}
            type={type}
            onClick={onClick}
            disabled={disabled}
        >
            {children}
        </button>
    )
}

export default Button
