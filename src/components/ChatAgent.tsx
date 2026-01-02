import { MessageSquare, Clock } from 'lucide-react';
import './ChatAgent.css';

export function ChatAgent() {
  return (
    <div className="chat-agent">
      <div className="coming-soon-container">
        <div className="coming-soon-icon">
          <MessageSquare size={80} strokeWidth={1.5} />
        </div>
        <h2>Chat Agent</h2>
        <p className="coming-soon-text">Coming Soon</p>
        <div className="coming-soon-features">
          <div className="feature-item">
            <Clock size={20} />
            <span>Real-time messaging</span>
          </div>
          <div className="feature-item">
            <MessageSquare size={20} />
            <span>Multi-language support</span>
          </div>
        </div>
        <p className="coming-soon-description">
          We're working on bringing you an intelligent chat interface
          with the same powerful AI agents. Stay tuned!
        </p>
      </div>
    </div>
  );
}
