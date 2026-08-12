import React, { useState, useEffect } from 'react';
import { getPostsApi, createPostApi, voteApi, deletePostApi } from '../api';
import { CreatePostCard } from './CreatePostCard';
import { PostCard } from './PostCard';
import { RefreshCw, TrendingUp, Sparkles, Flame, Search, AlertCircle } from 'lucide-react';

export const Feed = ({ onOpenChatWithUser }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('latest');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchPosts = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    setError(null);
    try {
      const data = await getPostsApi();
      setPosts(data || []);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Could not connect to FastAPI server at http://localhost:8000. Ensure the backend server is running.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleCreatePost = async (newPostData) => {
    await createPostApi(newPostData);
    await fetchPosts();
  };

  const handleVote = async (postId, dir) => {
    await voteApi(postId, dir);
  };

  const handleDeletePost = async (postId) => {
    await deletePostApi(postId);
    setPosts((prev) => prev.filter((p) => (p.Post ? p.Post.id !== postId : p.id !== postId)));
  };

  const filteredPosts = posts
    .filter((item) => {
      const post = item.Post || item;
      const titleMatch = post.title?.toLowerCase().includes(searchQuery.toLowerCase());
      const contentMatch = post.content?.toLowerCase().includes(searchQuery.toLowerCase());
      return titleMatch || contentMatch;
    })
    .sort((a, b) => {
      if (activeTab === 'top') {
        const votesA = a.votes !== undefined ? a.votes : 0;
        const votesB = b.votes !== undefined ? b.votes : 0;
        return votesB - votesA;
      }
      const idA = a.Post?.id || a.id || 0;
      const idB = b.Post?.id || b.id || 0;
      return idB - idA;
    });

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      
      {/* Create Post Section */}
      <CreatePostCard onPostCreated={handleCreatePost} />

      {/* Feed Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-4">
        
        {/* Sort Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-2xl w-fit">
          <button
            onClick={() => setActiveTab('latest')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'latest'
                ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Latest Feed</span>
          </button>
          <button
            onClick={() => setActiveTab('top')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'top'
                ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Most Upvoted</span>
          </button>
        </div>

        {/* Search & Refresh */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-60">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search posts..."
              className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500"
            />
          </div>

          <button
            onClick={() => fetchPosts(true)}
            disabled={refreshing}
            title="Refresh Feed"
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-all active:scale-95 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-violet-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-800/60 text-rose-300 flex items-center justify-between text-xs animate-fade-in">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => fetchPosts(true)}
            className="px-3 py-1.5 rounded-lg bg-rose-900/60 hover:bg-rose-800 text-white font-semibold cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Feed List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-slate-900/40 border border-slate-800/60 rounded-3xl p-6 space-y-4 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-slate-800" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-slate-800 rounded w-1/4" />
                  <div className="h-3 bg-slate-800/60 rounded w-1/6" />
                </div>
              </div>
              <div className="h-5 bg-slate-800 rounded w-3/4" />
              <div className="h-12 bg-slate-800/60 rounded w-full" />
            </div>
          ))}
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="text-center py-16 px-4 bg-slate-900/40 border border-slate-800/60 rounded-3xl space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-violet-950/60 border border-violet-800/40 flex items-center justify-center mx-auto text-violet-400">
            <Flame className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-200">No posts found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchQuery ? `No posts matching "${searchQuery}"` : 'Be the first to publish a post to this social media feed!'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPosts.map((item, idx) => (
            <PostCard
              key={item.Post?.id || item.id || idx}
              item={item}
              onVote={handleVote}
              onDeletePost={handleDeletePost}
              onDirectMessage={onOpenChatWithUser}
            />
          ))}
        </div>
      )}
    </main>
  );
};
