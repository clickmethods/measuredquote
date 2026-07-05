import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, Phone, PhoneOff, Clock, Shield, Globe, Zap, ArrowRight, Headphones } from 'lucide-react';
import AudioWave from '@/components/estimator/AudioWave';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Message {
  id: number;
  role: 'ai' | 'user';
  text: string;
  chips?: string[];
  inputType?: 'name' | 'phone' | 'text';
}

interface CallState {
  status: 'idle' | 'connecting' | 'active' | 'ended' | 'rate-limited';
  countdown: number;
}

interface LeadData {
  name: string;
  phone: string;
  projectType: string;
  urgency: string;
  email: string;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const RATE_LIMIT_KEY = 'ai-receptionist-last-call';
const RATE_LIMIT_HOURS = 6;
const CALL_DURATION = 60;

const MESSAGES: Message[] = [
  {
    id: 1,
    role: 'ai',
    text: "Thank you for calling. I'm the AI receptionist. I can help you get a quote for your project. What type of project are you calling about?",
  },
  {
    id: 2,
    role: 'user',
    text: '',
    chips: ['Roofing', 'Concrete', 'Deck', 'Fence', 'Landscaping', 'Other'],
  },
  {
    id: 3,
    role: 'ai',
    text: 'Great, a {projectType} project. May I have your name please?',
  },
  {
    id: 4,
    role: 'user',
    text: '',
    inputType: 'name',
  },
  {
    id: 5,
    role: 'ai',
    text: 'Thank you, {name}. What\'s the best phone number to reach you?',
  },
  {
    id: 6,
    role: 'user',
    text: '',
    inputType: 'phone',
  },
  {
    id: 7,
    role: 'ai',
    text: 'Got it. Is this urgent, or are you planning for a future project?',
  },
  {
    id: 8,
    role: 'user',
    text: '',
    chips: ['Urgent - need ASAP', 'Planning ahead'],
  },
  {
    id: 9,
    role: 'ai',
    text: 'Perfect. I\'ve captured all your details. A {projectType} specialist will call you within 24 hours. Your reference number is REF-{ref}. Is there anything else I can help with?',
  },
  {
    id: 10,
    role: 'ai',
    text: 'Thank you for calling. Have a great day!',
  },
];

/* ------------------------------------------------------------------ */
/*  Helper: Rate Limit                                                */
/* ------------------------------------------------------------------ */

function getRateLimitStatus(): { limited: boolean; hoursRemaining: number } {
  const lastCall = localStorage.getItem(RATE_LIMIT_KEY);
  if (!lastCall) return { limited: false, hoursRemaining: 0 };
  const elapsed = Date.now() - parseInt(lastCall, 10);
  const hoursElapsed = elapsed / (1000 * 60 * 60);
  if (hoursElapsed >= RATE_LIMIT_HOURS) return { limited: false, hoursRemaining: 0 };
  return { limited: true, hoursRemaining: RATE_LIMIT_HOURS - hoursElapsed };
}

function recordCall() {
  localStorage.setItem(RATE_LIMIT_KEY, Date.now().toString());
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

const TypingIndicator: React.FC = () => (
  <div className="flex items-center gap-1 py-2 px-1">
    <span className="typing-dot" />
    <span className="typing-dot" style={{ animationDelay: '0.15s' }} />
    <span className="typing-dot" style={{ animationDelay: '0.3s' }} />
    <style>{`
      @keyframes typingBounce {
        0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
        30% { transform: translateY(-5px); opacity: 1; }
      }
      .typing-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background-color: #94A3B8;
        animation: typingBounce 0.8s ease-in-out infinite;
      }
    `}</style>
  </div>
);

const StatusDot: React.FC<{ color: string; label: string }> = ({ color, label }) => (
  <div className="flex items-center gap-2">
    <span
      className="w-2.5 h-2.5 rounded-full animate-pulse"
      style={{ backgroundColor: color }}
    />
    <span className="text-sm font-medium text-white/80">{label}</span>
  </div>
);

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

const AIReceptionist: React.FC = () => {
  const [callState, setCallState] = useState<CallState>({
    status: 'idle',
    countdown: CALL_DURATION,
  });
  const [visibleMessages, setVisibleMessages] = useState<Array<Message & { visible?: boolean }>>([]);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [leadData, setLeadData] = useState<LeadData>({
    name: '',
    phone: '',
    projectType: '',
    urgency: '',
    email: '',
  });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [rateLimitInfo, setRateLimitInfo] = useState(getRateLimitStatus());
  const transcriptRef = useRef<HTMLDivElement>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const messageTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Scroll transcript to bottom
  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [visibleMessages, isTyping]);

  // Clean up timers
  useEffect(() => {
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
      if (messageTimerRef.current) clearTimeout(messageTimerRef.current);
    };
  }, []);

