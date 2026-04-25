import { useState, useMemo } from 'react'
import Card from '../components/Card/Card'
import styles from './searchResults.module.scss'

function SearchResults({ searchQuery, onSearchQueryChange, allClubs, onClubOpen, onBackHome }) {
    const [sortOrder, setSortOrder] = useState('az')
    const [activeCategory, setActiveCategory] = useState('All')

    const categories = useMemo(() => {
        const uniqueCategories = [...new Set(allClubs.map((club) => club.category))]
        return uniqueCategories.sort()
    }, [allClubs])

    const normalizedQuery = searchQuery.trim().toLowerCase()

    const filteredAndSorted = useMemo(() => {
        let results = allClubs.filter((club) => {
            const matchesSearch =
                !normalizedQuery ||
                club.name.toLowerCase().includes(normalizedQuery) ||
                club.category.toLowerCase().includes(normalizedQuery) ||
                club.shortDescription.toLowerCase().includes(normalizedQuery)

            const matchesCategory = activeCategory === 'All' || club.category === activeCategory

            return matchesSearch && matchesCategory
        })

        results = [...results].sort((a, b) => {
            if (sortOrder === 'az') {
                return a.name.localeCompare(b.name)
            }
            if (sortOrder === 'za') {
                return b.name.localeCompare(a.name)
            }
            return 0
        })

        return results
    }, [allClubs, normalizedQuery, activeCategory, sortOrder])

    return (
        <main className={styles.searchResults}>
            <section className={styles.searchResults__header}>
                <p className={styles.searchResults__breadcrumb}>
                    <button type="button" className={styles.searchResults__breadcrumbLink} onClick={onBackHome}>
                        Home
                    </button>
                    <span className={styles.searchResults__breadcrumbDivider} aria-hidden="true">
                        /
                    </span>
                    <span aria-current="page">Search</span>
                </p>

                <h1 className={styles.searchResults__title}>Search Results</h1>
                {normalizedQuery ? (
                    <p className={styles.searchResults__subtitle}>
                        Showing results for &ldquo;{searchQuery.trim()}&rdquo;
                    </p>
                ) : (
                    <p className={styles.searchResults__subtitle}>Browse all clubs below, or type a query to filter.</p>
                )}
            </section>

            <section>
                <div className={styles.searchResults__toolbar}>
                    <div className={styles.searchResults__searchField}>
                        <label className={styles.searchResults__label} htmlFor="search-results-input">
                            Refine search
                        </label>
                        <input
                            id="search-results-input"
                            className={styles.searchResults__input}
                            type="search"
                            value={searchQuery}
                            onChange={(event) => onSearchQueryChange(event.target.value)}
                            placeholder="Club name, category, or keyword..."
                        />
                    </div>

                    <div className={styles.searchResults__sortField}>
                        <label className={styles.searchResults__label} htmlFor="search-sort-select">
                            Sort by
                        </label>
                        <select
                            id="search-sort-select"
                            className={styles.searchResults__select}
                            value={sortOrder}
                            onChange={(event) => setSortOrder(event.target.value)}
                        >
                            <option value="az">A → Z</option>
                            <option value="za">Z → A</option>
                        </select>
                    </div>
                </div>
            </section>

            <section>
                <div className={styles.searchResults__filters}>
                    <button
                        type="button"
                        className={`${styles.searchResults__filterPill} ${activeCategory === 'All' ? styles['searchResults__filterPill--active'] : ''}`.trim()}
                        onClick={() => setActiveCategory('All')}
                    >
                        All
                    </button>
                    {categories.map((category) => (
                        <button
                            key={category}
                            type="button"
                            className={`${styles.searchResults__filterPill} ${activeCategory === category ? styles['searchResults__filterPill--active'] : ''}`.trim()}
                            onClick={() => setActiveCategory(category)}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </section>

            <p className={styles.searchResults__count}>
                {filteredAndSorted.length} {filteredAndSorted.length === 1 ? 'club' : 'clubs'} found
            </p>

            <section>
                <div className={styles.searchResults__grid}>
                    {filteredAndSorted.length ? (
                        filteredAndSorted.map((club) => (
                            <Card
                                key={club.id}
                                title={club.name}
                                description={club.shortDescription}
                                logoSrc={club.banner}
                                href={`/club/${club.id}`}
                                onNavigate={() => onClubOpen(club.id)}
                                target="_self"
                                ctaLabel="View profile"
                            />
                        ))
                    ) : (
                        <p className={styles.searchResults__empty}>
                            No clubs match your search and filter criteria. Try broadening your query or selecting a different category.
                        </p>
                    )}
                </div>
            </section>
        </main>
    )
}

export default SearchResults
