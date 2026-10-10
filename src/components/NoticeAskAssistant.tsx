'use client';

import React, { useState } from 'react';
import { Send, Bot, Sparkles, MessageCircle } from 'lucide-react';
import { AccessLensAnalysis } from '@/lib/types';

interface NoticeAskAssistantProps {
  analysis: AccessLensAnalysis;
  imageBase64?: string | null;
}

export const NoticeAskAssistant: React.FC<NoticeAskAssistantProps> = ({
  analysis,
  imageBase64
}) => {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<Array<{ q: string; a: string; model?: string }>>([
    {
      q: 'Who is eligible to participate or apply?',
      a: analysis.eventDetails.eligibility
        ? `According to the flyer, eligibility is: "${analysis.eventDetails.eligibility}".`
        : 'The notice does not state explicit eligibility restrictions, implying general student participation.'
    }
  ]);

  const quickQuestions = [
    'Are freshers allowed to join?',
    'Is there any registration fee?',
    'Where is the exact room located?',
    'What is the last deadline?'
  ];

  const handleAsk = async (queryText?: string) => {
    const qToSend = queryText || question;
    if (!qToSend.trim() || loading) return;

    setLoading(true);
    setQuestion('');

    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: qToSend,
          context: analysis,
          imageBase64: imageBase64 || null
        })
      });

      const data = await res.json();
      setHistory((prev) => [
        ...prev,
        {
          q: qToSend,
          a: data.answer || 'No clear answer provided in notice records.',
          model: data.model
        }
      ]);
    } catch {
      setHistory((prev) => [
        ...prev,
        {
          q: qToSend,
          a: 'Could not contact assistant. Please verify network connection or refer to the notice text directly.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#ffffff] border-2 border-[#1e1b19] rounded-xl p-5 shadow-press space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#1e1b19]/20">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-[#ffddb6] border border-[#1e1b19] flex items-center justify-center text-xs">
            <Bot className="w-3.5 h-3.5 text-[#805200]" />
          </div>
          <div>
            <h3 className="font-display font-bold text-base text-[#1e1b19]">
              Ask Gemma About This Notice
            </h3>
            <p className="font-mono text-[10px] text-[#594139]">
              Direct grounded inquiry • No guessing • Zero hallucination
            </p>
          </div>
        </div>
        <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-[#c8ecca] text-[#03210c] border border-[#46664b]">
          Interactive Q&amp;A
        </span>
      </div>

      {/* Suggested Quick Questions */}
      <div className="flex flex-wrap gap-1.5 font-mono text-[11px]">
        {quickQuestions.map((q, i) => (
          <button
            key={i}
            type="button"
            onClick={() => handleAsk(q)}
            disabled={loading}
            className="px-2.5 py-1 bg-[#faf2ee] hover:bg-[#ffdbcf] text-[#1e1b19] border border-[#1e1b19] rounded font-bold shadow-press-xs active:translate-x-0.5 active:translate-y-0.5 transition-all text-left"
          >
            💬 {q}
          </button>
        ))}
      </div>

      {/* Dialogue Thread */}
      <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
        {history.map((item, idx) => (
          <div key={idx} className="space-y-1.5 font-sans text-xs">
            {/* Student Q */}
            <div className="flex items-start gap-2 text-[#a73400] font-bold">
              <MessageCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>{item.q}</span>
            </div>
            {/* AI Grounded Answer */}
            <div className="p-3 bg-[#faf2ee] border border-[#1e1b19]/30 rounded-lg text-[#1e1b19] font-serif leading-relaxed text-[13px] ml-5">
              {item.a}
              {item.model && (
                <span className="block mt-1 font-mono text-[9px] text-[#8d7168] uppercase">
                  Verified via {item.model}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Input box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleAsk();
        }}
        className="flex items-center gap-2 pt-1"
      >
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a question about this flyer..."
          disabled={loading}
          className="flex-1 px-3 py-2 text-xs font-mono bg-[#faf2ee] border-2 border-[#1e1b19] rounded-lg focus:outline-none focus:bg-white text-[#1e1b19]"
        />
        <button
          type="submit"
          disabled={loading || !question.trim()}
          className="px-3.5 py-2 bg-[#a73400] hover:bg-[#cb4914] disabled:opacity-50 text-white font-mono text-xs font-bold rounded-lg border-2 border-[#1e1b19] shadow-press-sm active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center gap-1 shrink-0"
        >
          {loading ? (
            <Sparkles className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Send className="w-3.5 h-3.5" />
          )}
          <span>{loading ? 'Reading...' : 'Ask'}</span>
        </button>
      </form>
    </div>
  );
};
