import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Flame, LogOut, LogIn, MessageSquare, Sparkles } from 'lucide-react';

export const Navbar = ({ onOpenChat }) => {
  const { isAuthenticated, userEmail, logout, setIsAuthModalOpen } = useAuth();

  const username = userEmail ? userEmail.split('@')[0] : 'Guest';
  const avatarLetter = username.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/80 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 via-fuchsia-600 to-emerald-400 flex items-center justify-center shadow-lg shadow-violet-600/30 group-hover:scale-105 transition-transform duration-300">
            <Flame className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-violet-200 via-fuchsia-200 to-cyan-300 bg-clip-text text-transparent">
                SocialPulse
              </span>
              <Sparkles className="w-3.5 h-3.5 text-fuchsia-400" />
            </div>
            <span className="text-[10px] uppercase font-extrabold tracking-widest text-violet-400 block -mt-1">
              Community Feed & DMs
            </span>
          </div>
        </div>

        {/* Right Nav Options */}
        <div className="flex items-center gap-2.5">
          {isAuthenticated ? (
            <>
              {/* Direct Messages Trigger */}
              <button
                onClick={() => onOpenChat()}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 hover:border-violet-500/50 shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <div className="relative">
                  <MessageSquare className="w-4 h-4 text-violet-400" />
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-fuchsia-500 animate-ping" />
                </div>
                <span className="hidden sm:inline">Messages</span>
              </button>

              {/* User Profile Pill */}
              <div className="hidden sm:flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 shadow-inner">
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-violet-500 via-fuchsia-500 to-cyan-400 flex items-center justify-center font-bold text-xs text-white shadow-sm">
                  {avatarLetter}
                </div>
                <span className="text-xs font-semibold text-slate-200 truncate max-w-[130px]">
                  {userEmail}
                </span>
              </div>

              {/* Logout Button */}
              <button
                onClick={logout}
                title="Logout"
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-rose-400 bg-rose-950/30 hover:bg-rose-900/50 border border-rose-800/40 hover:border-rose-700/60 transition-all duration-200 active:scale-95 shadow-sm cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold text-white bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 shadow-lg shadow-violet-600/30 transition-all duration-200 active:scale-95 cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
