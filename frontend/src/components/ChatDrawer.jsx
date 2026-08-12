import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from './Toast';
import { getConversationsApi, getChatHistoryApi, sendMessageApi } from '../api';
import { MessageSquare, Send, X, User, Sparkles, Search, CheckCheck } from 'lucide-react';

export const ChatDrawer = ({ isOpen, onClose, activeTargetUser }) => {
  const { isAuthenticated, userEmail } = useAuth();
  const { addToast } = useToast();
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen && isAuthenticated) {
      fetchConversations();
    }
  }, [isOpen, isAuthenticated]);

  useEffect(() => {
    if (activeTargetUser) {
      setSelectedUser(activeTargetUser);
    }
  }, [activeTargetUser]);

  useEffect(() => {
    if (selectedUser && isAuthenticated) {
      fetchChatHistory(selectedUser.id);
    }
  }, [selectedUser, isAuthenticated]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const data = await getConversationsApi();
      setConversations(data || []);
    } catch (err) {
      console.error('Error fetching conversations:', err);
    }
  };

  const fetchChatHistory = async (userId) => {
    setLoading(true);
    try {
      const data = await getChatHistoryApi(userId);
      setMessages(data || []);
    } catch (err) {
      console.error('Error fetching chat history:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!selectedUser || !inputText.trim()) return;

    const content = inputText.trim();
    setInputText('');
    setSending(true);

    try {
      const newMsg = await sendMessageApi(selectedUser.id, content);
      setMessages((prev) => [...prev, newMsg]);
      addToast('Message sent!', 'success');
      fetchConversations();
    } catch (err) {
      addToast(err.response?.data?.detail || 'Failed to send message', 'error');
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl shadow-violet-950/50">
        
        {/* Header Bar */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 via-purple-600 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-600/30">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-1.5">
                <span>Direct Messages</span>
                <Sparkles className="w-3.5 h-3.5 text-fuchsia-400" />
              </h2>
              <p className="text-xs text-slate-400">
                {selectedUser ? `Chatting with ${selectedUser.email}` : 'Private 1-on-1 conversations'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Container */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Recent Conversations Sidebar */}
          <div className={`${selectedUser ? 'hidden sm:block sm:w-1/3' : 'w-full'} border-r border-slate-800/80 overflow-y-auto p-3 space-y-2 bg-slate-950/40`}>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3 px-2">
              Recent Chats
            </div>

            {conversations.length === 0 ? (
              <div className="text-center py-8 px-2 text-xs text-slate-500">
                No recent conversations. Click "Message" on any post to start chatting!
              </div>
            ) : (
              conversations.map((conv) => {
                const isSelected = selectedUser?.id === conv.user.id;
                const letter = conv.user.email.charAt(0).toUpperCase();

                return (
                  <button
                    key={conv.user.id}
                    onClick={() => setSelectedUser(conv.user)}
                    className={`w-full p-3 rounded-2xl flex items-center gap-3 text-left transition-all ${
                      isSelected
                        ? 'bg-gradient-to-r from-violet-600/30 to-fuchsia-600/30 border border-violet-500/40 text-white'
                        : 'hover:bg-slate-800/60 border border-transparent text-slate-300'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-500 to-indigo-500 flex items-center justify-center font-bold text-xs text-white shrink-0 shadow-sm">
                      {letter}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold truncate">{conv.user.email.split('@')[0]}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">{conv.last_message}</p>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Active Chat Thread Viewport */}
          {selectedUser ? (
            <div className="flex-1 flex flex-col h-full bg-slate-900/60">
              
              {/* Target User Banner */}
              <div className="px-4 py-2.5 bg-slate-950/60 border-b border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-fuchsia-500 to-indigo-500 flex items-center justify-center font-bold text-xs text-white">
                    {selectedUser.email.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs font-bold text-slate-200">{selectedUser.email}</span>
                </div>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="sm:hidden text-xs text-violet-400 font-semibold"
                >
                  Back to chats
                </button>
              </div>

              {/* Message History */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {loading ? (
                  <div className="py-12 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
                    <span>Loading messages...</span>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="py-16 text-center space-y-2">
                    <div className="w-10 h-10 rounded-2xl bg-violet-950/60 border border-violet-800/40 flex items-center justify-center mx-auto text-violet-400">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <p className="text-xs text-slate-400">Start the conversation with {selectedUser.email}!</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isSender = msg.sender_id !== selectedUser.id;

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isSender ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[80%] p-3.5 rounded-3xl text-xs leading-relaxed shadow-lg ${
                            isSender
                              ? 'bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 text-white rounded-br-none shadow-violet-600/20'
                              : 'bg-slate-800/90 border border-slate-700/80 text-slate-200 rounded-bl-none shadow-slate-950/40'
                          }`}
                        >
                          {msg.content}
                        </div>
                        <span className="text-[10px] text-slate-500 mt-1 px-1 flex items-center gap-1">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {isSender && <CheckCheck className="w-3 h-3 text-violet-400" />}
                        </span>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input Bar */}
              <form onSubmit={handleSend} className="p-3 border-t border-slate-800 bg-slate-950/80 flex gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={`Message ${selectedUser.email.split('@')[0]}...`}
                  disabled={sending}
                  className="flex-1 px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-all"
                />
                <button
                  type="submit"
                  disabled={sending || !inputText.trim()}
                  className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-bold text-xs shadow-md shadow-violet-600/30 transition-all active:scale-95 disabled:opacity-40 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          ) : (
            <div className="hidden sm:flex flex-1 items-center justify-center p-8 text-center bg-slate-950/20">
              <div className="max-w-xs space-y-2">
                <MessageSquare className="w-8 h-8 text-slate-600 mx-auto" />
                <h3 className="text-sm font-bold text-slate-300">Select a Conversation</h3>
                <p className="text-xs text-slate-500">Pick a chat from the sidebar or click "Message" on any post card.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
