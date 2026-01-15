'use client';

import { useState, useRef, useEffect, KeyboardEvent } from 'react';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'assistant';
}

export default function ChatBox() {
  const [isOpen, setIsOpen] = useState(true); // Open by default
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: 'What can I do for you?', sender: 'assistant' },
  ]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const handleSend = () => {
    const trimmedInput = inputValue.trim();
    if (!trimmedInput) return;

    const userMessage: Message = {
      id: Date.now(),
      text: trimmedInput,
      sender: 'user',
    };

    const assistantMessage: Message = {
      id: Date.now() + 1,
      text: 'Thanks — I got your message.',
      sender: 'assistant',
    };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setInputValue('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Inline styles to guarantee visibility
  const containerStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: '16px',
    right: '16px',
    zIndex: 99999,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  };

  const chatWindowStyle: React.CSSProperties = {
    marginBottom: '12px',
    width: '360px',
    maxWidth: 'calc(100vw - 32px)',
    height: '420px',
    maxHeight: 'calc(100vh - 100px)',
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
    border: '2px solid #0ea5e9',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  };

  const headerStyle: React.CSSProperties = {
    padding: '14px 16px',
    background: 'linear-gradient(to right, #0ea5e9, #14b8a6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  };

  const headerTitleStyle: React.CSSProperties = {
    color: '#ffffff',
    fontWeight: 600,
    fontSize: '15px',
    margin: 0,
  };

  const closeButtonStyle: React.CSSProperties = {
    background: 'rgba(255, 255, 255, 0.2)',
    border: 'none',
    borderRadius: '8px',
    padding: '6px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const messagesAreaStyle: React.CSSProperties = {
    flex: 1,
    overflowY: 'auto',
    padding: '16px',
    backgroundColor: '#f8fafc',
  };

  const userMessageStyle: React.CSSProperties = {
    maxWidth: '80%',
    padding: '10px 14px',
    borderRadius: '18px 18px 4px 18px',
    backgroundColor: '#0ea5e9',
    color: '#ffffff',
    fontSize: '14px',
    marginLeft: 'auto',
    marginBottom: '10px',
  };

  const assistantMessageStyle: React.CSSProperties = {
    maxWidth: '80%',
    padding: '10px 14px',
    borderRadius: '18px 18px 18px 4px',
    backgroundColor: '#ffffff',
    color: '#1f2937',
    fontSize: '14px',
    border: '1px solid #e5e7eb',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
    marginBottom: '10px',
  };

  const inputAreaStyle: React.CSSProperties = {
    padding: '12px',
    backgroundColor: '#ffffff',
    borderTop: '1px solid #e5e7eb',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  };

  const inputStyle: React.CSSProperties = {
    flex: 1,
    padding: '10px 16px',
    fontSize: '14px',
    border: '2px solid #e5e7eb',
    borderRadius: '24px',
    outline: 'none',
    transition: 'border-color 0.2s',
  };

  const sendButtonStyle: React.CSSProperties = {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: inputValue.trim() ? '#0ea5e9' : '#d1d5db',
    border: 'none',
    cursor: inputValue.trim() ? 'pointer' : 'not-allowed',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.2s',
  };

  const toggleButtonStyle: React.CSSProperties = {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    background: 'linear-gradient(to right, #0ea5e9, #14b8a6)',
    border: 'none',
    boxShadow: '0 4px 20px rgba(14, 165, 233, 0.4)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'transform 0.2s, box-shadow 0.2s',
  };

  return (
    <div style={containerStyle}>
      {/* Chat Window */}
      {isOpen && (
        <div
          style={chatWindowStyle}
          role="dialog"
          aria-labelledby="chat-title"
          aria-modal="true"
        >
          {/* Header */}
          <div style={headerStyle}>
            <h2 id="chat-title" style={headerTitleStyle}>
              Chat with us
            </h2>
            <button
              onClick={() => setIsOpen(false)}
              style={closeButtonStyle}
              aria-label="Close chat"
            >
              <svg width="18" height="18" fill="none" stroke="#ffffff" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages Area */}
          <div
            style={messagesAreaStyle}
            role="log"
            aria-live="polite"
            aria-label="Chat messages"
          >
            {messages.map((message) => (
              <div
                key={message.id}
                style={message.sender === 'user' ? userMessageStyle : assistantMessageStyle}
              >
                {message.text}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div style={inputAreaStyle}>
            <label htmlFor="chat-input" style={{ position: 'absolute', left: '-9999px' }}>
              Type your message
            </label>
            <input
              ref={inputRef}
              id="chat-input"
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              style={inputStyle}
              aria-label="Message input"
            />
            <button
              onClick={handleSend}
              disabled={!inputValue.trim()}
              style={sendButtonStyle}
              aria-label="Send message"
            >
              <svg width="20" height="20" fill="none" stroke="#ffffff" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={toggleButtonStyle}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
        aria-expanded={isOpen}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)';
          e.currentTarget.style.boxShadow = '0 6px 25px rgba(14, 165, 233, 0.5)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 4px 20px rgba(14, 165, 233, 0.4)';
        }}
      >
        {isOpen ? (
          <svg width="24" height="24" fill="none" stroke="#ffffff" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg width="24" height="24" fill="none" stroke="#ffffff" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )}
      </button>
    </div>
  );
}
