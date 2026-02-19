
import { create } from 'zustand'
import type { CaseItem, TherapyCardDef, DebriefTemplates, RulesSchema, Mode, CitationItem } from '../types'

type SessionStats = { mode: Mode|null; total: number; green: number; amber: number; red: number }

type GameState = {
  mode: Mode | null;
  cases: CaseItem[]; cards: TherapyCardDef[]; rules?: RulesSchema; debrief?: DebriefTemplates; citations?: Record<string,CitationItem>;
  currentIndex: number; selected: string[]; score: number; reason: string;
  session: SessionStats;
  setMode: (m: Mode | null) => void;
  setData: (c: CaseItem[], cards: TherapyCardDef[], rules: RulesSchema, debrief: DebriefTemplates, citations: Record<string,CitationItem>) => void;
  selectCard: (id: string) => void; setReason: (s:string)=>void; clearSelection: ()=>void; nextCase: ()=>void; addScore: (n:number)=>void;
  recordOutcome: (level: 'green'|'amber'|'red')=>void;
}

export const useGame = create<GameState>((set,get)=>({
  mode: null,
  cases: [], cards: [], rules: undefined, debrief: undefined, citations: undefined,
  currentIndex: 0, selected: [], score: 0, reason: '',
  session: { mode: null, total: 0, green: 0, amber: 0, red: 0 },
  setMode: (m)=> set(state=>({
    mode:m,
    currentIndex:0,
    selected:[],
    reason:'',
    // reset session when entering a mode; keep when leaving to show summary on Home if desired
    session: m ? { mode:m, total:0, green:0, amber:0, red:0 } : state.session
  })),
  setData: (cases, cards, rules, debrief, citations)=> set({ cases, cards, rules, debrief, citations }),
  selectCard: (id)=>{ const cur = new Set(get().selected); cur.has(id)?cur.delete(id):cur.add(id); set({ selected:[...cur] }) },
  setReason: (s)=> set({ reason:s }),
  clearSelection: ()=> set({ selected: [], reason:'' }),
  nextCase: ()=> set(s=>({ currentIndex: Math.min(s.currentIndex+1, Math.max(0,s.cases.length-1)), selected: [], reason:'' })),
  addScore: (n)=> set(s=>({ score: s.score + n })),
  recordOutcome: (level)=> set(s=>({ session: { ...s.session, total: s.session.total+1, [level]: (s.session as any)[level]+1 } }))
}))
