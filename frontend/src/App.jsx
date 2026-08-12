import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/Toast';
import { Navbar } from './components/Navbar';
import { Feed } from './components/Feed';
import { AuthModal } from './components/AuthModal';
import { ChatDrawer } from './components/ChatDrawer';

export function AppContent() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatTargetUser, setChatTargetUser] = useState(null);

  const handleOpenChatWithUser = (user) => {
    setChatTargetUser(user);
    setIsChatOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-violet-500 selection:text-white transition-colors duration-300">
      <Navbar onOpenChat={() => setIsChatOpen(true)} />
      <Feed onOpenChatWithUser={handleOpenChatWithUser} />
      <AuthModal />
      <ChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        activeTargetUser={chatTargetUser}
      />
      
      {/* Modern Minimal Footer */}
      <footer className="border-t border-slate-800/80 py-6 mt-12 text-center text-xs text-slate-500">
        <p>© {new Date().getFullYear()} SocialPulse • Powered by FastAPI & React</p>
      </footer>
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
