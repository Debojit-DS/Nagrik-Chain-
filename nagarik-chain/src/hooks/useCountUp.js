import { useState, useEffect, useRef } from 'react';

/**
 * Animates a number from 0 to `target` over `duration` ms using rAF.
 * Respects prefers-reduced-motion.
 * @param {number} target - The target number
 * @param {number} duration - Animation duration in ms (default: 2000)
 * @returns {number} The current animated value
 */
export function useCountUp(target, duration = 2000) {
  const [value, setValue] = useState(0);
  const rafRef = useRef(null);

  useEffect(() => {
    // Respect reduced motion preference
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      setValue(target);
      return;
    }

    let start = null;
    const animate = (timestamp) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.floor(eased * target));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration]);

  return value;
}
