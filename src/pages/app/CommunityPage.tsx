import { useEffect, useState, useCallback } from 'react';
import { Heart, MessageSquare, Send, Plus, X, Image, ThumbsUp, Award, Target } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { supabase, type Post, type Comment } from '@/lib/supabase';
import { LoadingState, EmptyState, Avatar, Badge } from '@/components/ui';
import { timeAgo } from '@/lib/utils';

export default function CommunityPage() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [content, setContent] = useState('');
  const [type, setType] = useState<'achievement' | 'update' | 'story' | 'question'>('update');
  const [commenting, setCommenting] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('posts')
      .select('*, author:profiles!posts_author_id_fkey(*), comments:comments(*, author:profiles!comments_author_id_fkey(*))')
      .order('created_at', { ascending: false }).limit(50);
    setPosts((data as Post[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !content.trim()) return;
    const { error } = await supabase.from('posts').insert({
      author_id: profile.id, content, type,
    });
    if (error) { toast(error.message, 'error'); return; }
    toast('Post shared!', 'success');
    setContent(''); setShowForm(false); setType('update');
    load();
  };

  const handleLike = async (post: Post) => {
    if (!profile) return;
    const { error: likeError } = await supabase.from('post_likes').insert({ post_id: post.id, user_id: profile.id });
    if (likeError) {
      if (likeError.code === '23505') {
        await supabase.from('post_likes').delete().eq('post_id', post.id).eq('user_id', profile.id);
        await supabase.from('posts').update({ likes: Math.max(post.likes - 1, 0) }).eq('id', post.id);
      } else { toast(likeError.message, 'error'); return; }
    } else {
      await supabase.from('posts').update({ likes: post.likes + 1 }).eq('id', post.id);
    }
    load();
  };

  const handleComment = async (postId: string) => {
    if (!profile || !commentText.trim()) return;
    const { error } = await supabase.from('comments').insert({
      post_id: postId, author_id: profile.id, content: commentText,
    });
    if (error) { toast(error.message, 'error'); return; }
    setCommentText(''); setCommenting(null);
    load();
  };

  if (loading) return <LoadingState text="Loading community feed..." />;

  const TYPE_ICONS = { achievement: Award, update: Target, story: Heart, question: MessageSquare };
  const TYPE_COLORS = { achievement: 'green', update: 'blue', story: 'amber', question: 'gray' } as const;

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-ink">Community Feed</h2>
          <p className="text-gray-500 text-sm mt-1">Share achievements, updates, and stories with the community.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm">{showForm ? <><X className="w-4 h-4" /> Cancel</> : <><Plus className="w-4 h-4" /> New Post</>}</button>
      </div>

      {showForm && (
        <form onSubmit={handlePost} className="card p-5 space-y-4">
          <div className="flex gap-2">
            {(['update', 'achievement', 'story', 'question'] as const).map(t => (
              <button key={t} type="button" onClick={() => setType(t)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg capitalize transition-all ${type === t ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600'}`}>{t}</button>
            ))}
          </div>
          <textarea value={content} onChange={e => setContent(e.target.value)} className="input-field min-h-[100px]" placeholder={`Share your ${type}...`} />
          <button type="submit" disabled={!content.trim()} className="btn-primary text-sm"><Send className="w-4 h-4" /> Share Post</button>
        </form>
      )}

      {posts.length === 0 ? (
        <EmptyState icon={MessageSquare} title="No posts yet" description="Be the first to share something with the community!" />
      ) : (
        <div className="space-y-4">
          {posts.map(post => {
            const TypeIcon = TYPE_ICONS[post.type];
            return (
              <div key={post.id} className="card p-5">
                <div className="flex items-start gap-3 mb-3">
                  <Avatar name={post.author?.full_name || 'User'} src={post.author?.avatar_url} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-ink text-sm">{post.author?.full_name}</p>
                      <Badge color={TYPE_COLORS[post.type]}><TypeIcon className="w-3 h-3" /> {post.type}</Badge>
                    </div>
                    <p className="text-xs text-gray-500">{timeAgo(post.created_at)}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap mb-3">{post.content}</p>
                <div className="flex items-center gap-4 pt-3 border-t border-gray-100">
                  <button onClick={() => handleLike(post)} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-600 transition-colors">
                    <ThumbsUp className="w-4 h-4" /> {post.likes}
                  </button>
                  <button onClick={() => setCommenting(commenting === post.id ? null : post.id)} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-600 transition-colors">
                    <MessageSquare className="w-4 h-4" /> {post.comments?.length ?? 0}
                  </button>
                </div>
                {commenting === post.id && (
                  <div className="mt-3 pt-3 border-t border-gray-100 space-y-3">
                    {post.comments?.map(c => (
                      <div key={c.id} className="flex items-start gap-2">
                        <Avatar name={c.author?.full_name || 'User'} src={c.author?.avatar_url} size="sm" />
                        <div className="flex-1 bg-gray-50 rounded-xl p-3">
                          <p className="text-sm font-medium text-ink">{c.author?.full_name}</p>
                          <p className="text-sm text-gray-700">{c.content}</p>
                          <p className="text-xs text-gray-400 mt-1">{timeAgo(c.created_at)}</p>
                        </div>
                      </div>
                    ))}
                    <div className="flex gap-2">
                      <input value={commentText} onChange={e => setCommentText(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleComment(post.id)}
                        className="input-field flex-1" placeholder="Write a comment..." />
                      <button onClick={() => handleComment(post.id)} className="btn-primary text-sm px-3"><Send className="w-4 h-4" /></button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
