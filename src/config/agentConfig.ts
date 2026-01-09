// Re-export types
export type { AgentVariable, AgentConfig } from './types';

// Re-export agent configurations
export {
  agentConfigs,
  allAgentConfigs,
  collectionAgent,
  ecommerceAgent,
  insuranceAgent,
  bouncePenalAgent,
  preDueAgent,
  npaSettlementAgent,
  bucketXAgent,
} from './agents';

// Import for internal use (use allAgentConfigs so hidden agents can still generate prompts)
import { allAgentConfigs } from './agents';

export const languageLabels: Record<string, string> = {
  english: 'English',
  hindi: 'Hindi (Hinglish)',
  kannada: 'Kannada',
  telugu: 'Telugu',
};

export function generateSystemPrompt(
  agentId: string,
  language: string,
  variables: Record<string, string>
): string {
  // Search in all agents (including hidden) to allow prompt generation for any agent
  const agent = allAgentConfigs.find((a) => a.id === agentId);
  if (!agent) {
    throw new Error(`Agent not found: ${agentId}`);
  }

  let template = agent.promptTemplates[language];
  if (!template) {
    template = agent.promptTemplates[agent.defaultLanguage];
  }

  // Replace all variables in the template
  const allVariables = {
    ...variables,
    company: variables.company || agent.company,
    tone: variables.tone || agent.tone,
  };

  let prompt = template;
  for (const [key, value] of Object.entries(allVariables)) {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    prompt = prompt.replace(regex, value);
  }

  return prompt;
}
