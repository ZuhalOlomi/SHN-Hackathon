
import React from 'react'
import { useGame } from '../state/gameStore'
export default function SessionComplete({onHome}:{onHome:()=>void}){
  const { session, score } = useGame()
  return (
    <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.35)', display:'flex', alignItems:'center', justifyContent:'center', padding:16}}>
      <div className="card" style={{maxWidth:560, width:'100%', background:'#fff'}}>
        <h3>Session complete</h3>
        <div style={{marginTop:8}}>Mode: <strong>{session.mode?.toUpperCase()}</strong></div>
        <div style={{marginTop:6}}>Cases played: <strong>{session.total}</strong></div>
        <div style={{marginTop:6}}>Outcomes → ✅ Green: <strong>{session.green}</strong>  • ⚠️ Amber: <strong>{session.amber}</strong>  • ⛔ Red: <strong>{session.red}</strong></div>
        <div style={{marginTop:10}}>Score: <strong>{score}</strong></div>
        <div style={{marginTop:12,fontSize:13}}>Tip: Review the guideline links shown during debrief—focus on organ protection and inpatient safety rules.</div>
        <div style={{textAlign:'right',marginTop:16}}>
          <button className="btn" onClick={onHome}>Return to Home</button>
        </div>
      </div>
    </div>
  )
}
