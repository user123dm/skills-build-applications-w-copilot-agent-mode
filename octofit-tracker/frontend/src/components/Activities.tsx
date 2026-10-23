import { CapabilityCard } from './CapabilityCard.js';
import { getJson } from '../api/client.js';

function loadActivities() {
  return getJson('/api/activities');
}

export default function Activities() {
  return (
    <CapabilityCard
      title="Activities"
      description="Track student activity minutes and points."
      loadData={loadActivities}
      emptyMessage="No activities"
      getItems={(payload) => Array.isArray((payload as { activities?: unknown[] })?.activities) ? (payload as { activities: unknown[] }).activities : []}
      renderItem={(item) => <>{String((item.type ?? 'activity'))} • {String((item.minutes ?? 0))} min</>}
    />
  );
}
