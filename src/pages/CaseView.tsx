
import React from 'react'
import PatientPanel from '../components/PatientPanel'
import FooterBar from '../components/FooterBar'
import Debrief from '../components/Debrief'
import { useGame } from '../state/gameStore'
import { evaluatePlan } from '../lib/rulesEngine'
import CitationModal from '../components/CitationModal'
import HospitalTargetsTip from '../components/HospitalTargetsTip'
import Toast from '../components/Toast'
import SessionComplete from '../components/SessionComplete'

export default function CaseView(){
  const { mode, cases, cards, rules, addScore, reason, setReason, setMode, recordOutcome } = useGame()
  const modeCases = React.useMemo(() => cases.filter(c => c.mode === mode), [cases, mode])
  const [idx, setIdx] = React.useState(0)
  const [selected, setSelected] = React.useState<string[]>([])
  const [result, setResult] = React.useState<null|{level:'green'|'amber'|'red'; reasons:string[]; citeKeys:string[]; suggest?:string[]; avoid?:string[] }>(null)
  const [showCites, setShowCites] = React.useState(false)
  const [showHospTip, setShowHospTip] = React.useState(false)
  const [toast, setToast] = React.useState<string>('')
  const [showSummary, setShowSummary] = React.useState(false)

  React.useEffect(()=>{ if (mode === 'hospital' && !localStorage.getItem('cc_hosp_tip_seen')) setShowHospTip(true) },[mode])

  const kase = modeCases[idx]
  const visibleCards = cards

  function toggle(id: string) { setSelected(prev => prev.includes(id) ? prev.filter(x=>x!==id) : [...prev, id]) }

  async function commit(){
    if (!kase || !rules) return
    if (selected.length === 0) { setToast('Select at least one treatment card before committing.'); return }
    const r = evaluatePlan(kase, selected, cards, rules)
    setResult(r)
    recordOutcome(r.level)
    if (r.level==='green') addScore(4); else if (r.level==='amber') addScore(1); else addScore(-2)
    if ((reason||'').trim().length >= 8) addScore(1)
    try { await fetch('/api/v1/play', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ mode, caseId: kase.id, selected, reason, result: r }) }) } catch {}
  }

  function next(){
    // if last case, show summary modal
    const last = idx >= modeCases.length - 1
    if (last) { setShowSummary(true); return }
    setSelected([]); setResult(null); setShowCites(false); setReason(''); setIdx(i => i + 1)
  }

  if (!kase) return <div className="container">No cases for this mode.</div>

  return (
    <div className="container">
      <div className="topbar" style={{padding:0, marginBottom:8}}>
        <div><strong>{mode?.toUpperCase()}</strong> — Case {idx+1}/{modeCases.length}</div>
      </div>

      <div className="grid">
        <PatientPanel p={kase.patient} />
        <div className="card">
          <h3>Plan</h3>
          <div className="therapy">
            {visibleCards.map(c =>
              <button key={c.id} className={selected.includes(c.id)?'selected':''} title={(c.tags||[]).join(', ')} onClick={()=>toggle(c.id)}>{c.label}</button>
            )}
          </div>
          <div style={{marginTop:8}}>
            <label><strong>Reason (optional)</strong></label>
            <textarea placeholder="Because …" rows={2} style={{width:'100%', marginTop:6}} value={reason} onChange={e=>setReason(e.target.value)} />
          </div>
        </div>
      </div>

      
{result && (
  <Debrief
    level={result.level}
    reasons={result.reasons}
    onView={() => setShowCites(true)}
    suggest={result.suggest}
    avoid={result.avoid}
  />
)}


      <FooterBar>
        <div />
        <div style={{display:'flex', gap:8}}>
          <button className="btn secondary" onClick={()=>{setSelected([]); setResult(null)}}>Clear</button>
          {!result && <button className="btn" onClick={commit}>Commit Plan</button>}
          {result && <button className="btn" onClick={next}>{idx >= modeCases.length - 1 ? 'Finish' : 'Next Case'}</button>}
        </div>
      </FooterBar>

      {result && showCites && <CitationModal keys={result.citeKeys} onClose={()=>setShowCites(false)} />}
      {showHospTip && <HospitalTargetsTip onClose={()=>{ localStorage.setItem('cc_hosp_tip_seen','1'); setShowHospTip(false) }} />}
      {toast && <Toast message={toast} onClose={()=>setToast('')} />}
      {showSummary && <SessionComplete onHome={()=>{ setMode(null) }} />}
    </div>
  )
}
