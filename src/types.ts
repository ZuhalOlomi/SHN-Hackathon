export type Mode = 'clinic' | 'hospital' | 'challenge'

export interface Patient {
  age: number;
  sex: string;
  vitals?: { bp?: string; hr?: number };
  labs?: { a1c?: number; egfr?: number; uacr?: string };
  /** Clinical aspects / indicators visible as chips (e.g., 'ASCVD','CKD','HF','PeriOp','Obesity') */
  flags?: string[];
  /** Learning or treatment goals (optional) */
  goals?: string[];
  /** Context such as 'PeriOp' (used by rules) */
  context?: string[];
  /** NEW: Class-level allergies, e.g., ['GLP1RA','SULFONYLUREA'] */
  allergies?: string[];
  /** NEW: Current meds/classes, e.g., ['METFORMIN','SGLT2I'] */
  meds?: string[];
  /** NEW: Free-text context shown to learner */
  notes?: string;
}

export interface CaseItem {
  id: string;
  mode: Mode;
  difficulty: 'guided' | 'standard' | 'hard';
  patient: Patient;
  prompt: string;
  /** Optional “expected” answer for analytics or auto-checking */
  correct?: { cards: string[]; notes?: string[] };
  /** NEW: Restrict visible therapy cards for this case */
  allowedCards?: string[];
}

export interface TherapyCardDef {
  id: string;
  label: string;
  tags?: string[];
  gates?: string[];
  hints?: string[];
  sourceKeys?: string[];
}

export interface RulesSchema {
  gates: Record<string, any>;
  banners: Record<'green'|'amber'|'red', string>;
}

export interface DebriefTemplates {
  green: string[];
  amber: string[];
  red: string[];
  citationModal: { title: string; body: string };
}

export interface CitationItem { 
  title: string; 
  summary: string; 
  source: string; 
  link: string; 
}