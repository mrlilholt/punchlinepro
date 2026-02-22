import { Card } from '../../../shared/components/ui/card';
import { useLeaderboardQueryHook } from '../hooks/use_leaderboard_query_hook';

function format_points(totalScore: unknown): string {
  const numeric_score = Number(totalScore);

  return Number.isFinite(numeric_score) ? numeric_score.toFixed(1) : '0.0';
}

export function LeaderboardPanel() {
  const leaderboardQuery = useLeaderboardQueryHook();

  return (
    <Card className="leaderboard-panel">
      <div className="results-header">
        <p className="panel-eyebrow">Leaderboard</p>
        <span className="muted-copy">Top 5</span>
      </div>
      {(leaderboardQuery.data ?? []).map((leaderboardRow, index) => (
        <article className="leader-row" key={leaderboardRow.id}>
          <p className="guess-author">
            {index + 1}. {leaderboardRow.display_name ?? 'Unnamed'}
          </p>
          <p className="guess-meta">{format_points(leaderboardRow.total_score)} pts</p>
        </article>
      ))}
      {leaderboardQuery.isLoading ? (
        <p className="muted-copy">Loading leaderboard...</p>
      ) : null}
      {leaderboardQuery.error ? (
        <p className="feedback-error">Leaderboard unavailable.</p>
      ) : null}
    </Card>
  );
}
