import { useEffect, useState } from 'react';

const format = (timeZone: string): string =>
  new Intl.DateTimeFormat('en-GB', { timeZone, hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(new Date());

/** The studio's local time, ticking once a second. */
export function useClock(timeZone: string): string {
  const [time, setTime] = useState(() => format(timeZone));
  useEffect(() => {
    const id = setInterval(() => setTime(format(timeZone)), 1000);
    return () => clearInterval(id);
  }, [timeZone]);
  return time;
}

/** hours and minutes in a time zone, as numbers */
export function clockParts(timeZone: string, d = new Date()): [number, number] {
  const [h, m] = new Intl.DateTimeFormat('en-GB', { timeZone, hour: 'numeric', minute: 'numeric', hourCycle: 'h23' })
    .format(d)
    .split(':')
    .map(Number);
  return [h ?? 0, m ?? 0];
}
