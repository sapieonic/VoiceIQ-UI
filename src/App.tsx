import { useState } from 'react';
import { Phone, MessageSquare, Sparkles } from 'lucide-react';
import { CallingAgent } from './components/CallingAgent';
import { ChatAgent } from './components/ChatAgent';
import './App.css';

type TabType = 'calling' | 'chat';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('calling');

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

export default App;
