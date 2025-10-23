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
  const debounceRef = useRef<NodeJS.Timeout>();
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
        setText('');
        inputRef.current?.focus();
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
  };

  const isValid = text.trim().length > 0 && text.trim().length <= 160;
  const isDisabled = isSubmitting || isDebouncing || !isValid;

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto">
      <form onSubmit={handleSubmit}>
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            {/* Main input field with integrated send button */}
            <div className="flex items-center terminal-input h-16">
              <input
                ref={inputRef}
                type="text"
                value={text}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Skriv ned tankene dine"
                maxLength={160}
                disabled={isSubmitting}
                className="flex-1 px-4 py-4 text-lg bg-transparent border-none outline-none"
              />
              
              {/* Divider */}
              <div className="w-px h-8 bg-gray-300"></div>
              
              {/* Send button */}
              <button
                type="submit"
                disabled={isDisabled}
                className="px-4 py-4 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" style={{color: '#000000'}} fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              </button>
            </div>
            
            {/* Character counter */}
            <div className="absolute right-16 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
              <span className="text-xs text-gray-400">
                {text.length}/160
              </span>
              {isDebouncing && (
                <span className="text-xs text-yellow-600">
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
