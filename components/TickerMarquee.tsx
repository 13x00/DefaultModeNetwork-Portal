'use client';

import { useState } from 'react';
import { PortalMessage } from '@/lib/fsdb';

interface TickerMarqueeProps {
  messages: PortalMessage[];
  speed?: number;
  paused?: boolean;
}

export default function TickerMarquee({ messages, speed = 1, paused = false }: TickerMarqueeProps) {
  const [isHovered, setIsHovered] = useState(false);

  if (messages.length === 0) {
    return (
      <div className="w-full h-20 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <span className="text-gray-500">•</span>
          <span className="text-gray-500">NO_DATA</span>
          <span className="text-gray-500">•</span>
          <span className="text-gray-500">AWAITING_INPUT</span>
        </div>
      </div>
    );
  }

  // Create ticker-style text without time indicators
  const tickerItems = messages.map(msg => {
    return { text: msg.text };
  });

  // Calculate animation duration based on content length and speed
  const baseDuration = 20; // Base duration in seconds
  const animationDuration = baseDuration / speed;

  return (
    <div className="w-full">
      {/* Header */}
      <div className="text-center mb-2">
        <h2 className="text-lg font-medium text-gray-700">Hva andre har skrevet</h2>
      </div>
      
      {/* Marquee */}
      <div
        className="w-full h-20 overflow-hidden relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        aria-live="polite"
        aria-label="Message ticker"
      >
      <div
        className={`flex items-center h-full text-black whitespace-nowrap ${
          paused || isHovered ? 'animate-none' : 'animate-scroll'
        }`}
        style={{
          animationDuration: `${animationDuration}s`,
          animationTimingFunction: 'linear',
          animationIterationCount: 'infinite',
        }}
      >
        
        {/* Individual message items */}
        {tickerItems.map((item, index) => (
          <div key={`${index}-${item.text}`} className="flex items-center gap-3 mr-8">
            {/* Message text */}
            <span className="text-black">{item.text}</span>
            
            {/* Separator dot */}
            <div className="flex-shrink-0">
              <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Terminal cursor */}
      <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
        <div className="w-0.5 h-4 animate-pulse opacity-60 bg-gray-400"></div>
      </div>
      </div>
    </div>
  );
}
