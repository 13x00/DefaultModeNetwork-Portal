'use client';

import { useState, useRef, useEffect } from 'react';
import { PortalMessage } from '@/lib/fsdb';

interface ComposerProps {
  onMessageSubmit: (message: PortalMessage) => void;
  isSubmitting?: boolean;
}

export default function Composer({ onMessageSubmit, isSubmitting = false }: ComposerProps) {
  const [text, setText] = useState('');
  const [isDebouncing, setIsDebouncing] = useState(false);
  const [lastSentMessage, setLastSentMessage] = useState<string>('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout>();
  const confirmationRef = useRef<NodeJS.Timeout>();
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting || isDebouncing || !text.trim()) return;
    
    setIsDebouncing(true);
    
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: text.trim() }),
      });
      
      if (response.ok) {
        const newMessage = await response.json();
        onMessageSubmit(newMessage);
        setLastSentMessage(text.trim());
        setText('');
        setShowConfirmation(true);
        inputRef.current?.focus();
        
        // Hide confirmation after 3 seconds
        if (confirmationRef.current) {
          clearTimeout(confirmationRef.current);
        }
        confirmationRef.current = setTimeout(() => {
          setShowConfirmation(false);
        }, 3000);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to submit message');
      }
    } catch (error) {
      console.error('Error submitting message:', error);
      alert('Failed to submit message');
    } finally {
      // Debounce for 400ms
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      debounceRef.current = setTimeout(() => {
        setIsDebouncing(false);
      }, 400);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
    
    // Show typing indicator
    setIsTyping(true);
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Hide typing indicator after 1 second of no typing
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 1000);
  };

  const isValid = text.trim().length > 0 && text.trim().length <= 160;
  const isDisabled = isSubmitting || isDebouncing || !isValid;

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      if (confirmationRef.current) {
        clearTimeout(confirmationRef.current);
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto">
      <form onSubmit={handleSubmit}>
        <div className="flex items-center gap-3">
          {/* Typing indicator - reserve space */}
          <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
            {isTyping && (
              <div className="floating-dots"></div>
            )}
          </div>
          
          <div className="flex-1 relative">
            {/* Confirmation message - only matches input width */}
            {showConfirmation && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg min-h-[64px] flex items-center">
                <div className="flex items-center gap-2 w-full">
                  <svg className="w-4 h-4 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-green-800 dmn-text flex-1">
                    Message sent: "{lastSentMessage}"
                  </span>
                </div>
              </div>
            )}
            {/* Main input field with integrated send button */}
            <div className="flex items-center terminal-input h-16">
              <input
                ref={inputRef}
                type="text"
                value={text}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Enter message for DMN Lab..."
                maxLength={160}
                disabled={isSubmitting}
                className="flex-1 px-4 py-4 text-lg dmn-text bg-transparent border-none outline-none"
              />
              
              {/* Divider */}
              <div className="w-px h-8 bg-gray-300"></div>
              
              {/* Send button */}
              <button
                type="submit"
                disabled={isDisabled}
                className="px-4 py-4 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:bg-gray-50"
              >
                <svg className="w-5 h-5" style={{color: '#0015D5'}} fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              </button>
            </div>
            
            {/* Character counter */}
            <div className="absolute right-16 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
              <span className="text-xs text-gray-400 dmn-text">
                {text.length}/160
              </span>
              {isDebouncing && (
                <span className="text-xs text-yellow-600 dmn-text">
                  PROCESSING...
                </span>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
