import styles from './metric-pill.module.scss'

function MetricPill({ label, value }) {
    return (
        <div className={styles.metricPill}>
            <span className={styles.metricPill__value}>{value}</span>
            <span className={styles.metricPill__label}>{label}</span>
        </div>
    )
}

export default MetricPill
