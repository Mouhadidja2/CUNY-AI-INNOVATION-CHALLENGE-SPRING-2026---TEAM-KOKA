import ClubsHub from '../components/ClubsHub/ClubsHub'

function ClubsPage({ selectedCampus, clubs, events, searchQuery, onSearchQueryChange, onClubOpen, onViewAllClubs, onViewAllEvents }) {
    return (
        <main>
            <ClubsHub
                selectedCampus={selectedCampus}
                clubs={clubs}
                events={events}
                searchQuery={searchQuery}
                onSearchQueryChange={onSearchQueryChange}
                onClubOpen={onClubOpen}
                onViewAllClubs={onViewAllClubs}
                onViewAllEvents={onViewAllEvents}
            />
        </main>
    )
}

export default ClubsPage
