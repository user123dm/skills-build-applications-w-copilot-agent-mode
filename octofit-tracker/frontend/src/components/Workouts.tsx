import { CapabilityCard } from './CapabilityCard.js';
import { getJson } from '../api/client.js';

function loadWorkoutSuggestions() {
  return getJson('/api/workouts/suggestions/mona@example.com');
}

export default function Workouts() {
  return (
    <CapabilityCard
      title="Workout suggestions"
      description="Recommend workouts from activity patterns."
      loadData={loadWorkoutSuggestions}
      emptyMessage="No workout suggestions"
      getItems={(payload) => Array.isArray((payload as { suggestions?: unknown[] })?.suggestions) ? (payload as { suggestions: unknown[] }).suggestions : []}
      renderItem={(item) => <>{String((item.title ?? 'Workout'))} {item.reason ? `• ${String(item.reason)}` : ''}</>}
    />
  );
}
