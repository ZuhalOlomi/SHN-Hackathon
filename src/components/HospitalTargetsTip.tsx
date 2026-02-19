import React from 'react'

export default function HospitalTargetsTip({onClose}:{onClose:()=>void}){
  return (
    <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.35)', display:'flex', alignItems:'center', justifyContent:'center', padding:16}}>
      <div className="card" style={{maxWidth:640, width:'100%', background:'#fff'}}>
        <h3>Inpatient glycemic targets (quick tip)</h3>
        <ul style={{marginTop:8}}>
          <li><strong>Non‑ICU:</strong> 100–180 mg/dL if achievable safely.</li>
          <li><strong>ICU:</strong> 140–180 mg/dL for most critically ill.</li>
        </ul>
        <div style={{fontSize:13, margin:'8px 0 12px 0'}}>See ADA 2026 Hospital Standards (S016) for details.</div>
        <div style={{textAlign:'right'}}><button className="btn" onClick={onClose}>Got it</button></div>
      </div>
    </div>
  )
}