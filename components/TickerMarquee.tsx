'use client';

import { useState } from 'react';
import { PortalMessage } from '@/lib/fsdb';
import { timeAgo } from '@/lib/time';

interface TickerMarqueeProps {
  messages: PortalMessage[];
  speed?: number;
  paused?: boolean;
}

export default function TickerMarquee({ messages, speed = 1, paused = false }: TickerMarqueeProps) {
  const [isHovered, setIsHovered] = useState(false);

  if (messages.length === 0) {
    return (
      <div className="w-full h-20 flex items-center justify-center terminal-rounded">
        <div className="flex items-center gap-3">
          <img src="/assets/Logo_Mark.png" alt="DMN Mark" className="h-6 w-auto" />
          <span className="ticker-separator">•</span>
          <span className="dmn-text" style={{color: '#0015D5'}}>NO_DATA</span>
          <span className="ticker-separator">•</span>
          <span className="text-black dmn-text">AWAITING_INPUT</span>
        </div>
      </div>
    );
  }

  // Create ticker-style text with time indicators
  const tickerItems = messages.map(msg => {
    const time = timeAgo(msg.createdAt);
    return { text: msg.text, time: time };
  });

  // Calculate animation duration based on content length and speed
  const baseDuration = 20; // Base duration in seconds
  const animationDuration = baseDuration / speed;

  return (
    <div
      className="w-full h-20 overflow-hidden relative terminal-rounded"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-live="polite"
      aria-label="DMN Lab ticker"
    >
      <div
        className={`flex items-center h-full dmn-text text-black whitespace-nowrap ${
          paused || isHovered ? 'animate-none' : 'animate-scroll'
        }`}
        style={{
          animationDuration: `${animationDuration}s`,
          animationTimingFunction: 'linear',
          animationIterationCount: 'infinite',
        }}
      >
        <div className="flex items-center gap-3 mr-12 flex-shrink-0">
          <img src="/assets/Logo_Mark.png" alt="DMN Mark" className="h-6 w-auto flex-shrink-0" />
          <span className="ticker-separator">•</span>
        </div>
        
        {/* Individual message items */}
        {tickerItems.map((item, index) => (
          <div key={`${index}-${item.text}`} className="flex items-center gap-3 mr-8">
            {/* Time indicator */}
            <div className="flex-shrink-0">
              <div className="bg-gray-100 rounded-lg px-2 py-1">
                <span className="text-xs text-gray-600 dmn-text font-medium">{item.time}</span>
              </div>
            </div>
            
            {/* Message text */}
            <span className="text-black dmn-text">{item.text}</span>
            
            {/* Separator dot */}
            <div className="flex-shrink-0">
              <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Terminal cursor */}
      <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
        <div className="w-0.5 h-4 animate-pulse opacity-60" style={{backgroundColor: '#0015D5'}}></div>
      </div>
    </div>
  );
}
