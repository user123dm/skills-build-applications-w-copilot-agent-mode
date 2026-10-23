import { CapabilityCard } from './CapabilityCard.js';

export default function Teams() {
  return (
    <CapabilityCard
      title="Teams"
      description="Manage teams and members."
      endpoint="/api/teams"
      emptyMessage="No teams"
      getItems={(payload) => Array.isArray((payload as { teams?: unknown[] })?.teams) ? (payload as { teams: unknown[] }).teams : []}
      renderItem={(item) => <>{String((item.name ?? 'Unknown team'))} • {Array.isArray(item.members) ? String(item.members.length) : '0'} members</>}
    />
  );
}
