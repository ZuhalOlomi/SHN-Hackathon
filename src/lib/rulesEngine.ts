import type { CaseItem, TherapyCardDef, RulesSchema } from '../types'

type EvalResult = {
  level: 'green'|'amber'|'red';
  reasons: string[];
  citeKeys: string[];
  failedGate?: string;
  suggest?: string[];
  avoid?: string[];
}

export function evaluatePlan(
  kase: CaseItem,
  selected: string[],
  cards: TherapyCardDef[],
  _rules: RulesSchema
): EvalResult {
  const reasons: string[] = []
  const citeKeys: string[] = []
  const suggest: string[] = []
  const avoid: string[] = []

  const p = kase.patient
  const flags = p.flags || []
  const egfr  = p.labs?.egfr ?? 999
  const context = p.context || []
  const allergies = new Set(p.allergies || [])
  const mode = kase.mode

  // ---------- RED: hard stops ----------
  for (const id of selected) {
    if (allergies.has(id)) {
      return { level:'red', reasons:[`Allergy recorded: cannot use ${id}`], citeKeys:['ADA-S009-metformin'] }
    }
  }
  if (selected.includes('METFORMIN') && egfr < 30) {
    return { level:'red', reasons:['Metformin requires eGFR ≥ 30 mL/min/1.73m²'], citeKeys:['ADA-S009-metformin'] }
  }
  if (selected.includes('SGLT2I') && context.includes('PeriOp')) {
    return { level:'red', reasons:['Hold SGLT2 inhibitor peri‑operatively; avoid initiation until post‑op'], citeKeys:['ADA-S016-Periop'] }
  }
  if (selected.includes('TZD') && flags.includes('HF')) {
    return { level:'red', reasons:['Avoid TZD in heart failure (fluid retention/exacerbation risk)'], citeKeys:['ADA-S009-TZD-HF'] }
  }

  // ---------- GREEN: positive reinforcements ----------
  if ((flags.includes('CKD') || flags.includes('HF')) && selected.includes('SGLT2I')) {
    reasons.push('Good: SGLT2 inhibitor provides HF/CKD protection')
    citeKeys.push('ADA-S009-SGLT2-CKDHF')
  }
  if (flags.includes('ASCVD') && selected.includes('GLP1RA')) {
    reasons.push('Good: GLP‑1 RA provides MACE benefit for ASCVD')
    citeKeys.push('ADA-S009-GLP1-ASCVD')
  }
  if (mode==='hospital' && (selected.includes('BASAL_ANALOG') || selected.includes('BASAL_NPH'))) {
    reasons.push('Good: inpatient regimen includes basal insulin')
    citeKeys.push('ADA-S016-BasalBolus')
  }
  if (reasons.length>0) return { level:'green', reasons, citeKeys }

  // ---------- AMBER: what to add (case goals) ----------
  if ((flags.includes('CKD') || flags.includes('HF')) && !selected.includes('SGLT2I')) {
    reasons.push('Add SGLT2 inhibitor for cardio‑renal protection')
    suggest.push('SGLT2I'); citeKeys.push('ADA-S009-SGLT2-CKDHF')
  }
  if (flags.includes('ASCVD') && !selected.includes('GLP1RA')) {
    reasons.push('Add GLP‑1 RA for ASCVD/MACE benefit')
    suggest.push('GLP1RA'); citeKeys.push('ADA-S009-GLP1-ASCVD')
  }
  if (mode==='hospital'
    && !selected.some(id => ['BASAL_ANALOG','BASAL_NPH','IV_INSULIN','BOLUS_ANALOG','REGULAR_INSULIN','PREMIXED_INSULIN'].includes(id))) {
    reasons.push('Use basal ± prandial insulin inpatient; avoid correction‑only')
    suggest.push('BASAL_ANALOG'); citeKeys.push('ADA-S016-BasalBolus')
  }

  // ---------- AMBER: medicine‑specific critiques for EACH selected class ----------
  // Helper returns a string (unique reason) + a citation key for that class in the current context
  const classAmber = (id: string): { msg: string; cite?: string } | null => {
    switch (id) {
      // Core or neutral options that may be suboptimal vs case goals
      case 'METFORMIN':
        if (flags.some(f=>['ASCVD','CKD','HF'].includes(f))) {
          return { msg: 'Metformin does not provide specific cardio‑renal or MACE benefit—add an organ‑protective agent', cite:'ADA-S009-metformin' }
        }
        return null

      case 'DPP4I':
        if (flags.includes('HF')) {
          return { msg: 'DPP‑4 inhibitors are CV‑neutral; avoid saxagliptin in HF; lacks HF benefit', cite:'ADA-S009-DPP4' }
        }
        return { msg: 'DPP‑4 inhibitors have modest A1c effect and are CV‑neutral—consider stronger/organ‑protective therapy', cite:'ADA-S009-DPP4' }

      case 'SULFONYLUREA':
        return { msg: 'Sulfonylureas increase hypoglycemia risk and may cause weight gain—use cautiously (esp. older/CKD)', cite:'ADA-S009-SU' }

      case 'MEGLITINIDE':
        return { msg: 'Meglitinides require multiple pre‑meal doses and may cause hypoglycemia—limited advantage vs alternatives', cite:'ADA-S009-meglitinide' }

      case 'TZD':
        return { msg: 'TZDs cause weight gain/edema and can worsen fluid status—avoid in HF and use caution otherwise', cite:'ADA-S009-TZD-HF' }

      case 'ALPHA_GLUCO_INHIB':
        return { msg: 'α‑Glucosidase inhibitors mainly blunt postprandial spikes; GI side effects common; modest A1c effect', cite:'ADA-S009-AGI' }

      case 'COLESEVELAM':
        return { msg: 'Colesevelam has modest A1c effect and can cause constipation or raise triglycerides—niche use', cite:'ADA-S009-colesevelam' }

      case 'BROMOQR':
        return { msg: 'Bromocriptine‑QR has modest glycemic effect; orthostasis and nausea can limit use', cite:'ADA-S009-bromocriptine' }

      case 'PRAMLINTIDE':
        return { msg: 'Pramlintide is adjunctive (mostly with insulin), causes nausea; risk of hypoglycemia if insulin not reduced', cite:'ADA-S009-pramlintide' }

      // Insulin‑specific nuance
      case 'BASAL_NPH':
        return { msg: 'NPH provides basal coverage but has higher nocturnal hypoglycemia vs long‑acting analogs', cite:'ADA-S009-insulin' }

      case 'PREMIXED_INSULIN':
        if (mode==='hospital') {
          return { msg: 'Premixed insulin is less flexible inpatient and linked to more hypoglycemia—basal ± prandial preferred', cite:'ADA-S016-insulin' }
        }
        return { msg: 'Premixed insulin reduces flexibility vs basal–bolus and increases hypoglycemia risk', cite:'ADA-S009-insulin' }

      case 'REGULAR_INSULIN':
        return { msg: 'Human regular insulin needs 30‑min pre‑meal timing and causes more delayed post‑meal hypoglycemia vs analogs', cite:'ADA-S009-insulin' }

      case 'BASAL_ANALOG':
      case 'BOLUS_ANALOG':
        return { msg: 'Insulin is effective but increases hypoglycemia risk and may cause weight gain—prefer organ‑protective agents first when feasible', cite:'ADA-S009-insulin' }

      // SGLT2/GLP‑1 contextual cautions (when selected but not ideal)
      case 'SGLT2I':
        if (egfr < 45) {
          return { msg: 'SGLT2 inhibitor: glycemic effect decreases as eGFR falls—keep for organ protection but do not rely only on glucose‑lowering', cite:'ADA-S009-SGLT2-CKDHF' }
        }
        return null

      case 'GLP1RA':
        if (context.includes('PeriOp')) {
          return { msg: 'GLP‑1 RA: peri‑anesthesia GI effects/delayed gastric emptying—individualize peri‑op plan', cite:'ADA-S016-GLP1-periop' }
        }
        return null

      case 'DUAL_GIP_GLP1':
        return { msg: 'Dual GIP/GLP‑1: very high weight‑loss and glycemic efficacy; consider GI effects and titration needs', cite:'ADA-S009-dual' }

      case 'IV_INSULIN':
        if (mode!=='hospital') {
          return { msg: 'IV insulin infusion is for hospital/ICU use; not appropriate outpatient', cite:'ADA-S016-IV' }
        }
        return null
    }
    return null
  }

  // build class‑specific feedback for each selected item
  const perClass: string[] = []
  for (const id of selected) {
    const fb = classAmber(id)
    if (fb?.msg) {
      perClass.push(`${labelFor(id, cards)} — ${fb.msg}`)
      if (fb.cite) citeKeys.push(fb.cite)
    }
  }

  if (reasons.length===0 && perClass.length===0) {
    // nothing to add → generic amber (rare)
    return { level:'amber', reasons:['Acceptable plan; add organ‑protective therapy if indicated.'], citeKeys }
  }

  // Compose final AMBER: case‑goal advice first, then per‑class critiques
  return { level:'amber', reasons:[...reasons, ...perClass], citeKeys, suggest, avoid }
}

// small helper to print the display label for a class id
function labelFor(id: string, cards: TherapyCardDef[]) {
  return cards.find(c=>c.id===id)?.label || id
}