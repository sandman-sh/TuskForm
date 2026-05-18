import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader, ChevronDown } from 'lucide-react';

interface KimoChatboxProps {
  forms: any[];
}

export const KimoChatbox: React.FC<KimoChatboxProps> = ({ forms }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([
    { role: 'assistant', content: "Hey! I'm KIMO 🐘 your TuskForm AI sidekick! Ask me anything about your forms, responses, Web3, or how to get the most out of TuskForm!" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const sendMessage = async () => {
    const userMsg = input.trim();
    if (!userMsg || isLoading) return;

    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInput('');
    setIsLoading(true);

    try {
      const formsContext = forms.length > 0
        ? `The user has ${forms.length} form(s): ${forms.map(f => `"${f.title}" (${f.submissionsList?.length || 0} responses)`).join(', ')}.`
        : `The user has 0 forms. Encourage them to click "+ New Form" to get started!`;

      const systemPrompt = `You are KIMO, a cute, smart elephant AI assistant built into TuskForm — a decentralized, end-to-end encrypted form builder on the SUI Blockchain using Walrus Protocol.
Help the user manage their forms, understand their response data, and learn about Web3/decentralized data.
Be concise, helpful, and friendly. Use occasional elephant emojis 🐘.

Dashboard Context: ${formsContext}`;

      const response = await fetch('https://api.tokenrouter.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_TOKENROUTER_API_KEY}`
        },
        body: JSON.stringify({
          model: 'openai/gpt-5.4',
          messages: [
            { role: 'system', content: systemPrompt },
            ...messages.map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: userMsg }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`API responded with ${response.status}`);
      }

      const data = await response.json();
      const reply = data.choices?.[0]?.message?.content || "Oops, my trunk got tangled! Try again 🐘";
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (_err) {
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm having trouble connecting right now 🐘💤 Please try again!" }]);
    } finally {
      setIsLoading(false);
    }
  };


  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const KIMO_DARK = '#1a1a2e';
  const KIMO_ACCENT = '#FFD700';
  const KIMO_PURPLE = '#6c3fc7';

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen(o => !o)}
        style={{
          position: 'fixed',
          bottom: '28px',
          right: '28px',
          width: '64px',
          height: '64px',
          borderRadius: '32px',
          border: '3px solid #000',
          background: `linear-gradient(135deg, ${KIMO_PURPLE}, ${KIMO_DARK})`,
          boxShadow: `5px 5px 0px #000, 0 0 20px rgba(108, 63, 199, 0.5)`,
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999,
          padding: 0,
        }}
        whileHover={{ scale: 1.12, rotate: 8, boxShadow: `6px 6px 0px #000, 0 0 30px rgba(108,63,199,0.7)` }}
        whileTap={{ scale: 0.92 }}
        animate={isOpen ? {} : {
          y: [0, -6, 0],
          transition: { repeat: Infinity, duration: 2.5, ease: 'easeInOut' }
        }}
        title="Chat with KIMO"
      >
        <span style={{ fontSize: '34px', lineHeight: 1, filter: 'drop-shadow(1px 1px 1px rgba(0,0,0,0.5))' }}>🐘</span>
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.92 }}
            transition={{ type: 'spring', damping: 22, stiffness: 320 }}
            style={{
              position: 'fixed',
              bottom: '106px',
              right: '28px',
              width: '390px',
              height: '560px',
              zIndex: 9999,
              display: 'flex',
              flexDirection: 'column',
              border: '3px solid #000',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '6px 6px 0px #000',
              maxWidth: 'calc(100vw - 48px)',
            }}
          >
            {/* Header */}
            <div style={{
              background: `linear-gradient(135deg, ${KIMO_PURPLE} 0%, ${KIMO_DARK} 100%)`,
              padding: '14px 16px',
              borderBottom: '3px solid #000',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexShrink: 0,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '44px', height: '44px',
                  background: 'rgba(255,255,255,0.15)',
                  borderRadius: '22px',
                  border: '2px solid rgba(255,255,255,0.3)',
                  display: 'flex', justifyContent: 'center', alignItems: 'center',
                  fontSize: '26px',
                  backdropFilter: 'blur(4px)',
                }}>🐘</div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ margin: 0, fontSize: '18px', color: '#fff', fontWeight: 900 }}>KIMO</h3>
                    <span style={{
                      fontSize: '10px', fontWeight: 800,
                      background: KIMO_ACCENT,
                      color: '#000',
                      padding: '2px 7px',
                      borderRadius: '20px',
                      border: '1.5px solid #000',
                    }}>AI</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '2px' }}>
                    <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#4ade80', border: '1.5px solid rgba(255,255,255,0.4)' }} />
                    <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.75)', fontWeight: 600 }}>TuskForm AI · Online</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                style={{ background: 'rgba(255,255,255,0.15)', border: '2px solid rgba(255,255,255,0.3)', borderRadius: '8px', padding: '6px', cursor: 'pointer', color: '#fff', display: 'flex', backdropFilter: 'blur(4px)' }}
              >
                <ChevronDown size={18} strokeWidth={3} />
              </button>
            </div>

            {/* Messages */}
            <div style={{
              flex: 1, overflowY: 'auto', padding: '16px',
              display: 'flex', flexDirection: 'column', gap: '14px',
              background: '#f8f8fc',
            }}>
              {messages.map((msg, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  {msg.role === 'assistant' && (
                    <span style={{ fontSize: '11px', fontWeight: 700, color: KIMO_PURPLE, marginBottom: '4px', paddingLeft: '4px' }}>KIMO 🐘</span>
                  )}
                  <div style={{
                    maxWidth: '82%',
                    padding: '10px 14px',
                    borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    border: '2.5px solid #000',
                    background: msg.role === 'user'
                      ? `linear-gradient(135deg, ${KIMO_PURPLE}, #8b5cf6)`
                      : '#fff',
                    color: msg.role === 'user' ? '#fff' : '#111',
                    fontWeight: 600,
                    fontSize: '14px',
                    lineHeight: 1.55,
                    boxShadow: msg.role === 'user' ? '3px 3px 0px rgba(0,0,0,0.2)' : '3px 3px 0px rgba(0,0,0,0.08)',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}>
                    {msg.content}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: KIMO_PURPLE, marginBottom: '4px', paddingLeft: '4px' }}>KIMO 🐘</span>
                  <div style={{ padding: '12px 16px', borderRadius: '16px 16px 16px 4px', border: '2.5px solid #000', background: '#fff', display: 'flex', gap: '5px', alignItems: 'center' }}>
                    {[0, 1, 2].map(i => (
                      <motion.div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%', background: KIMO_PURPLE }}
                        animate={{ y: [0, -6, 0] }}
                        transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.15 }} />
                    ))}
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick prompts */}
            {messages.length <= 1 && (
              <div style={{ padding: '0 12px 8px', background: '#f8f8fc', display: 'flex', gap: '6px', flexWrap: 'wrap', flexShrink: 0 }}>
                {['How many forms do I have?', 'What is Walrus Protocol?', 'How does SEAL encryption work?'].map(q => (
                  <button key={q}
                    onClick={() => { setInput(q); setTimeout(() => inputRef.current?.focus(), 50); }}
                    style={{ fontSize: '11px', fontWeight: 700, padding: '5px 10px', background: '#fff', border: '2px solid #000', borderRadius: '20px', cursor: 'pointer', color: '#333' }}>
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div style={{
              padding: '12px',
              borderTop: '3px solid #000',
              background: '#fff',
              display: 'flex',
              gap: '8px',
              flexShrink: 0,
            }}>
              <input
                ref={inputRef}
                type="text"
                className="nb-input"
                style={{ flex: 1, padding: '10px 14px', borderRadius: '24px', fontSize: '14px', border: '2.5px solid #000' }}
                placeholder="Ask KIMO anything..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <motion.button
                className="nb-button"
                style={{
                  width: '46px', height: '46px', padding: 0, borderRadius: '23px',
                  display: 'flex', justifyContent: 'center', alignItems: 'center',
                  background: input.trim() ? `linear-gradient(135deg, ${KIMO_PURPLE}, #8b5cf6)` : '#ccc',
                  border: '2.5px solid #000',
                  flexShrink: 0,
                }}
                whileHover={input.trim() ? { scale: 1.1 } : {}}
                whileTap={input.trim() ? { scale: 0.9 } : {}}
                onClick={sendMessage}
                disabled={isLoading || !input.trim()}
              >
                {isLoading ? <Loader size={18} className="anim-spin" color="#fff" /> : <Send size={18} color="#fff" />}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
