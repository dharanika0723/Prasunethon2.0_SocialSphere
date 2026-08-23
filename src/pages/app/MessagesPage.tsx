import { useEffect, useState, useCallback } from 'react';
import { Send, MessageSquare, Plus, Search } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase, type Conversation, type Message, type Profile } from '@/lib/supabase';
import { LoadingState, EmptyState, Avatar } from '@/components/ui';
import { timeAgo } from '@/lib/utils';

export default function MessagesPage() {
  const { profile } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [allUsers, setAllUsers] = useState<Profile[]>([]);
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [search, setSearch] = useState('');

  const loadConversations = useCallback(async () => {
    if (!profile) return;
    setLoading(true);
    const { data: memberRows } = await supabase.from('conversation_members').select('conversation_id').eq('user_id', profile.id);
    const convIds = (memberRows ?? []).map(m => m.conversation_id);
    if (convIds.length === 0) { setConversations([]); setLoading(false); return; }
    const { data: convs } = await supabase.from('conversations').select('*').in('id', convIds).order('created_at', { ascending: false });
    const conversations = (convs as Conversation[]) ?? [];
    for (const c of conversations) {
      const { data: members } = await supabase.from('conversation_members').select('user_id, user:profiles(*)').eq('conversation_id', c.id);
      c.members = (members ?? []).map((m: any) => m.user as Profile).filter((u: Profile | null) => u !== null);
    }
    setConversations(conversations);
    setLoading(false);
  }, [profile]);

  const loadUsers = useCallback(async () => {
    if (!profile) return;
    const { data } = await supabase.from('profiles').select('*').neq('id', profile.id).limit(50);
    setAllUsers((data as Profile[]) ?? []);
  }, [profile]);

  useEffect(() => { loadConversations(); loadUsers(); }, [loadConversations, loadUsers]);

  const loadMessages = useCallback(async (convId: string) => {
    const { data } = await supabase.from('messages').select('*, sender:profiles!messages_sender_id_fkey(*)')
      .eq('conversation_id', convId).order('created_at', { ascending: true });
    setMessages((data as Message[]) ?? []);
  }, []);

  const selectConv = (c: Conversation) => { setSelected(c); loadMessages(c.id); };

  const send = async () => {
    if (!profile || !selected || !text.trim()) return;
    const { error } = await supabase.from('messages').insert({
      conversation_id: selected.id, sender_id: profile.id, content: text,
    });
    if (error) return;
    setText('');
    loadMessages(selected.id);
  };

  const startDirect = async (otherUserId: string) => {
    if (!profile) return;
    const { data: existing } = await supabase.from('conversation_members').select('conversation_id').eq('user_id', profile.id);
    const myConvs = (existing ?? []).map(m => m.conversation_id);
    let found: Conversation | null = null;
    for (const cid of myConvs) {
      const { data: members } = await supabase.from('conversation_members').select('user_id').eq('conversation_id', cid);
      const ids = (members ?? []).map(m => m.user_id);
      if (ids.length === 2 && ids.includes(otherUserId)) {
        const { data: conv } = await supabase.from('conversations').select('*').eq('id', cid).maybeSingle();
        found = conv as Conversation;
        break;
      }
    }
    if (found) { selectConv(found); setShowNew(false); return; }
    const { data: newConv } = await supabase.from('conversations').insert({ type: 'direct' }).select().single();
    if (!newConv) return;
    await supabase.from('conversation_members').insert([
      { conversation_id: newConv.id, user_id: profile.id },
      { conversation_id: newConv.id, user_id: otherUserId },
    ]);
    setShowNew(false);
    loadConversations();
    selectConv(newConv as Conversation);
  };

  if (loading) return <LoadingState text="Loading messages..." />;

  const filteredUsers = allUsers.filter(u => u.full_name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-ink">Messages</h2>
        <p className="text-gray-500 text-sm mt-1">Chat with organizations, campaign teams, and volunteers.</p>
      </div>

      <div className="card overflow-hidden flex h-[calc(100vh-220px)] min-h-[400px]">
        {/* Conversation list */}
        <div className={`w-full sm:w-72 border-r border-gray-100 flex flex-col ${selected ? 'hidden sm:flex' : ''}`}>
          <div className="p-3 border-b border-gray-100">
            <button onClick={() => setShowNew(!showNew)} className="btn-primary w-full text-sm"><Plus className="w-4 h-4" /> New Chat</button>
          </div>
          {showNew && (
            <div className="p-3 border-b border-gray-100">
              <div className="relative mb-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input value={search} onChange={e => setSearch(e.target.value)} className="input-field pl-9 text-sm" placeholder="Search users..." />
              </div>
              <div className="max-h-48 overflow-y-auto scrollbar-thin space-y-1">
                {filteredUsers.slice(0, 10).map(u => (
                  <button key={u.id} onClick={() => startDirect(u.id)} className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 text-left">
                    <Avatar name={u.full_name} src={u.avatar_url} size="sm" />
                    <div className="min-w-0"><p className="text-sm font-medium text-ink truncate">{u.full_name}</p><p className="text-xs text-gray-500 capitalize">{u.role}</p></div>
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="flex-1 overflow-y-auto scrollbar-thin">
            {conversations.length === 0 ? (
              <div className="p-6 text-center"><MessageSquare className="w-8 h-8 text-gray-300 mx-auto mb-2" /><p className="text-sm text-gray-400">No conversations yet</p></div>
            ) : conversations.map(c => {
              const other = c.members?.find(m => m.id !== profile?.id);
              return (
                <button key={c.id} onClick={() => selectConv(c)} className={`w-full flex items-center gap-3 p-3 hover:bg-gray-50 border-b border-gray-50 text-left ${selected?.id === c.id ? 'bg-primary-50' : ''}`}>
                  <Avatar name={other?.full_name || 'Chat'} src={other?.avatar_url} size="sm" />
                  <div className="min-w-0 flex-1"><p className="text-sm font-medium text-ink truncate">{other?.full_name || 'Group chat'}</p><p className="text-xs text-gray-500 capitalize">{other?.role}</p></div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Chat area */}
        <div className={`flex-1 flex flex-col ${!selected ? 'hidden sm:flex' : ''}`}>
          {selected ? (
            <>
              <div className="p-4 border-b border-gray-100 flex items-center gap-3">
                <button onClick={() => setSelected(null)} className="sm:hidden text-gray-400">←</button>
                {(() => {
                  const other = selected.members?.find(m => m.id !== profile?.id);
                  return <>
                    <Avatar name={other?.full_name || 'Chat'} src={other?.avatar_url} size="sm" />
                    <div><p className="font-semibold text-ink text-sm">{other?.full_name || 'Group chat'}</p><p className="text-xs text-gray-500 capitalize">{other?.role}</p></div>
                  </>;
                })()}
              </div>
              <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-3">
                {messages.length === 0 ? <p className="text-center text-sm text-gray-400 py-8">No messages yet. Start the conversation!</p> : messages.map(m => (
                  <div key={m.id} className={`flex ${m.sender_id === profile?.id ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${m.sender_id === profile?.id ? 'bg-primary-600 text-white' : 'bg-gray-100 text-ink'}`}>
                      {m.sender_id !== profile?.id && <p className="text-xs font-medium mb-0.5 opacity-70">{m.sender?.full_name}</p>}
                      <p className="text-sm">{m.content}</p>
                      <p className={`text-xs mt-1 ${m.sender_id === profile?.id ? 'text-white/60' : 'text-gray-400'}`}>{timeAgo(m.created_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3 border-t border-gray-100 flex gap-2">
                <input value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} className="input-field flex-1" placeholder="Type a message..." />
                <button onClick={send} className="btn-primary px-4"><Send className="w-4 h-4" /></button>
              </div>
            </>
          ) : (
            <EmptyState icon={MessageSquare} title="Select a conversation" description="Choose a conversation from the list or start a new chat." />
          )}
        </div>
      </div>
    </div>
  );
}
