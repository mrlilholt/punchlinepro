import { ReleaseCountdownPanel } from '../../game/components/release_countdown_panel';
import { JokeHistoryPanel } from './joke_history_panel';
import { LeaderboardPanel } from './leaderboard_panel';

interface FavoritesPageProps {
  userId: string;
}

export function FavoritesPage({ userId }: FavoritesPageProps) {
  return (
    <main className="page-grid">
      <section className="main-stack">
        <ReleaseCountdownPanel />
        <JokeHistoryPanel
          forcedTab="favorites"
          hideTabBar
          subtitleText="Saved punchlines only"
          titleText="Favorites"
          userId={userId}
        />
      </section>
      <aside className="sidebar-stack">
        <LeaderboardPanel />
      </aside>
    </main>
  );
}
