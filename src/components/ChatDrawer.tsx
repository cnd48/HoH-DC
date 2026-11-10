import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Sparkles,
  X,
  Send,
  ExternalLink,
  Bot,
  User,
  Shield,
  RotateCcw,
  Loader2,
  ChevronDown
} from 'lucide-react';
import {
  AssessmentState,
  Step1Answers,
  Step2Answers,
  Step3Answers,
  Step4Answers
} from '../types';
import { calculateNetEarnings } from '../utils/earnings';
import { calculateVerdict } from '../utils/verdict';
import { calculateRiskEvaluation } from '../utils/risks';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface ChatDrawerProps {
  assessment: AssessmentState;
}

export const ChatDrawer: React.FC<ChatDrawerProps> = ({ assessment }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Compute live assessment context for personalized Gemini prompt
  const earnings = calculateNetEarnings(assessment.step3);
  const verdict = calculateVerdict(
    assessment.step1,
    assessment.step2,
    assessment.step3,
    assessment.step4
  );
  const risks = calculateRiskEvaluation(
    assessment.step1,
    assessment.step2,
    assessment.step3
  );
  const hourlyRate = Math.round(
    earnings.netIncome / Math.max(1, (assessment.step4?.hoursPerWeek ?? 5) * 52)
  );

  const neighborhoodName = assessment.step3.neighborhood.split(',')[0];

  // Initialize welcome message once
  useEffect(() => {
    if (messages.length === 0) {
      const primaryStatus =
        assessment.step1.isMainResidence === 'yes'
          ? 'primary residence'
          : assessment.step1.isMainResidence === 'no'
          ? 'second/inherited property'
          : 'home';

      const spaceName =
        assessment.step3.spaceType === 'basement_unit'
          ? 'basement unit'
          : assessment.step3.spaceType === 'private_room'
          ? 'private room'
          : 'whole home';

      setMessages([
        {
          id: 'welcome-1',
          role: 'assistant',
          content: `Hi! I'm your DC hosting assistant. I can help you think through DC licensing (Law 22-559), HOA rules, the 90-night vacation rental cap, and whether listing your ${spaceName} in ${neighborhoodName} makes sense.\n\nWhat questions do you have about hosting in the District?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  }, [assessment.step3.spaceType, assessment.step1.isMainResidence, neighborhoodName]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  // Focus input when drawer opens and listen for Escape key
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Prepare context bundle
    const assessmentContext = {
      isMainResidence: assessment.step1.isMainResidence,
      householdComposition: assessment.step1.householdComposition,
      hasPrivateEntrance: assessment.step2.householdLiving?.hasPrivateEntrance,
      sharesKitchenBath: assessment.step2.householdLiving?.sharesKitchenBath,
      isNoiseAConcern: assessment.step2.householdLiving?.isNoiseAConcern,
      travelNightsPerYear: assessment.step2.householdLiving?.travelNightsPerYear,
      isCondoOrHoa: assessment.step2.isCondoOrHoa,
      hoaAllowsStr: assessment.step2.hoaAllowsStr,
      ownershipType: assessment.step2.ownershipType,
      lawMode: assessment.step2.lawMode,
      neighborhood: assessment.step3.neighborhood,
      spaceType: assessment.step3.spaceType,
      hostingMode: assessment.step3.hostingMode,
      nightlyRate: assessment.step3.nightlyRate,
      occupancyPercent: assessment.step3.occupancyPercent,
      netIncome: earnings.netIncome,
      mortgageCoveragePercent: earnings.mortgageCoveragePercent,
      hoursPerWeek: assessment.step4?.hoursPerWeek ?? 5,
      hourlyRate,
      overallRisk: risks.overallRiskLevel,
      verdict: verdict.badgeLabel
    };

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: text,
          history: messages.map((m) => ({ role: m.role, content: m.content })),
          assessmentContext
        })
      });

      const data = await response.json();
      const replyContent =
        data.reply ||
        data.error ||
        "I'm here to help, but couldn't reach the server. Please verify your DC licensing questions at dlcp.dc.gov.";

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: replyContent,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const fallbackMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content:
          "I experienced a network error. In Washington, DC, short-term rentals require a primary residence and a $99 Basic Business License from DLCP. Please confirm details with DC's licensing department at dlcp.dc.gov.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const starterQuestions = [
    'Can I host if I live in a condo in DC?',
    'How does the 90-night limit work when I travel?',
    'Do I need a separate entrance for my basement?',
    'How do I apply for the $99 license at boss.dc.gov?'
  ];

  return (
    <>
      {/* 1. FLOATING ACTION BUTTON (Visible on every screen, hidden on print) */}
      <aside aria-label="DC Hosting Chat Assistant" className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-40 print:hidden">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-2.5 px-4 sm:px-5 py-3 rounded-full bg-[#0D1B2A] text-white shadow-xl hover:shadow-2xl border-2 border-rose-400/40 hover:border-rose-400 active:scale-95 transition-all duration-200 cursor-pointer ring-4 ring-rose-500/10"
          aria-label="Open Ask a DC hosting question chat"
        >
          <div className="relative">
            <div className="w-7 h-7 rounded-full bg-rose-500 text-white flex items-center justify-center shrink-0">
              <MessageSquare className="w-4 h-4" />
            </div>
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#0D1B2A] animate-pulse" />
          </div>

          <div className="text-left">
            <div className="text-xs sm:text-sm font-extrabold tracking-tight flex items-center gap-1.5">
              <span>Ask a DC hosting question</span>
              <Sparkles className="w-3.5 h-3.5 text-rose-300" />
            </div>
            <div className="text-[10px] text-slate-300 font-medium hidden sm:block">
              Powered by Gemini · Personalized to your home
            </div>
          </div>
        </button>
      </aside>

      {/* 2. SLIDE-OVER CHAT DRAWER / MODAL */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end print:hidden animate-fade-in">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            onClick={() => setIsOpen(false)}
          />

          {/* Drawer Container */}
          <div className="relative w-full sm:max-w-md bg-white h-full shadow-2xl flex flex-col z-10 border-l border-slate-200 animate-slide-in-right">
            {/* Header */}
            <div className="p-4 sm:p-5 bg-[#0D1B2A] text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-extrabold text-white">DC Hosting Advisor</h3>
                    <span className="text-[10px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full border border-rose-400/30">
                      Gemini 3.8
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    Personalized with your {neighborhoodName} assessment
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                aria-label="Close chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Context Badge Strip */}
            <div className="px-4 py-2 bg-slate-100 border-b border-slate-200 text-[11px] text-slate-600 flex items-center justify-between">
              <span className="truncate max-w-[240px]">
                Target: <strong>{neighborhoodName}</strong> · ${assessment.step3.nightlyRate}/night
              </span>
              <span className="text-rose-600 font-bold shrink-0">
                {verdict.badgeLabel}
              </span>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F8FAFC]">
              {messages.map((msg) => {
                const isUser = msg.role === 'user';

                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isUser && (
                      <div className="w-7 h-7 rounded-lg bg-rose-500 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}

                    <div
                      className={`max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed shadow-xs ${
                        isUser
                          ? 'bg-[#0D1B2A] text-white rounded-tr-xs'
                          : 'bg-white text-slate-800 border border-slate-200 rounded-tl-xs space-y-2'
                      }`}
                    >
                      <div className="whitespace-pre-line">{msg.content}</div>

                      <div
                        className={`text-[10px] mt-1 text-right ${
                          isUser ? 'text-slate-400' : 'text-slate-400'
                        }`}
                      >
                        {msg.timestamp}
                      </div>
                    </div>

                    {isUser && (
                      <div className="w-7 h-7 rounded-lg bg-[#0D1B2A] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                        <User className="w-4 h-4 text-rose-300" />
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Typing / Loading indicator */}
              {isLoading && (
                <div className="flex items-start gap-2.5 justify-start">
                  <div className="w-7 h-7 rounded-lg bg-rose-500 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-xs p-3 text-xs text-slate-500 flex items-center gap-2 shadow-xs">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-500" />
                    <span>Analyzing DC rules & your assessment...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Starter Chips */}
            <div className="p-3 bg-white border-t border-slate-100 overflow-x-auto whitespace-nowrap space-x-1.5 scrollbar-none">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Suggested Questions:
              </span>
              {starterQuestions.map((question, qIdx) => (
                <button
                  key={qIdx}
                  type="button"
                  onClick={() => handleSendMessage(question)}
                  disabled={isLoading}
                  className="inline-block text-[11px] font-medium text-slate-700 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 border border-slate-200 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer mr-1.5"
                >
                  {question}
                </button>
              ))}
            </div>

            {/* Input Box */}
            <div className="p-3 sm:p-4 bg-white border-t border-slate-200">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask a question about DC hosting rules..."
                  disabled={isLoading}
                  className="flex-1 h-11 px-4 rounded-xl bg-slate-50 border border-slate-300 text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-rose-500 focus:outline-none transition-colors"
                />

                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className={`h-11 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                    input.trim() && !isLoading
                      ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-md active:scale-95 cursor-pointer'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                  }`}
                  aria-label="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>

              <div className="mt-2 text-[10px] text-center text-slate-400 leading-tight">
                Not legal or tax advice · Confirm licensing at{' '}
                <a
                  href="https://dlcp.dc.gov"
                  target="_blank"
                  rel="noreferrer"
                  className="text-rose-600 font-semibold hover:underline"
                >
                  dlcp.dc.gov
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
