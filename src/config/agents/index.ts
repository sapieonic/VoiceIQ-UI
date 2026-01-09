import { collectionAgent } from './collection';
import { ecommerceAgent } from './ecommerce';
import { insuranceAgent } from './insurance';
import { bouncePenalAgent } from './bounce-penal';
import { preDueAgent } from './pre-due';
import { npaSettlementAgent } from './npa-settlement';
import { bucketXAgent } from './bucket-x';
import type { AgentConfig } from '../types';

/** All agent configurations including hidden ones */
export const allAgentConfigs: AgentConfig[] = [
  collectionAgent,
  ecommerceAgent,
  insuranceAgent,
  bouncePenalAgent,
  preDueAgent,
  npaSettlementAgent,
  bucketXAgent,
];

/** Only visible agent configurations (excludes agents with isHidden: true) */
export const agentConfigs: AgentConfig[] = allAgentConfigs.filter(
  (agent) => !agent.isHidden
);

export {
  collectionAgent,
  ecommerceAgent,
  insuranceAgent,
  bouncePenalAgent,
  preDueAgent,
  npaSettlementAgent,
  bucketXAgent,
};
