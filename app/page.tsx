'use client';

import { useState, useEffect, useCallback } from 'react';
import { PortalMessage } from '@/lib/fsdb';
import TickerMarquee from '@/components/TickerMarquee';
import Composer from '@/components/Composer';

export default function Home() {
  const [messages, setMessages] = useState<PortalMessage[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(1);

  const fetchMessages = useCallback(async () => {
    try {
      console.log('Fetching messages...');
      
      const response = await fetch('/api/messages');
      console.log('Response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('Messages received:', data.messages.length);
        setMessages(data.messages);
      } else {
        console.error('Response not ok:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  }, []);

  const handleMessageSubmit = useCallback(async (newMessage: PortalMessage) => {
    // Refresh messages from server to ensure we have the latest state
    try {
      const response = await fetch('/api/messages');
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages);
      }
    } catch (error) {
      console.error('Error refreshing messages:', error);
      // Fallback to adding to local state
      setMessages(prev => [...prev, newMessage]);
    }
  }, []);

  const handleArchive = async () => {
    try {
      const response = await fetch('/api/archive', { method: 'POST' });
      if (response.ok) {
        const data = await response.json();
        console.log(`Archived ${data.archived} messages, kept ${data.kept}`);
        // Refresh messages to show only today's
        await fetchMessages();
      }
    } catch (error) {
      console.error('Error archiving:', error);
    }
  };

  const handleClearToday = async () => {
    if (confirm('Are you sure you want to clear all messages from today?')) {
      try {
        const response = await fetch('/api/messages/clear', { method: 'POST' });
        if (response.ok) {
          console.log('Messages cleared successfully');
          // Clear the local state immediately
          setMessages([]);
          // Also refresh from server to ensure consistency
          const refreshResponse = await fetch('/api/messages');
          if (refreshResponse.ok) {
            const data = await refreshResponse.json();
            setMessages(data.messages);
          }
        } else {
          console.error('Failed to clear messages');
          alert('Failed to clear messages');
        }
      } catch (error) {
        console.error('Error clearing messages:', error);
        alert('Failed to clear messages');
      }
    }
  };


  useEffect(() => {
    console.log('useEffect triggered, calling fetchMessages');
    fetchMessages();
  }, [fetchMessages]);


  return (
    <div className="min-h-screen bg-white text-black flex flex-col">
      {/* Top spacer */}
      <div className="flex-1"></div>
      
      {/* Ticker Section - Moved down */}
      <section className="bg-white py-4 px-4">
        <div className="max-w-7xl mx-auto">
          <TickerMarquee 
            messages={messages} 
            speed={speed} 
            paused={isPaused}
          />
        </div>
      </section>

      {/* Spacer between marquee and controls */}
      <div className="h-[200px]"></div>

      {/* Controls Section - Close to marquee */}
      <section className="bg-white py-4 px-8">
        <div className="max-w-7xl mx-auto w-full">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <div className="text-sm text-gray-600">Message Portal</div>
              </div>
            </div>
            
            {/* Controls */}
            <div className="flex items-center gap-4">
              {/* Speed Control */}
              <div className="flex items-center gap-2">
                <label htmlFor="speed" className="text-sm text-black">SPEED:</label>
                <select
                  id="speed"
                  value={speed}
                  onChange={(e) => setSpeed(Number(e.target.value))}
                  className="terminal-input px-3 py-1 text-sm"
                >
                  <option value={0.5}>0.5x</option>
                  <option value={1}>1.0x</option>
                  <option value={1.5}>1.5x</option>
                  <option value={2}>2.0x</option>
                </select>
              </div>

              {/* Pause/Play Toggle */}
              <button
                onClick={() => setIsPaused(!isPaused)}
                className="terminal-button px-4 py-2 text-sm"
                aria-label={isPaused ? 'Resume scrolling' : 'Pause scrolling'}
              >
                {isPaused ? 'PLAY' : 'PAUSE'}
              </button>

              {/* Dev Menu */}
              <div className="relative group">
                <button className="text-black text-sm hover:opacity-70">MENU</button>
                <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-20">
                  <div className="py-2">
                    <button
                      onClick={() => setIsPaused(!isPaused)}
                      className="w-full text-left px-4 py-2 text-sm text-black hover:bg-gray-50"
                    >
                      {isPaused ? 'RESUME' : 'PAUSE'}
                    </button>
                    <button
                      onClick={handleArchive}
                      className="w-full text-left px-4 py-2 text-sm text-black hover:bg-gray-50"
                    >
                      ARCHIVE
                    </button>
                    <button
                      onClick={handleClearToday}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      CLEAR
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Spacer between controls and input */}
      <div className="h-[200px]"></div>

      {/* Composer Section - Moved up */}
      <section className="bg-white py-4 px-6 border-t border-gray-200">
        <div className="max-w-7xl mx-auto">
          <Composer 
            onMessageSubmit={handleMessageSubmit}
            isSubmitting={isSubmitting}
          />
        </div>
      </section>
      
      {/* Bottom spacer */}
      <div className="flex-1"></div>
    </div>
  );
}
