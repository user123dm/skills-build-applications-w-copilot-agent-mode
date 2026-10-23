import { CapabilityCard } from './CapabilityCard.js';

export default function Leaderboard() {
  return (
    <CapabilityCard
      title="Leaderboard"
      description="Compare team point totals."
      endpoint="/api/leaderboard"
      emptyMessage="No leaderboard"
      getItems={(payload) => Array.isArray((payload as { leaderboard?: unknown[] })?.leaderboard) ? (payload as { leaderboard: unknown[] }).leaderboard : []}
      renderItem={(item) => <>{String((item.teamName ?? 'Team'))}: {String((item.totalPoints ?? 0))} pts</>}
    />
  );
}
