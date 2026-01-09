export interface AgentVariable {
  key: string;
  label: string;
  type: 'text' | 'number' | 'currency';
  defaultValue: string;
  required: boolean;
}

export interface AgentConfig {
  id: string;
  name: string;
  description: string;
  type: string;
  role: string;
  company: string;
  tone: string;
  supportedLanguages: string[];
  defaultLanguage: string;
  variables: AgentVariable[];
  promptTemplates: Record<string, string>;
  /** If true, this agent will not be shown in the UI. Defaults to false. */
  isHidden?: boolean;
}
