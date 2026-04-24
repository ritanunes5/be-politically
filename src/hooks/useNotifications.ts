import { useEffect, useState } from 'react';

const STORAGE_KEY = 'bepolitic.notifications.unread';
const EVENT = 'bepolitic:notifications-updated';

function readCount(): number {
  if (typeof window === 'undefined') return 0;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw === null) return 2; // default seed: matches 2 unread mock items
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

export function setUnreadCount(count: number) {
  window.localStorage.setItem(STORAGE_KEY, String(Math.max(0, count)));
  window.dispatchEvent(new Event(EVENT));
}

export function useUnreadNotifications() {
  const [count, setCount] = useState<number>(() => readCount());

  useEffect(() => {
    const handler = () => setCount(readCount());
    window.addEventListener(EVENT, handler);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener(EVENT, handler);
      window.removeEventListener('storage', handler);
    };
  }, []);

  return count;
}
