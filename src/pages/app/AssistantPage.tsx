import { useState, useRef, useEffect } from 'react';
import { Send, Bot, Sparkles, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { generateAssistantResponse, type AssistantMessage } from '@/lib/ai';
import { Avatar } from '@/components/ui';

const SUGGESTIONS = [
  'How do I find campaigns?',
  'Explain my impact score',
  'Help me create a campaign',
  'What is emergency response?',
];

export default function AssistantPage() {
  const { profile } = useAuth();
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (profile) {
      setMessages([{
        role: 'assistant',
        content: `Hello ${profile.full_name?.split(' ')[0] || 'there'}! I'm your SocialSphere AI Assistant. I can help you find campaigns, understand your impact, plan initiatives, and more. What would you like to know?`,
      }]);
    }
  }, [profile]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, typing]);

  const send = (text: string) => {
    if (!text.trim() || !profile) return;
    const userMsg: AssistantMessage = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setTyping(true);
    setTimeout(() => {
      const response = generateAssistantResponse(text, {
        role: profile.role,
        profileName: profile.full_name?.split(' ')[0] || 'there',
        profileRole: profile.role,
      });
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
      setTyping(false);
    }, 800 + Math.random() * 600);
  };

  return (
    <div className="animate-fade-in max-w-3xl mx-auto flex flex-col h-[calc(100vh-160px)]">
      <div className="mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-hero flex items-center justify-center"><Bot className="w-5 h-5 text-white" /></div>
          <div>
            <h2 className="text-xl font-bold text-ink">SocialSphere AI Assistant</h2>
            <p className="text-sm text-gray-500">Your intelligent guide to social impact</p>
          </div>
        </div>
      </div>

      <div className="card flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-4">
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
              {m.role === 'assistant' ? (
                <div className="w-8 h-8 rounded-lg gradient-hero flex items-center justify-center shrink-0"><Sparkles className="w-4 h-4 text-white" /></div>
              ) : (
                <Avatar name={profile?.full_name || 'You'} src={profile?.avatar_url} size="sm" />
              )}
              <div className={`max-w-[75%] rounded-2xl px-4 py-3 ${m.role === 'user' ? 'bg-primary-600 text-white' : 'bg-gray-50 text-ink'}`}>
                <p className="text-sm whitespace-pre-wrap">{m.content}</p>
              </div>
            </div>
          ))}
          {typing && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg gradient-hero flex items-center justify-center shrink-0"><Sparkles className="w-4 h-4 text-white" /></div>
              <div className="bg-gray-50 rounded-2xl px-4 py-3 flex items-center gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {messages.length <= 1 && (
          <div className="px-4 pb-2 flex flex-wrap gap-2">
            {SUGGESTIONS.map(s => (
              <button key={s} onClick={() => send(s)} className="px-3 py-1.5 text-xs font-medium text-primary-700 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors">{s}</button>
            ))}
          </div>
        )}

        <div className="p-3 border-t border-gray-100 flex gap-2">
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send(input)}
            className="input-field flex-1" placeholder="Ask me anything..." />
          <button onClick={() => send(input)} disabled={!input.trim()} className="btn-primary px-4"><Send className="w-4 h-4" /></button>
        </div>
      </div>
    </div>
  );
}
