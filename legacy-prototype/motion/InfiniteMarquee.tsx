import React from 'react';

interface InfiniteMarqueeProps {
  children: React.ReactNode;
  direction?: 'left' | 'right';
  speed?: 'slow' | 'normal' | 'fast';
  className?: string;
  pauseOnHover?: boolean;
}

export const InfiniteMarquee: React.FC<InfiniteMarqueeProps> = ({
  children,
  direction = 'left',
  speed = 'normal',
  className = '',
  pauseOnHover = true
}) => {
  const durationClass =
    speed === 'fast' ? 'duration-[20s]' : speed === 'slow' ? 'duration-[50s]' : 'duration-[35s]';

  const animationName = direction === 'left' ? 'animate-marquee' : 'animate-marqueeReverse';

  return (
    <div
      className={`relative overflow-hidden w-full marquee-container py-1 ${className}`}
    >
      <div
        className={`flex w-fit whitespace-nowrap will-change-transform ${animationName} ${durationClass} ${
          pauseOnHover ? 'hover:[animation-play-state:paused]' : ''
        }`}
      >
        <div className="flex items-center shrink-0 space-x-4 pr-4">
          {children}
        </div>
        <div className="flex items-center shrink-0 space-x-4 pr-4" aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  );
};
