import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Send, Image, Sparkles, CheckCircle2, Lock, PlusCircle } from 'lucide-react';

export const CreatePostCard = ({ onPostCreated }) => {
  const { isAuthenticated, setIsAuthModalOpen, userEmail } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [published, setPublished] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const avatarLetter = userEmail ? userEmail.charAt(0).toUpperCase() : '?';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
      return;
    }

    if (!title.trim() || !content.trim()) {
      setErrorMsg('Please enter both a title and content.');
      return;
    }

    setErrorMsg('');
    setLoading(true);

    try {
      await onPostCreated({ title, content, published });
      setTitle('');
      setContent('');
      setSuccessMsg('Post created successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || 'Failed to publish post.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl shadow-slate-950/40 relative overflow-hidden transition-all duration-300">
      {/* Background Subtle Accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 rounded-full blur-2xl pointer-events-none" />

      {!isAuthenticated && (
        <div className="absolute inset-0 z-10 backdrop-blur-sm bg-slate-950/70 flex items-center justify-center p-6 text-center">
          <div className="max-w-sm">
            <div className="w-10 h-10 rounded-full bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center mx-auto mb-2 text-indigo-400">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">Sign in to join the conversation</h3>
            <p className="text-xs text-slate-400 mb-3">Share your thoughts, update your community, and upvote posts.</p>
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
            >
              Sign In / Register
            </button>
          </div>
        </div>
      )}

      {/* Header with User Info */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-sm text-white shadow-md">
          {avatarLetter}
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-200">
            {userEmail ? userEmail.split('@')[0] : 'Guest User'}
          </h3>
          <span className="text-xs text-slate-500 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-indigo-400" /> Creating a public post
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {errorMsg && (
          <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-800/50 text-rose-300 text-xs">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-800/50 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            {successMsg}
          </div>
        )}

        {/* Post Title */}
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Catchy Post Title..."
          maxLength={120}
          className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-2xl text-slate-100 placeholder-slate-500 text-sm font-semibold focus:outline-none focus:border-indigo-500 transition-colors"
        />

        {/* Post Body */}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind? Share news, ideas, or questions..."
          rows={3}
          className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-2xl text-slate-100 placeholder-slate-500 text-sm resize-none focus:outline-none focus:border-indigo-500 transition-colors"
        />

        {/* Controls & Action Bar */}
        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-400 select-none">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-indigo-500/20"
            />
            <span>Publish publicly immediately</span>
          </label>

          <button
            type="submit"
            disabled={loading || !title.trim() || !content.trim()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Post Now</span>
                <Send className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
