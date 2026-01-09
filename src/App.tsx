import { useState } from 'react';
import { Phone, MessageSquare, Sparkles, LogOut, User, Loader2 } from 'lucide-react';
import { CallingAgent } from './components/CallingAgent';
import { ChatAgent } from './components/ChatAgent';
import { AuthPage } from './components/AuthPage';
import { useAuth } from './context/AuthContext';
import './App.css';

type TabType = 'calling' | 'chat';

function AppContent() {
  const [activeTab, setActiveTab] = useState<TabType>('calling');
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <Sparkles size={32} className="logo-icon" />
            <h1>MagikVoice</h1>
          </div>
          <nav className="tabs">
            <button
              className={`tab ${activeTab === 'calling' ? 'active' : ''}`}
              onClick={() => setActiveTab('calling')}
            >
              <Phone size={20} />
              <span>Calling Agent</span>
            </button>
            <button
              className={`tab ${activeTab === 'chat' ? 'active' : ''}`}
              onClick={() => setActiveTab('chat')}
            >
              <MessageSquare size={20} />
              <span>Chat Agent</span>
            </button>
          </nav>
          <div className="user-menu">
            <div className="user-info">
              <User size={18} />
              <span className="user-name">
                {user?.displayName || user?.email?.split('@')[0] || 'User'}
              </span>
            </div>
            <button className="logout-btn" onClick={handleLogout} title="Sign out">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {activeTab === 'calling' && <CallingAgent />}
        {activeTab === 'chat' && <ChatAgent />}
      </main>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="loading-screen">
      <Sparkles size={48} className="loading-logo" />
      <Loader2 size={32} className="loading-spinner" />
      <p>Loading...</p>
    </div>
  );
}

function App() {
  const { user, loading } = useAuth();

  // Show loading screen while checking auth state
  if (loading) {
    return <LoadingScreen />;
  }

  // Show auth page if not authenticated
  if (!user) {
    return <AuthPage />;
  }

  // Show main app if authenticated
  return <AppContent />;
}

export default App;
