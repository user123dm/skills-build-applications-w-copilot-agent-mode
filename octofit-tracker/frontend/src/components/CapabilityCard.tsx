import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

type Props = {
  title: string;
  description: string;
  endpoint: string;
  emptyMessage: string;
  getItems: (payload: unknown) => unknown[];
  renderItem: (item: Record<string, unknown>, index: number) => React.ReactNode;
};

export function CapabilityCard({ title, description, endpoint, emptyMessage, getItems, renderItem }: Props) {
  const [items, setItems] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    setLoading(true);
    setError(null);

    getJson(endpoint)
      .then((payload) => {
        if (!active) return;
        setItems(getItems(payload));
      })
      .catch((caughtError: Error) => {
        if (!active) return;
        setError(caughtError.message || 'Unable to load data');
        setItems([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [endpoint]);

  return (
    <section className="card h-100">
      <div className="card-body">
        <h2 className="h4">{title}</h2>
        <p>{description}</p>
        {loading ? (
          <p role="status">Loading...</p>
        ) : error ? (
          <div role="alert">Unable to load {title.toLowerCase()}.</div>
        ) : items.length === 0 ? (
          <p>{emptyMessage}</p>
        ) : (
          <ul className="list-unstyled mb-0">{items.map((item, index) => <li key={String(index)}>{renderItem(item as Record<string, unknown>, index)}</li>)}</ul>
        )}
      </div>
    </section>
  );
}
