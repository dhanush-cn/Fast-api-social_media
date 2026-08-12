import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from './Toast';
import { getCommentsApi, createCommentApi, deleteCommentApi } from '../api';
import { Send, Trash2, MessageSquare, Clock, User, Lock } from 'lucide-react';

export const CommentSection = ({ postId, isOpen }) => {
  const { isAuthenticated, setIsAuthModalOpen, userEmail } = useAuth();
  const { addToast } = useToast();
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchComments();
    }
  }, [isOpen, postId]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const data = await getCommentsApi(postId);
      setComments(data || []);
    } catch (err) {
      console.error('Failed to load comments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
      return;
    }

    if (!content.trim()) return;

    setSubmitting(true);
    try {
      const newComment = await createCommentApi(postId, content.trim());
      setComments((prev) => [newComment, ...prev]);
      setContent('');
      addToast('Comment published!', 'success');
    } catch (err) {
      addToast(err.response?.data?.detail || 'Failed to post comment', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await deleteCommentApi(commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      addToast('Comment deleted', 'info');
    } catch (err) {
      addToast(err.response?.data?.detail || 'Failed to delete comment', 'error');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="mt-4 pt-4 border-t border-slate-800/80 animate-fade-in space-y-4">
      {/* Inline Comment Input Box */}
      <form onSubmit={handleAddComment} className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={isAuthenticated ? "Write a comment..." : "Sign in to leave a comment"}
            disabled={!isAuthenticated || submitting}
            className="w-full pl-4 pr-10 py-2.5 bg-slate-950/80 border border-slate-800 rounded-2xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all disabled:opacity-50"
          />
        </div>

        <button
          type="submit"
          disabled={!isAuthenticated || submitting || !content.trim()}
          className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-bold text-xs shadow-md shadow-violet-600/30 transition-all active:scale-95 disabled:opacity-40 cursor-pointer flex items-center gap-1.5"
        >
          {submitting ? (
            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Send className="w-3.5 h-3.5" />
          )}
        </button>
      </form>

      {/* Comments List */}
      {loading ? (
        <div className="py-4 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
          <div className="w-4 h-4 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
          <span>Loading discussion...</span>
        </div>
      ) : comments.length === 0 ? (
        <div className="py-4 text-center text-xs text-slate-500 italic">
          No comments yet. Be the first to share your thoughts!
        </div>
      ) : (
        <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
          {comments.map((comment) => {
            const authorEmail = comment.owner?.email || `User #${comment.owner_id}`;
            const isOwner = userEmail && userEmail === comment.owner?.email;

            return (
              <div
                key={comment.id}
                className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/60 flex items-start justify-between gap-3 group/comment"
              >
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-500 flex items-center justify-center font-bold text-xs text-white shadow-sm shrink-0 mt-0.5">
                    {authorEmail.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-200">{authorEmail.split('@')[0]}</span>
                      <span className="text-[10px] text-slate-500">
                        {new Date(comment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">{comment.content}</p>
                  </div>
                </div>

                {isOwner && (
                  <button
                    onClick={() => handleDeleteComment(comment.id)}
                    title="Delete Comment"
                    className="opacity-0 group-hover/comment:opacity-100 p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition-all cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