  // Check rate limit on mount
  useEffect(() => {
    const rl = getRateLimitStatus();
    setRateLimitInfo(rl);
    if (rl.limited) {
      setCallState((s) => ({ ...s, status: 'rate-limited' }));
    }
  }, []);

  /* -------------------- Conversation Flow -------------------- */

  const showNextMessage = useCallback(
    (index: number) => {
      if (index >= MESSAGES.length) {
        // End of conversation
        setIsAiSpeaking(false);
        setCallState((s) => ({ ...s, status: 'ended' }));
        return;
      }

      const msg = MESSAGES[index];

      if (msg.role === 'ai') {
        setIsAiSpeaking(true);
        setIsTyping(true);

        // Simulate typing delay (1.5s)
        messageTimerRef.current = setTimeout(() => {
          setIsTyping(false);
          let text = msg.text;
          text = text.replace('{projectType}', leadData.projectType || 'your');
          text = text.replace('{name}', leadData.name || 'there');
          text = text.replace('{ref}', Math.random().toString(36).substring(2, 8).toUpperCase());

          setVisibleMessages((prev) => [...prev, { ...msg, text, visible: true }]);
          setCurrentMessageIndex(index + 1);

          // AI speaks for a moment, then pause before next
          messageTimerRef.current = setTimeout(() => {
            setIsAiSpeaking(false);
            // If next is user message, wait for interaction
            if (index + 1 < MESSAGES.length && MESSAGES[index + 1].role === 'user') {
              // Show user options
              setVisibleMessages((prev) => [...prev, { ...MESSAGES[index + 1], visible: true }]);
              setCurrentMessageIndex(index + 2);
            } else {
              // Continue AI flow after delay
              messageTimerRef.current = setTimeout(() => {
                showNextMessage(index + 1);
              }, 2000);
            }
          }, 1500);
        }, 1500);
      }
    },
    [leadData]
  );

  // Handle user chip selection
  const handleChipSelect = useCallback(
    (value: string) => {
      // Add user message
      setVisibleMessages((prev) => [
        ...prev,
        { id: Date.now(), role: 'user', text: value },
      ]);

      // Update lead data
      if (!leadData.projectType) {
        setLeadData((d) => ({ ...d, projectType: value }));
      } else {
        setLeadData((d) => ({ ...d, urgency: value }));
      }

      // Trigger next AI message after delay
      messageTimerRef.current = setTimeout(() => {
        showNextMessage(currentMessageIndex);
      }, 800);
    },
    [currentMessageIndex, leadData, showNextMessage]
  );

  // Handle user text input (name/phone)
  const handleTextSubmit = useCallback(
    (field: 'name' | 'phone', value: string) => {
      if (!value.trim()) return;

      setVisibleMessages((prev) => [
        ...prev,
        { id: Date.now(), role: 'user', text: value },
      ]);

      setLeadData((d) => ({ ...d, [field]: value }));

      messageTimerRef.current = setTimeout(() => {
        showNextMessage(currentMessageIndex);
      }, 800);
    },
    [currentMessageIndex, showNextMessage]
  );

  /* -------------------- Call Controls -------------------- */

