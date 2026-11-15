/** Stable identifiers for the eight learning domains. Also used as route segments. */
export type DomainId =
  | 'networking'
  | 'linux-os'
  | 'cybersecurity'
  | 'programming'
  | 'system-design'
  | 'computer-science'
  | 'ai-ml'
  | 'cloud-devops';

export type DomainStatus = 'planned' | 'in-progress' | 'available';

/** Icon keys are plain strings so that data stays free of React imports. */
export type DomainIconName =
  'network' | 'terminal' | 'shield' | 'code' | 'boxes' | 'cpu' | 'brain' | 'cloud';

export interface DomainSummary {
  id: DomainId;
  title: string;
  tagline: string;
  description: string;
  icon: DomainIconName;
  status: DomainStatus;
  /** Representative topics shown on the catalogue card. */
  topics: readonly string[];
}
