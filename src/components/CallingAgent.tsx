import { useState, useEffect } from 'react';
import {
  Phone,
  PhoneOff,
  User,
  ChevronDown,
  ChevronUp,
  Loader2,
  Server,
  CheckCircle,
  History,
  ChevronLeft,
  ChevronRight,
  Play,
  Download,
  Trash2,
  X,
  Mic,
  MicOff,
} from 'lucide-react';
import {
  agentConfigs,
  languageLabels,
  generateSystemPrompt,
  type AgentConfig,
} from '../config/agentConfig';
import {
  saveCallToHistory,
  getCallHistory,
  deleteCallFromHistory,
  formatDateTime,
  formatDuration,
} from '../utils/callHistoryStorage';
import {
  apiPost,
  apiGet,
  getApiBaseUrl,
  setApiBaseUrl as saveApiBaseUrl,
  ApiError,
  fetchAudioBlobUrl,
  downloadFile,
} from '../utils/api';
import type { CallHistoryEntry, Recording } from '../types/callHistory';
import './CallingAgent.css';

interface CallState {
  status: 'idle' | 'calling' | 'connected' | 'ended';
  error?: string;
  callId?: string;
}

/** Recording with blob URLs for authenticated playback */
interface RecordingWithBlob extends Recording {
  blobUrlMp3?: string;
}