  const startCall = useCallback(() => {
    const rl = getRateLimitStatus();
    if (rl.limited) {
      setRateLimitInfo(rl);
      setCallState({ status: 'rate-limited', countdown: CALL_DURATION });
      return;
    }

    recordCall();
    setCallState({ status: 'active', countdown: CALL_DURATION });
    setVisibleMessages([]);
    setCurrentMessageIndex(0);
    setFormSubmitted(false);
    setLeadData({ name: '', phone: '', projectType: '', urgency: '', email: '' });

    // Start countdown
    countdownRef.current = setInterval(() => {
      setCallState((s) => {
        if (s.countdown <= 1) {
          if (countdownRef.current) clearInterval(countdownRef.current);
          return { ...s, status: 'ended', countdown: 0 };
        }
        return { ...s, countdown: s.countdown - 1 };
      });
    }, 1000);

    // Start conversation after short delay
    messageTimerRef.current = setTimeout(() => {
      showNextMessage(0);
    }, 1000);
  }, [showNextMessage]);

  const endCall = useCallback(() => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    if (messageTimerRef.current) clearTimeout(messageTimerRef.current);
    setIsAiSpeaking(false);
    setIsTyping(false);
    setCallState({ status: 'ended', countdown: 0 });
  }, []);

  /* -------------------- Form Submit -------------------- */

  const handleFormSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setFormSubmitted(true);
    },
    []
  );

  /* -------------------- Derived State -------------------- */

  const getStatusIndicator = () => {
    switch (callState.status) {
      case 'connecting':
        return <StatusDot color="#22C55E" label="Connecting..." />;
      case 'active':
        if (isAiSpeaking) return <StatusDot color="#2563EB" label="AI Responding..." />;
        return <StatusDot color="#EF4444" label="Listening..." />;
      case 'ended':
        return <StatusDot color="#6B7280" label="Call Ended" />;
      default:
        return null;
    }
  };

  const formatCountdown = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  /* ================================================================== */
  /*  RENDER                                                            */
  /* ================================================================== */

  return (
    <div
      className="min-h-[100dvh] flex flex-col"
      style={{ background: 'linear-gradient(180deg, #0B1D3A 0%, #0F172A 100%)' }}
    >
      {/* ---- Hero Section ---- */}
      <section className="pt-24 md:pt-32 pb-8 px-6">
        <div className="max-w-[720px] mx-auto text-center">
          {/* Glowing Mic Icon */}
          <div className="flex justify-center mb-5">
            <div className="relative">
              <div
                className="absolute inset-0 rounded-full blur-xl opacity-40"
                style={{
                  background: 'radial-gradient(circle, #2563EB 0%, #22C55E 100%)',
                  transform: 'scale(1.5)',
                }}
              />
              <div className="relative w-16 h-16 rounded-full bg-[#1A3A6B] border border-[#2563EB]/30 flex items-center justify-center">
                <Mic size={28} className="text-[#22C55E]" />
              </div>
              <span
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full animate-ping"
                style={{ backgroundColor: '#22C55E' }}
              />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            AI Receptionist
          </h1>

          {/* Subtitle */}
          <p className="text-[#94A3B8] text-base md:text-lg mb-4 max-w-[520px] mx-auto">
            Experience our 24/7 AI-powered call answering. Never miss another lead.
          </p>

          {/* Trust Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1A3A6B]/60 border border-[#2563EB]/20">
            <Shield size={14} className="text-[#22C55E]" />
            <span className="text-sm text-[#CBD5E1]">
              60-second demo | English & Spanish | Lead capture included
            </span>
          </div>
        </div>
      </section>

      {/* ---- Call Interface ---- */}
      <section className="flex-1 px-4 md:px-6 pb-12">
        <div className="max-w-[720px] mx-auto">
          {/* Call Card */}
          <div className="rounded-[20px] border border-[#1A3A6B]/60 bg-[#0F172A]/80 backdrop-blur-sm overflow-hidden shadow-2xl shadow-black/30">
            {/* Card Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-[#1A3A6B]/40">
              <div className="flex items-center gap-3">
                <Headphones size={18} className="text-[#2563EB]" />
                <span className="text-white font-medium text-sm">AI Receptionist</span>
              </div>
              {callState.status === 'active' && (
                <div className="flex items-center gap-2 text-sm font-mono text-[#94A3B8]">
                  <Clock size={14} />
                  <span>{formatCountdown(callState.countdown)}</span>
                </div>
              )}
            </div>

            {/* Audio Wave Area */}
            <div className="px-5 pt-5 pb-3">
              <div className="flex items-center justify-between mb-3">
                {getStatusIndicator()}
                {callState.status === 'active' && (
                  <span className="text-xs text-[#64748B]">
                    {isAiSpeaking ? 'Speaking' : 'Waiting for input'}
                  </span>
                )}
              </div>
              <div className="h-[50px] flex items-center justify-center">
                <AudioWave isActive={isAiSpeaking && callState.status === 'active'} />
              </div>
            </div>

            {/* Transcript Area */}
            <div
              ref={transcriptRef}
              className="px-5 pb-4 max-h-[360px] overflow-y-auto space-y-3 scrollbar-thin"
            >
              {visibleMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`animate-fadeIn ${
                    msg.role === 'ai'
                      ? 'flex items-start gap-2.5'
                      : 'flex items-start gap-2.5 flex-row-reverse'
                  }`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold ${
                      msg.role === 'ai'
                        ? 'bg-[#2563EB]/20 text-[#2563EB]'
                        : 'bg-[#22C55E]/20 text-[#22C55E]'
                    }`}
                  >
                    {msg.role === 'ai' ? 'AI' : 'You'}
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      msg.role === 'ai'
                        ? 'bg-[#1A3A6B]/50 text-[#E2E8F0] rounded-tl-sm'
                        : 'bg-[#22C55E]/15 text-[#DCFCE7] rounded-tr-sm'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold bg-[#2563EB]/20 text-[#2563EB]">
                    AI
                  </div>
                  <div className="bg-[#1A3A6B]/50 rounded-2xl rounded-tl-sm px-4 py-2">
                    <TypingIndicator />
                  </div>
                </div>
              )}

              {/* Interactive Input Chips */}
              {callState.status === 'active' && !isAiSpeaking && !isTyping && visibleMessages.length > 0 && (
                (() => {
                  const lastUserMsg = [...visibleMessages].reverse().find((m) => m.role === 'user');
                  if (!lastUserMsg) return null;

                  const msgIndex = visibleMessages.indexOf(lastUserMsg);
                  const fullMsg = visibleMessages[msgIndex];

                  if (fullMsg?.chips) {
                    return (
                      <div className="flex items-start gap-2.5 pl-9">
                        <div className="flex flex-wrap gap-2">
                          {fullMsg.chips.map((chip) => (
                            <button
                              key={chip}
                              onClick={() => handleChipSelect(chip)}
                              className="px-3.5 py-2 rounded-full bg-[#1A3A6B]/60 border border-[#2563EB]/30 text-[#93C5FD] text-sm font-medium hover:bg-[#2563EB]/20 hover:border-[#2563EB]/50 transition-all duration-200 hover:-translate-y-0.5"
                            >
                              {chip}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  }

                  if (fullMsg?.inputType === 'name') {
                    return <QuickInput field="name" placeholder="Enter your name..." onSubmit={(v) => handleTextSubmit('name', v)} presets={['John Smith', 'Sarah Johnson', 'Mike Chen']} />;
                  }

                  if (fullMsg?.inputType === 'phone') {
                    return <QuickInput field="phone" placeholder="(555) 123-4567" onSubmit={(v) => handleTextSubmit('phone', v)} presets={['(555) 123-4567', '(555) 987-6543']} />;
                  }

                  return null;
                })()
              )}

              {visibleMessages.length === 0 && callState.status === 'idle' && (
                <div className="text-center py-10 text-[#475569]">
                  <Phone size={32} className="mx-auto mb-3 opacity-40" />
                  <p className="text-sm">Press "Start Call" to begin the demo</p>
                </div>
              )}
            </div>

            {/* Call Controls */}
            <div className="px-5 py-4 border-t border-[#1A3A6B]/40">
              {callState.status === 'idle' && (
                <button
                  onClick={startCall}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#22C55E] text-white font-semibold text-sm hover:bg-[#16A34A] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#22C55E]/20 active:translate-y-0"
                >
                  <Phone size={18} />
                  Start Call
                  <span
                    className="absolute w-3 h-3 rounded-full bg-[#22C55E] animate-ping opacity-40"
                    style={{ marginLeft: '80px' }}
                  />
                </button>
              )}

              {callState.status === 'active' && (
                <div className="flex items-center gap-3">
                  <button
                    onClick={endCall}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#EF4444] text-white font-semibold text-sm hover:bg-[#DC2626] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0"
                  >
                    <PhoneOff size={16} />
                    End Call
                  </button>
                </div>
              )}

              {callState.status === 'ended' && (
                <button
                  onClick={startCall}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#2563EB] text-white font-semibold text-sm hover:bg-[#1D4ED8] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0"
                >
                  <Phone size={16} />
                  Start New Call
                </button>
              )}

              {callState.status === 'rate-limited' && (
                <div className="text-center py-2">
                  <p className="text-sm text-[#94A3B8] mb-2">
                    You&apos;ve already tried the demo. Come back in{' '}
                    <span className="text-[#FBBF24] font-semibold">
                      {Math.ceil(rateLimitInfo.hoursRemaining)} hours
                    </span>{' '}
                    for another call.
                  </p>
                  <a
                    href="#/demo"
                    className="inline-flex items-center gap-1.5 text-sm text-[#2563EB] hover:text-[#60A5FA] font-medium transition-colors"
                  >
                    Try our trade estimators instead
                    <ArrowRight size={14} />
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* ---- Lead Capture Form (after call ends) ---- */}
          {callState.status === 'ended' && leadData.name && !formSubmitted && (
            <div className="mt-6 rounded-[16px] border border-[#1A3A6B]/60 bg-[#0F172A]/60 backdrop-blur-sm p-6 animate-fadeIn">
              <h3 className="text-lg font-semibold text-white mb-1">Lead Captured</h3>
              <p className="text-sm text-[#94A3B8] mb-4">
                Here&apos;s what the AI collected during your call. Add your email to receive a quote.
              </p>

              <form onSubmit={handleFormSubmit} className="space-y-3.5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">Name</label>
                    <input
                      type="text"
                      value={leadData.name}
                      readOnly
                      className="w-full px-3.5 py-2.5 rounded-lg bg-[#1A3A6B]/40 border border-[#1A3A6B] text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">Phone</label>
                    <input
                      type="text"
                      value={leadData.phone}
                      readOnly
                      className="w-full px-3.5 py-2.5 rounded-lg bg-[#1A3A6B]/40 border border-[#1A3A6B] text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">Project Type</label>
                    <input
                      type="text"
                      value={leadData.projectType}
                      readOnly
                      className="w-full px-3.5 py-2.5 rounded-lg bg-[#1A3A6B]/40 border border-[#1A3A6B] text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">Urgency</label>
                    <input
                      type="text"
                      value={leadData.urgency}
                      readOnly
                      className="w-full px-3.5 py-2.5 rounded-lg bg-[#1A3A6B]/40 border border-[#1A3A6B] text-white text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={leadData.email}
                    onChange={(e) => setLeadData((d) => ({ ...d, email: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#0F172A] border border-[#1A3A6B] text-white text-sm placeholder-[#475569] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-all"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-[#2563EB] text-white font-semibold text-sm hover:bg-[#1D4ED8] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0"
                >
                  Send Me a Quote
                </button>
              </form>
            </div>
          )}

          {formSubmitted && (
            <div className="mt-6 rounded-[16px] border border-[#22C55E]/30 bg-[#22C55E]/10 p-6 text-center animate-fadeIn">
              <div className="w-12 h-12 rounded-full bg-[#22C55E]/20 flex items-center justify-center mx-auto mb-3">
                <Shield size={24} className="text-[#22C55E]" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-1">Quote Request Sent!</h3>
              <p className="text-sm text-[#94A3B8]">
                A {leadData.projectType} specialist will contact you within 24 hours.
              </p>
            </div>
          )}

          {/* ---- Rate Limit Message (when not in call) ---- */}
          {callState.status === 'rate-limited' && (
            <div className="mt-6 rounded-[16px] border border-[#FBBF24]/20 bg-[#FBBF24]/5 p-5 text-center">
              <Clock size={20} className="text-[#FBBF24] mx-auto mb-2" />
              <p className="text-sm text-[#CBD5E1]">
                One demo call per visitor per 6 hours.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ---- Feature Cards ---- */}
      <section className="px-4 md:px-6 pb-16">
        <div className="max-w-[720px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FeatureCard
              icon={<Globe size={20} />}
              title="24/7 Availability"
              description="Never miss a call, even after hours, weekends, holidays"
            />
            <FeatureCard
              icon={<Zap size={20} />}
              title="Instant Lead Capture"
              description="Every call becomes a structured lead in your dashboard"
            />
            <FeatureCard
              icon={<Shield size={20} />}
              title="Bilingual Support"
              description="Automatically detects and responds in English or Spanish"
            />
          </div>
        </div>
      </section>

      {/* ---- Global Styles ---- */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out forwards;
        }
        .scrollbar-thin::-webkit-scrollbar {
          width: 4px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: #1A3A6B;
          border-radius: 4px;
        }
        .scrollbar-thin {
          scrollbar-width: thin;
          scrollbar-color: #1A3A6B transparent;
        }
      `}</style>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Quick Input Sub-Component                                          */
/* ------------------------------------------------------------------ */

const QuickInput: React.FC<{
  field: string;
  placeholder: string;
  presets: string[];
  onSubmit: (value: string) => void;
}> = ({ placeholder, presets, onSubmit }) => {
  const [value, setValue] = useState('');

  return (
    <div className="flex items-start gap-2.5 pl-9 flex-col">
      <div className="flex flex-wrap gap-2 mb-2">
        {presets.map((preset) => (
          <button
            key={preset}
            onClick={() => onSubmit(preset)}
            className="px-3 py-1.5 rounded-full bg-[#1A3A6B]/60 border border-[#22C55E]/20 text-[#86EFAC] text-xs font-medium hover:bg-[#22C55E]/15 transition-all duration-200"
          >
            {preset}
          </button>
        ))}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit(value);
        }}
        className="flex gap-2 w-full"
      >
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoFocus
          className="flex-1 min-w-0 px-3.5 py-2 rounded-lg bg-[#0F172A] border border-[#1A3A6B] text-white text-sm placeholder-[#475569] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-all"
        />
        <button
          type="submit"
          className="px-4 py-2 rounded-lg bg-[#2563EB] text-white text-sm font-medium hover:bg-[#1D4ED8] transition-colors flex-shrink-0"
        >
          Send
        </button>
      </form>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Feature Card Sub-Component                                         */
/* ------------------------------------------------------------------ */

const FeatureCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
}> = ({ icon, title, description }) => (
  <div className="rounded-[14px] border border-[#1A3A6B]/40 bg-[#0F172A]/50 p-5 hover:border-[#2563EB]/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#2563EB]/5 group">
    <div className="w-10 h-10 rounded-lg bg-[#2563EB]/15 flex items-center justify-center text-[#2563EB] mb-3 group-hover:scale-110 transition-transform duration-300">
      {icon}
    </div>
    <h4 className="text-white font-semibold text-sm mb-1.5">{title}</h4>
    <p className="text-[#94A3B8] text-xs leading-relaxed">{description}</p>
  </div>
);

export default AIReceptionist;
