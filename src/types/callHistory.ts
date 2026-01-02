export interface CallHistoryEntry {
  callId: string;
  agentId: string;
  agentName: string;
  language: string;
  customerName: string;
  phoneNumber: string;
  timestamp: string;
  recorded: boolean;
}

export interface Recording {
  sid: string;
  duration: string;
  status: string;
  dateCreated: string;
  downloadUrlMp3: string;
  downloadUrlWav: string;
}

export interface RecordingsResponse {
  success: boolean;
  callSid: string;
  recordings: Recording[];
}

export interface GroupedCallHistory {
  [agentId: string]: {
    agentName: string;
    languages: {
      [language: string]: CallHistoryEntry[];
    };
  };
}