export function CallingAgent() {
  const [selectedAgentId, setSelectedAgentId] = useState<string>(agentConfigs[0].id);
  const [selectedLanguage, setSelectedLanguage] = useState<string>(agentConfigs[0].defaultLanguage);
  const [phoneNumber, setPhoneNumber] = useState<string>('+91');
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showPromptPreview, setShowPromptPreview] = useState<boolean>(false);
  const [generatedPrompt, setGeneratedPrompt] = useState<string>('');
  const [callState, setCallState] = useState<CallState>({ status: 'idle' });
  const [recordCall, setRecordCall] = useState<boolean>(true);
  const [apiBaseUrl, setApiBaseUrl] = useState<string>(() => getApiBaseUrl());

  // History panel state
  const [historyOpen, setHistoryOpen] = useState<boolean>(true);
  const [filteredHistory, setFilteredHistory] = useState<CallHistoryEntry[]>([]);
  const [loadingRecordings, setLoadingRecordings] = useState<string | null>(null);
  const [selectedRecordings, setSelectedRecordings] = useState<{
    callId: string;
    customerName: string;
    recordings: RecordingWithBlob[];
  } | null>(null);

  const selectedAgent = agentConfigs.find((a) => a.id === selectedAgentId) as AgentConfig;

  /**
   * Revoke blob URLs to free memory.
   * Call this when closing the recordings modal.
   */
  const cleanupBlobUrls = (recordings: RecordingWithBlob[] | undefined) => {
    if (!recordings) return;
    recordings.forEach((recording) => {
      if (recording.blobUrlMp3) {
        URL.revokeObjectURL(recording.blobUrlMp3);
      }
    });
  };

  /**
   * Close the recordings modal and clean up blob URLs
   */
  const closeRecordingsModal = () => {
    cleanupBlobUrls(selectedRecordings?.recordings);
    setSelectedRecordings(null);
  };

  // Save API base URL to localStorage when it changes
  useEffect(() => {
    saveApiBaseUrl(apiBaseUrl);
  }, [apiBaseUrl]);

  // Initialize variables when agent changes
  useEffect(() => {
    const newVariables: Record<string, string> = {};
    selectedAgent.variables.forEach((v) => {
      newVariables[v.key] = v.defaultValue;
    });
    newVariables['company'] = selectedAgent.company;
    newVariables['tone'] = selectedAgent.tone;
    setVariables(newVariables);
    setSelectedLanguage(selectedAgent.defaultLanguage);
  }, [selectedAgentId]);

  // Generate prompt when variables or language changes
  useEffect(() => {
    if (selectedAgent && Object.keys(variables).length > 0) {
      try {
        const prompt = generateSystemPrompt(selectedAgentId, selectedLanguage, variables);
        setGeneratedPrompt(prompt);
      } catch (error) {
        console.error('Error generating prompt:', error);
      }
    }
  }, [selectedAgentId, selectedLanguage, variables]);

  // Load and filter history when agent/language changes
  useEffect(() => {
    loadFilteredHistory();
  }, [selectedAgentId, selectedLanguage]);

  // Cleanup blob URLs when component unmounts
  useEffect(() => {
    return () => {
      cleanupBlobUrls(selectedRecordings?.recordings);
    };
  }, [selectedRecordings]);

  const loadFilteredHistory = () => {
    const allHistory = getCallHistory();
    const filtered = allHistory.filter(
      (entry) => entry.agentId === selectedAgentId && entry.language === selectedLanguage
    );
    setFilteredHistory(filtered);
  };

  const handleVariableChange = (key: string, value: string) => {
    setVariables((prev) => ({ ...prev, [key]: value }));
  };

  const isFormValid = (): boolean => {
    if (!phoneNumber || phoneNumber.length < 10) return false;
    for (const variable of selectedAgent.variables) {
      if (variable.required && !variables[variable.key]) {
        return false;
      }
    }
    return true;
  };

  const initiateCall = async () => {
    if (!isFormValid()) {
      setCallState({ status: 'idle', error: 'Please fill all required fields' });
      return;
    }

    setCallState({ status: 'calling' });

    try {
      const data = await apiPost<{ callSid: string; success: boolean }>('/api/call', {
        phoneNumber,
        systemPrompt: generatedPrompt,
        record: recordCall,
      });
      console.log('Call initiated:', data);

      const callId = data.callSid;

      if (!callId) {
        throw new Error('No callSid returned from API');
      }

      // Save to call history
      const historyEntry: CallHistoryEntry = {
        callId,
        agentId: selectedAgentId,
        agentName: selectedAgent.name,
        language: selectedLanguage,
        customerName: variables['customerName'] || 'Unknown',
        phoneNumber,
        timestamp: new Date().toISOString(),
        recorded: recordCall,
      };
      saveCallToHistory(historyEntry);
      loadFilteredHistory();

      setCallState({
        status: 'connected',
        callId,
      });
    } catch (error) {
      console.error('Error initiating call:', error);
      const errorMessage = error instanceof ApiError
        ? error.message
        : 'Failed to initiate call. Please check if the server is running.';
      setCallState({
        status: 'idle',
        error: errorMessage,
      });
    }
  };

  const endCall = async () => {
    if (!callState.callId) return;

    try {
      await apiPost(`/api/call/${callState.callId}/end`);
    } catch (error) {
      console.error('Error ending call:', error);
    }

    setCallState({ status: 'ended', callId: callState.callId });
    setTimeout(() => {
      setCallState({ status: 'idle' });
    }, 3000);
  };

  const resetCall = () => {
    setCallState({ status: 'idle' });
  };

  const fetchRecordings = async (entry: CallHistoryEntry) => {
    setLoadingRecordings(entry.callId);

    try {
      const data = await apiGet<{ success: boolean; recordings: Recording[] }>(
        `/api/call/${entry.callId}/recordings`
      );

      if (data.success && data.recordings && data.recordings.length > 0) {
        // Fetch audio blobs for each recording (with authentication)
        const recordingsWithBlobs: RecordingWithBlob[] = await Promise.all(
          data.recordings.map(async (recording) => {
            try {
              const blobUrlMp3 = await fetchAudioBlobUrl(recording.downloadUrlMp3);
              return { ...recording, blobUrlMp3 };
            } catch (err) {
              console.error('Failed to fetch audio blob:', err);
              return recording; // Return without blob if fetch fails
            }
          })
        );

        setSelectedRecordings({
          callId: entry.callId,
          customerName: entry.customerName,
          recordings: recordingsWithBlobs,
        });
      } else {
        alert('No recordings found for this call');
      }
    } catch (err) {
      console.error('Error fetching recordings:', err);
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to fetch recordings';
      alert(errorMessage);
    } finally {
      setLoadingRecordings(null);
    }
  };

  const handleDeleteCall = (callId: string) => {
    if (confirm('Delete this call from history?')) {
      deleteCallFromHistory(callId);
      loadFilteredHistory();
    }
  };

  return (
    <div className="calling-agent">
      <div className={`agent-layout ${historyOpen ? 'history-open' : ''}`}>
        {/* Main Form Panel */}
        <div className="agent-form-container">
          {/* Agent Selection */}
          <div className="form-section">
            <label className="section-label">Select Agent Type</label>
            <div className="select-wrapper">
              <select
                value={selectedAgentId}
                onChange={(e) => setSelectedAgentId(e.target.value)}
                className="agent-select"
              >
                {agentConfigs.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name}
                  </option>
                ))}
              </select>
              <ChevronDown size={20} className="select-icon" />
            </div>
            <p className="section-description">{selectedAgent.description}</p>
          </div>

          {/* Language Selection */}
          <div className="form-section">
            <label className="section-label">Select Language</label>
            <div className="language-pills">
              {selectedAgent.supportedLanguages.map((lang) => (
                <button
                  key={lang}
                  className={`language-pill ${selectedLanguage === lang ? 'selected' : ''}`}
                  onClick={() => setSelectedLanguage(lang)}
                >
                  {languageLabels[lang]}
                </button>
              ))}
            </div>
          </div>

          {/* Customer Details Form */}
          <div className="form-section">
            <label className="section-label">Customer Details</label>
            <div className="customer-form">
              {/* Phone Number */}
              <div className="form-field phone-field">
                <label>Phone Number <span className="required">*</span></label>
                <div className="phone-input-wrapper">
                  <User size={18} className="field-icon" />
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+919876543210"
                    disabled={callState.status === 'calling' || callState.status === 'connected'}
                  />
                </div>
              </div>

              {/* Record Call Checkbox */}
              <div className="form-field checkbox-field">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={recordCall}
                    onChange={(e) => setRecordCall(e.target.checked)}
                    disabled={callState.status === 'calling' || callState.status === 'connected'}
                  />
                  <span className="checkbox-custom"></span>
                  <span className="checkbox-text">Record this call</span>
                </label>
              </div>

              {/* Other Variables */}
              {selectedAgent.variables.map((variable) => (
                <div key={variable.key} className="form-field">
                  <label>
                    {variable.label}
                    {variable.required && <span className="required">*</span>}
                  </label>
                  <input
                    type={variable.type === 'number' ? 'number' : 'text'}
                    value={variables[variable.key] || ''}
                    onChange={(e) => handleVariableChange(variable.key, e.target.value)}
                    placeholder={variable.defaultValue}
                    disabled={callState.status === 'calling' || callState.status === 'connected'}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Prompt Preview */}
          <div className="form-section">
            <div
              className="collapsible-header"
              onClick={() => setShowPromptPreview(!showPromptPreview)}
            >
              <label className="section-label clickable">System Prompt Preview</label>
              {showPromptPreview ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </div>
            {showPromptPreview && (
              <div className="prompt-preview">
                <pre>{generatedPrompt}</pre>
              </div>
            )}
          </div>

          {/* API Settings */}
          <div className="form-section">
            <div
              className="collapsible-header"
              onClick={() => setShowSettings(!showSettings)}
            >
              <label className="section-label clickable">
                <Server size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                API Settings
              </label>
              {showSettings ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </div>
            {showSettings && (
              <div className="settings-content">
                <div className="form-field">
                  <label>API Base URL</label>
                  <input
                    type="url"
                    value={apiBaseUrl}
                    onChange={(e) => setApiBaseUrl(e.target.value)}
                    placeholder="http://localhost:3000"
                  />
                  <span className="input-hint">The base URL for API calls</span>
                </div>
              </div>
            )}
          </div>

          {/* Error Message */}
          {callState.error && (
            <div className="error-banner">
              <p>{callState.error}</p>
            </div>
          )}

          {/* Call Action Section */}
          <div className="call-action-section">
            {callState.status === 'idle' && (
              <button
                className="call-btn start"
                onClick={initiateCall}
                disabled={!isFormValid()}
              >
                <Phone size={20} />
                Initiate Call
              </button>
            )}

            {callState.status === 'calling' && (
              <div className="call-status-inline">
                <Loader2 size={24} className="spinning" />
                <span>Initiating call...</span>
              </div>
            )}

            {callState.status === 'connected' && (
              <div className="call-connected-section">
                <div className="call-id-display">
                  <CheckCircle size={24} className="success-icon" />
                  <div className="call-id-info">
                    <span className="call-id-label">Call Connected</span>
                    <span className="call-id-value">{callState.callId}</span>
                  </div>
                </div>
                <button className="call-btn end" onClick={endCall}>
                  <PhoneOff size={20} />
                  End Call
                </button>
              </div>
            )}

            {callState.status === 'ended' && (
              <div className="call-ended-section">
                <div className="call-ended-info">
                  <PhoneOff size={24} className="ended-icon" />
                  <div>
                    <span className="call-ended-label">Call Ended</span>
                    {callState.callId && (
                      <span className="call-id-value">{callState.callId}</span>
                    )}
                  </div>
                </div>
                <button className="call-btn reset" onClick={resetCall}>
                  Start New Call
                </button>
              </div>
            )}
          </div>
        </div>

        {/* History Toggle Button */}
        <button
          className="history-toggle"
          onClick={() => setHistoryOpen(!historyOpen)}
          title={historyOpen ? 'Hide History' : 'Show History'}
        >
          {historyOpen ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          <History size={18} />
        </button>

        {/* History Panel */}
        <div className={`history-panel ${historyOpen ? 'open' : ''}`}>
          <div className="history-panel-header">
            <div className="history-panel-title">
              <History size={18} />
              <span>Call History</span>
            </div>
            <span className="history-filter-badge">
              {languageLabels[selectedLanguage]}
            </span>
          </div>

          <div className="history-panel-content">
            {filteredHistory.length === 0 ? (
              <div className="history-empty">
                <Phone size={32} />
                <p>No calls yet for this agent & language</p>
              </div>
            ) : (
              <div className="history-list">
                {filteredHistory.map((call) => (
                  <div key={call.callId} className="history-item">
                    <div className="history-item-main">
                      <span className="history-customer">{call.customerName}</span>
                      <span className="history-phone">{call.phoneNumber}</span>
                      <span className="history-time">{formatDateTime(call.timestamp)}</span>
                    </div>
                    <div className="history-item-meta">
                      {call.recorded ? (
                        <span className="badge recorded">
                          <Mic size={10} /> Recorded
                        </span>
                      ) : (
                        <span className="badge not-recorded">
                          <MicOff size={10} />
                        </span>
                      )}
                      <div className="history-item-actions">
                        {call.recorded && (
                          <button
                            className="hist-action-btn"
                            onClick={() => fetchRecordings(call)}
                            disabled={loadingRecordings === call.callId}
                            title="Get Recordings"
                          >
                            {loadingRecordings === call.callId ? (
                              <Loader2 size={14} className="spinning" />
                            ) : (
                              <Play size={14} />
                            )}
                          </button>
                        )}
                        <button
                          className="hist-action-btn delete"
                          onClick={() => handleDeleteCall(call.callId)}
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recordings Modal */}
      {selectedRecordings && (
        <div className="modal-overlay" onClick={closeRecordingsModal}>
          <div className="recordings-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Recordings - {selectedRecordings.customerName}</h3>
              <button className="close-btn" onClick={closeRecordingsModal}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-content">
              {selectedRecordings.recordings.map((recording, index) => (
                <div key={recording.sid} className="recording-item">
                  <div className="recording-info">
                    <span className="recording-number">Recording {index + 1}</span>
                    <div className="recording-details">
                      <span>Duration: {formatDuration(recording.duration)}</span>
                      <span>Status: {recording.status}</span>
                    </div>
                  </div>
                  <div className="recording-player">
                    {recording.blobUrlMp3 ? (
                      <audio controls src={recording.blobUrlMp3}>
                        Your browser does not support audio playback.
                      </audio>
                    ) : (
                      <span className="audio-loading">Loading audio...</span>
                    )}
                  </div>
                  <div className="recording-actions">
                    <button
                      className="download-btn"
                      onClick={() => downloadFile(
                        recording.downloadUrlMp3,
                        `recording-${recording.sid}.mp3`
                      )}
                    >
                      <Download size={14} /> MP3
                    </button>
                    <button
                      className="download-btn"
                      onClick={() => downloadFile(
                        recording.downloadUrlWav,
                        `recording-${recording.sid}.wav`
                      )}
                    >
                      <Download size={14} /> WAV
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
