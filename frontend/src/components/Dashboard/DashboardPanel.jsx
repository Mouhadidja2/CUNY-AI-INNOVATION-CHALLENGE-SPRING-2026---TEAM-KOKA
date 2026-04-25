import styles from './dashboard-panel.module.scss'

function DashboardPanel({ title, items }) {
    return (
        <section className={styles.dashboardPanel}>
            <h3 className={styles.dashboardPanel__title}>{title}</h3>
            <ul className={styles.dashboardPanel__list}>
                {items.map((item) => (
                    <li className={styles.dashboardPanel__item} key={item}>
                        {item}
                    </li>
                ))}
            </ul>
        </section>
    )
}

export default DashboardPanel
