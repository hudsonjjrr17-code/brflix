import React, { useState, useRef, useEffect } from 'react';
import { SparklesIcon, XMarkIcon } from './Icons';
import { ChatMessage, Movie } from '../types';
import { getGeminiRecommendations } from '../services/geminiService';

interface GeminiChatProps {
  currentMovie?: Movie | null;
  onClose: () => void;
  onSearchRequest: (query: string) => void;
}

const GeminiChat: React.FC<GeminiChatProps> = ({ currentMovie, onClose, onSearchRequest }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Olá! Sou o CineBot. Me diga o que você gosta ou peça uma recomendação!' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    const movieContext = currentMovie ? currentMovie.title : undefined;
    const responseText = await getGeminiRecommendations(userMsg, movieContext);

    setMessages(prev => [...prev, { role: 'model', text: responseText }]);
    setIsLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 w-full max-w-sm overflow-hidden rounded-2xl bg-gray-900 border border-gray-800 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between bg-gradient-to-r from-red-800 to-red-600 p-4 text-white">
        <div className="flex items-center gap-2">
          <SparklesIcon className="h-5 w-5 animate-pulse text-yellow-300" />
          <h3 className="font-bold">CineBot AI</h3>
        </div>
        <button onClick={onClose} className="rounded-full p-1 hover:bg-white/20">
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="h-80 overflow-y-auto p-4 space-y-4 bg-gray-900">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div 
              className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
                msg.role === 'user' 
                  ? 'bg-red-600 text-white rounded-br-none' 
                  : 'bg-gray-800 text-gray-200 rounded-bl-none border border-gray-700'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-800 rounded-2xl px-4 py-2 rounded-bl-none flex gap-1">
              <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-75"></span>
              <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-150"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-800 bg-gray-900 p-3">
        <div className="relative">
          <input
            type="text"
            className="w-full rounded-full bg-gray-800 py-3 pl-4 pr-12 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600"
            placeholder="Recomende um filme de terror..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button 
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-red-600 p-1.5 text-white disabled:opacity-50 hover:bg-red-700 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default GeminiChat;
