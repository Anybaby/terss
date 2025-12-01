export interface SkillScore {
  category: string;
  score: number;
  type: 'Theory' | 'Practice';
}

export interface Recommendation {
  direction: string;
  steps: string;
  resources: string;
}

export interface Candidate {
  id: string;
  name: string;
  role: string;
  avatar: string;
  updatedAt: string;
  summary: string;
  detailedAnalysis: string;
  scores: SkillScore[];
  recommendations: Recommendation[];
}

export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  REPORT = 'REPORT'
}