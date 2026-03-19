'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { readStoredActivities } from '@/lib/activities-store';
import { analyzeStudentContext } from '@/lib/ai-context-analyzer';
import { generateAIResponse, type AIResponse } from '@/lib/ai-mock-engine';

export default function AIChatClient() {
  const t = useTranslations('AIAssistant');
  const [messages, setMessages] = useState<AIResponse[]>([
    {
      id: 'greeting',
      message: `👋 Hola, soy tu Asistente Académico. Cuéntame cómo puedo ayudarte.`,
      timestamp: new Date(),
      isUser: false,
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    const userMessage: AIResponse = {
      id: Date.now().toString(),
      message: input,
      timestamp: new Date(),
      isUser: true,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI thinking (2 seconds)
    setTimeout(() => {
      const activities = readStoredActivities();
      const context = analyzeStudentContext(activities);
      const responseText = generateAIResponse(input, context);

      const aiMessage: AIResponse = {
        id: (Date.now() + 1).toString(),
        message: responseText,
        timestamp: new Date(),
        isUser: false,
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div className="flex flex-col h-screen max-h-screen">
      {/* Header */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">{t('title')}</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">{t('subtitle')}</p>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map(message => (
          <div
            key={message.id}
            className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-2xl rounded-2xl px-4 py-3 ${
                message.isUser
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 rounded-bl-none'
              }`}
            >
              <div className="whitespace-pre-wrap break-normal text-sm leading-relaxed">
                {message.message.split('\n').map((line, i) => {
                  // Bold text detection for **text**
                  const parts = line.split(/\*\*(.+?)\*\*/).map((part, idx) => {
                    return idx % 2 === 1 ? (
                      <strong key={idx}>{part}</strong>
                    ) : (
                      <span key={idx}>{part}</span>
                    );
                  });

                  return (
                    <div key={i}>
                      {parts}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}

        {/* Loading Spinner */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-zinc-100 dark:bg-zinc-900 rounded-2xl rounded-bl-none p-4 space-y-2">
              <div className="flex gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6">
        <form onSubmit={handleSendMessage} className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={t('placeholder')}
            disabled={isLoading}
            className="flex-1 px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('send')}
          </button>
        </form>

        {/* Quick Action Buttons */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          {[
            { label: t('quickAction1'), prompt: '¿Cuál es mi carga de trabajo?' },
            { label: t('quickAction2'), prompt: '¿Cuál es mi próxima prioridad?' },
            { label: t('quickAction3'), prompt: '¿Voy bien académicamente?' },
            { label: t('quickAction4'), prompt: '¿Cómo puedo mejorar?' },
          ].map((action, i) => (
            <button
              key={i}
              onClick={() => {
                setInput(action.prompt);
              }}
              disabled={isLoading}
              className="text-xs px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors disabled:opacity-50 text-left truncate"
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
