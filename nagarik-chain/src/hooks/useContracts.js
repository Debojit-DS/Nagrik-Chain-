import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { mockContractEvents } from '@data/contracts';
import { generateMockContractEvent } from '@utils/hashGenerator';

/**
 * Hook to manage the live contract event feed.
 */
export function useContracts() {
  const [events, setEvents] = useState(mockContractEvents);
  const [isPaused, setIsPaused] = useState(false);
  const [filter, setFilter] = useState('All');
  const intervalRef = useRef(null);

  // Auto-generate new events every 8–12s
  useEffect(() => {
    if (isPaused) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    const startInterval = () => {
      const delay = 8000 + Math.random() * 4000;
      intervalRef.current = setTimeout(() => {
        const newEvent = generateMockContractEvent();
        setEvents((prev) => {
          const next = [newEvent, ...prev];
          return next.length > 50 ? next.slice(0, 50) : next;
        });
        startInterval();
      }, delay);
    };

    startInterval();

    return () => {
      if (intervalRef.current) clearTimeout(intervalRef.current);
    };
  }, [isPaused]);

  const pauseFeed = useCallback(() => setIsPaused(true), []);
  const resumeFeed = useCallback(() => setIsPaused(false), []);

  const filteredEvents = useMemo(() => {
    if (filter === 'All') return events;
    const typeMap = {
      Identity: ['IDENTITY_CREATED'],
      Documents: ['DOCUMENT_ANCHORED'],
      Benefits: ['BENEFIT_TRIGGERED', 'BENEFIT_TRANSFERRED'],
      Flags: ['FLAG_RAISED', 'FLAG_RESOLVED'],
    };
    const types = typeMap[filter] || [];
    return events.filter((e) => types.includes(e.type));
  }, [events, filter]);

  return {
    events: filteredEvents,
    allEvents: events,
    isPaused,
    pauseFeed,
    resumeFeed,
    filter,
    setFilter,
  };
}
