import React from 'react'

export default function Debrief({
  level, reasons, onView, suggest = [], avoid = []
}:{ level:'green'|'amber'|'red'; reasons:string[]; onView?:()=>void; suggest?:string[]; avoid?:string[] }){

  const cls = level==='green'? 'banner green': level==='red'? 'banner red':'banner amber'
  const title = level==='green'? 'Optimal' : level==='red'? 'Blocked' : 'Action needed'

  return (
    <div className={cls}>
      <strong>{title}:</strong> {reasons[0]}
      {reasons.slice(1).map((r,i)=>(<div key={i}>• {r}</div>))}
      {suggest.length>0 && <div style={{marginTop:6}}><em>Try adding:</em> {suggest.join(', ')}</div>}
      {avoid.length>0 && <div style={{marginTop:4}}><em>Avoid:</em> {avoid.join(', ')}</div>}
      {onView && <div style={{marginTop:8}}><button className="btn secondary" onClick={onView}>View guideline</button></div>}
    </div>
  )
}