import { CapabilityCard } from './CapabilityCard.js';

export default function Workouts() {
  return (
    <CapabilityCard
      title="Workout suggestions"
      description="Recommend workouts from activity patterns."
      endpoint="/api/workouts/suggestions/mona@example.com"
      emptyMessage="No workout suggestions"
      getItems={(payload) => Array.isArray((payload as { suggestions?: unknown[] })?.suggestions) ? (payload as { suggestions: unknown[] }).suggestions : []}
      renderItem={(item) => <>{String((item.title ?? 'Workout'))} {item.reason ? `• ${String(item.reason)}` : ''}</>}
    />
  );
}
