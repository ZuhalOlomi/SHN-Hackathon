import type { CaseItem, TherapyCardDef, RulesSchema, DebriefTemplates } from '../types'

export async function loadCases(): Promise<CaseItem[]> {
  const r = await fetch('/data/cases.json'); return r.json()
}
export async function loadCards(): Promise<TherapyCardDef[]> {
  const r = await fetch('/data/cards.json'); return r.json()
}
export async function loadRules(): Promise<RulesSchema> {
  const r = await fetch('/data/rules.json'); return r.json()
}
export async function loadDebrief(): Promise<DebriefTemplates> {
  const r = await fetch('/data/debrief_templates.json'); return r.json()
}

// NEW
export async function loadCitations(): Promise<Record<string, {title:string; summary:string; source:string; link:string}>> {
  const r = await fetch('/data/citation_map.json'); return r.json()
}