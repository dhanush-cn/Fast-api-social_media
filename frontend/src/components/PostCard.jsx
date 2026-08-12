import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from './Toast';
import { CommentSection } from './CommentSection';
import { ThumbsUp, Trash2, Clock, User, Share2, Check, MessageSquare, Send } from 'lucide-react';

export const PostCard = ({ item, onVote, onDeletePost, onDirectMessage }) => {
  const { isAuthenticated, setIsAuthModalOpen, userEmail } = useAuth();
  const { addToast } = useToast();

  const post = item.Post || item;
  const initialVotes = item.votes !== undefined ? item.votes : 0;

  const [votesCount, setVotesCount] = useState(initialVotes);
  const [hasVoted, setHasVoted] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showComments, setShowComments] = useState(false);

  const formattedDate = post.created_at
    ? new Date(post.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Just now';

  // Author representation
  const authorEmail = post.owner?.email || `User #${post.owner_id || '?'}`;
  const isOwner = userEmail && userEmail === post.owner?.email;

  const handleVoteClick = async () => {
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
      return;
    }

    if (isVoting) return;
    setIsVoting(true);

    const nextVotedState = !hasVoted;
    const dir = nextVotedState ? 1 : 0;

    // Optimistic Update
    setHasVoted(nextVotedState);
    setVotesCount((prev) => (nextVotedState ? prev + 1 : Math.max(0, prev - 1)));

    try {
      await onVote(post.id, dir);
      addToast(nextVotedState ? 'Post upvoted!' : 'Upvote removed', nextVotedState ? 'success' : 'info');
    } catch (err) {
      if (err.response?.status === 409) {
        setHasVoted(true);
      } else {
        setHasVoted(!nextVotedState);
        setVotesCount((prev) => (nextVotedState ? Math.max(0, prev - 1) : prev + 1));
      }
    } finally {
      setIsVoting(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      setIsDeleting(true);
      try {
        await onDeletePost(post.id);
        addToast('Post deleted', 'info');
      } catch (err) {
        addToast(err.response?.data?.detail || 'Failed to delete post.', 'error');
        setIsDeleting(false);
      }
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    addToast('Post link copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenMessage = () => {
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
      return;
    }
    if (post.owner_id) {
      onDirectMessage({ id: post.owner_id, email: authorEmail });
    }
  };

  return (
    <article className="group bg-slate-900/80 hover:bg-slate-900 border border-slate-800/80 hover:border-violet-500/40 rounded-3xl p-6 shadow-xl shadow-slate-950/40 hover:shadow-violet-950/20 transition-all duration-300 relative overflow-hidden">
      
      {/* Top Accent Gradient Border Glow */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Post Header: Author info & DM Trigger */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 via-purple-600 to-cyan-500 flex items-center justify-center font-bold text-sm text-white shadow-md shadow-violet-600/20 shrink-0">
            {authorEmail.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-slate-200">{authorEmail.split('@')[0]}</span>
              {!isOwner && post.owner_id && (
                <button
                  onClick={handleOpenMessage}
                  title="Message Author"
                  className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-950/60 hover:bg-violet-900/80 border border-violet-800/50 text-[10px] font-semibold text-violet-300 transition-colors cursor-pointer"
                >
                  <Send className="w-2.5 h-2.5" />
                  <span>Message</span>
                </button>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
              <Clock className="w-3.5 h-3.5" />
              <span>{formattedDate}</span>
            </div>
          </div>
        </div>

        {/* Share & Delete Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleShare}
            title="Share Link"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
          </button>

          {isOwner && onDeletePost && (
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              title="Delete Post"
              className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Post Content */}
      <div className="mb-5">
        <h2 className="text-lg font-bold text-slate-100 mb-2 leading-snug tracking-tight">
          {post.title}
        </h2>
        <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line font-normal">
          {post.content}
        </p>
      </div>

      {/* Post Footer Action Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-800/80">
        
        {/* Upvote Button */}
        <button
          onClick={handleVoteClick}
          disabled={isVoting}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all duration-200 cursor-pointer active:scale-95 ${
            hasVoted
              ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-md shadow-violet-600/30 ring-2 ring-violet-500/40'
              : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-violet-400 border border-slate-700/60'
          }`}
        >
          <ThumbsUp className={`w-4 h-4 transition-transform duration-200 ${hasVoted ? 'scale-110 fill-white' : ''}`} />
          <span>{votesCount} Upvotes</span>
        </button>

        {/* Discussion / Comments Toggle Button */}
        <button
          onClick={() => setShowComments(!showComments)}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
            showComments
              ? 'bg-slate-800 text-violet-300 border border-violet-500/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Discussion</span>
        </button>
      </div>

      {/* Collapsible Comments Tray */}
      <CommentSection postId={post.id} isOpen={showComments} />
    </article>
  );
};
