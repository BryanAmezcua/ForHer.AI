'use client';

import { useState, useEffect, useRef } from 'react';

export function MatchRing({ score }) {
  const [displayValue, setDisplayValue] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef(null);

  const shouldRender = score != null && score >= 85;

  // IntersectionObserver triggers count-up on first visibility
  useEffect(() => {
    if (!shouldRender) return;
    const el = ref.current;
    if (!el || hasAnimated) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasAnimated(true);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [shouldRender, hasAnimated]);

  // Count-up animation
  useEffect(() => {
    if (!shouldRender || !hasAnimated) return;

    let current = 0;
    const interval = setInterval(() => {
      current = Math.min(current + 2, score);
      setDisplayValue(current);
      if (current >= score) clearInterval(interval);
    }, 20);

    return () => clearInterval(interval);
  }, [shouldRender, hasAnimated, score]);

  if (!shouldRender) return null;

  const size = 40;
  const strokeWidth = 2.5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = hasAnimated ? score / 100 : 0;
  const dashOffset = circumference * (1 - progress);

  return (
    <div
      ref={ref}
      className={`relative inline-flex items-center justify-center ${
        score >= 90 ? 'confidence-ring-pulse' : ''
      }`}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
      >
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={strokeWidth}
        />
        {/* Progress arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#c8956c"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1)' }}
        />
      </svg>
      <span className="absolute text-[11px] font-bold text-copper tabular-nums">
        {displayValue}
      </span>
    </div>
  );
}
