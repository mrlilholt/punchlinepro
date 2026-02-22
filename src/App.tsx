import { Navigate, NavLink, Route, Routes } from 'react-router-dom';

import { AuthGateContainer } from './features/auth/components/auth_gate_container';
import { FavoritesPage } from './features/leaderboard/components/favorites_page';
import { GameplayContainer } from './features/game/components/gameplay_container';
import { ReleaseCountdownPanel } from './features/game/components/release_countdown_panel';
import { JokeHistoryPanel } from './features/leaderboard/components/joke_history_panel';
import { LeaderboardPanel } from './features/leaderboard/components/leaderboard_panel';
import { is_supabase_configured } from './lib/supabase';
import { Card } from './shared/components/ui/card';
import { merge_class_names } from './shared/utils/merge_class_names';

function HomePage({ userId }: { userId: string }) {
  return (
    <main className="page-grid">
      <section className="main-stack">
        <ReleaseCountdownPanel />
        <GameplayContainer userId={userId} />
      </section>
      <aside className="sidebar-stack">
        <LeaderboardPanel />
        <JokeHistoryPanel userId={userId} />
      </aside>
    </main>
  );
}

function App() {
  if (!is_supabase_configured) {
    return (
      <div className="auth-shell">
        <Card className="auth-panel">
          <h1 className="panel-title">Configure Supabase credentials</h1>
          <p className="muted-copy">
            Set <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code>{' '}
            in your environment to run Punchline Pro.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <AuthGateContainer>
      {(session) => (
        <>
          <nav aria-label="Primary" className="app-route-nav">
            <NavLink
              className={({ isActive }) =>
                merge_class_names('app-route-link', isActive && 'app-route-link-active')
              }
              to="/"
            >
              Play
            </NavLink>
            <NavLink
              className={({ isActive }) =>
                merge_class_names('app-route-link', isActive && 'app-route-link-active')
              }
              to="/favorites"
            >
              Favorites
            </NavLink>
          </nav>

          <Routes>
            <Route path="/" element={<HomePage userId={session.user.id} />} />
            <Route path="/favorites" element={<FavoritesPage userId={session.user.id} />} />
            <Route path="*" element={<Navigate replace to="/" />} />
          </Routes>
        </>
      )}
    </AuthGateContainer>
  );
}

export default App;
