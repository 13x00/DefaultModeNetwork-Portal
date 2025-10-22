'use client';

import { useState, useEffect, useCallback } from 'react';
import { PortalMessage } from '@/lib/fsdb';
import TickerMarquee from '@/components/TickerMarquee';
import Composer from '@/components/Composer';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

export default function Home() {
  const [messages, setMessages] = useState<PortalMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [dotLottieSrc, setDotLottieSrc] = useState<string>('/assets/DMN_LogoAnimationV2.lottie');

  const fetchMessages = useCallback(async () => {
    try {
      console.log('Fetching messages...');
      
      // Add loading delay to match Lottie animation duration (115 frames at 15fps = ~7.67 seconds)
      await new Promise(resolve => setTimeout(resolve, 7670));
      
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
    } finally {
      console.log('Setting loading to false');
      setIsLoading(false);
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white text-black flex items-center justify-center dmn-text">
        <div className="text-center -mt-16">
          <div className="flex flex-col items-center justify-center gap-30">
            {dotLottieSrc ? (
              <div className="w-80 h-80 flex items-center justify-center">
                <DotLottieReact
                  src={dotLottieSrc}
                  loop={false}
                  autoplay={true}
                  style={{ width: 480, height: 480 }}
                />
              </div>
            ) : (
              <div className="w-80 h-80 flex items-center justify-center">
                <img src="/assets/Logo_Mark.png" alt="DMN Mark" className="h-80 w-auto" />
              </div>
            )}
            <img src="/assets/Logo_Type.png" alt="DMN Lab" className="h-6 w-auto" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black flex flex-col dmn-text">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <img src="/assets/Logo_Type.png" alt="DMN Lab" className="dmn-logo" />
                <div className="dmn-text text-sm" style={{color: '#0015D5'}}>Default Mode Network Research Lab</div>
              </div>
            </div>
            
            {/* Controls */}
            <div className="flex items-center gap-4">
              {/* Speed Control */}
              <div className="flex items-center gap-2">
                <label htmlFor="speed" className="text-sm text-black dmn-text">SPEED:</label>
                <select
                  id="speed"
                  value={speed}
                  onChange={(e) => setSpeed(Number(e.target.value))}
                  className="terminal-input px-3 py-1 text-sm dmn-text"
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
                className="terminal-button px-4 py-2 text-sm dmn-text"
                aria-label={isPaused ? 'Resume scrolling' : 'Pause scrolling'}
              >
                {isPaused ? 'PLAY' : 'PAUSE'}
              </button>

              {/* Dev Menu */}
              <div className="relative group">
                <button className="text-black text-sm dmn-text hover:opacity-70" style={{color: 'inherit'}} onMouseEnter={(e) => e.target.style.color = '#0015D5'} onMouseLeave={(e) => e.target.style.color = 'inherit'}>MENU</button>
                <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-20">
                  <div className="py-2">
                    <button
                      onClick={() => setIsPaused(!isPaused)}
                      className="w-full text-left px-4 py-2 text-sm text-black hover:bg-blue-50 dmn-text"
                    >
                      {isPaused ? 'RESUME' : 'PAUSE'}
                    </button>
                    <button
                      onClick={handleArchive}
                      className="w-full text-left px-4 py-2 text-sm text-black hover:bg-blue-50 dmn-text"
                    >
                      ARCHIVE
                    </button>
                    <button
                      onClick={handleClearToday}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dmn-text"
                    >
                      CLEAR
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative">
        {/* Ticker Section - Absolute positioned */}
        <section className="absolute inset-0 flex items-center justify-center p-8">
          <div className="w-full max-w-7xl">
            <TickerMarquee 
              messages={messages} 
              speed={speed} 
              paused={isPaused}
            />
          </div>
        </section>

        {/* Composer Section */}
        <section className="absolute bottom-0 left-0 right-0 bg-white p-6">
          <div className="max-w-7xl mx-auto">
            <Composer 
              onMessageSubmit={handleMessageSubmit}
              isSubmitting={isSubmitting}
            />
          </div>
        </section>
      </main>
    </div>
  );
}
