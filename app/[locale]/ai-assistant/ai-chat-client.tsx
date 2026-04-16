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
      message: `Hola, soy tu Asistente Académico. Cuéntame cómo puedo ayudarte.`,
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
    <div className="app-panel-strong flex min-h-[72vh] w-full flex-col overflow-hidden rounded-[2rem]">
      <div className="border-b border-zinc-200 bg-[linear-gradient(135deg,#f8fbff,#ffffff)] p-6 dark:border-zinc-700 dark:bg-[linear-gradient(135deg,#0f242b,#0a171c)]">
        <p className="app-kicker text-xs font-bold uppercase">Academic Copilot</p>
        <h1 className="mt-3 text-2xl font-black text-zinc-950 dark:text-zinc-100">{t('title')}</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-200">{t('subtitle')}</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map(message => (
          <div
            key={message.id}
            className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-2xl rounded-2xl px-4 py-3 ${
                message.isUser
                  ? 'rounded-br-none bg-[linear-gradient(135deg,#157a6e,#115e58)] text-white shadow-[0_14px_28px_rgba(21,122,110,0.18)]'
                  : 'rounded-bl-none border border-zinc-200 bg-zinc-50 text-zinc-900 dark:border-[#28505a] dark:bg-[linear-gradient(180deg,#15323a,#10252c)] dark:text-[#eef8f7]'
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
            <div className="rounded-2xl rounded-bl-none border border-zinc-200 bg-zinc-50 p-4 space-y-2 dark:border-[#28505a] dark:bg-[linear-gradient(180deg,#15323a,#10252c)]">
              <div className="flex gap-2">
                <div className="h-2 w-2 animate-bounce rounded-full bg-teal-400"></div>
                <div className="h-2 w-2 animate-bounce rounded-full bg-teal-400" style={{ animationDelay: '0.1s' }}></div>
                <div className="h-2 w-2 animate-bounce rounded-full bg-teal-400" style={{ animationDelay: '0.2s' }}></div>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-200">Analizando tu contexto académico...</p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-zinc-200 bg-white/80 p-6 dark:border-zinc-700 dark:bg-[#091419]/90">
        <form onSubmit={handleSendMessage} className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={t('placeholder')}
            disabled={isLoading}
            className="app-input flex-1 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="rounded-2xl bg-[linear-gradient(135deg,#0f6cbd,#0b4f8a)] px-6 py-3 font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50 hover:brightness-105"
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
              className="truncate rounded-lg border border-zinc-300 px-3 py-2 text-left text-xs text-zinc-600 transition-colors hover:bg-zinc-50 disabled:opacity-50 dark:border-[#28505a] dark:bg-[#102229] dark:text-[#dff3f1] dark:hover:bg-[#15323a]"
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
