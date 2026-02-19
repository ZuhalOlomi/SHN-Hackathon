import React from 'react'
import type { Patient } from '../types'

export default function PatientPanel({p}:{p:Patient}){
  return (
    <div className="card">
      <h3>Patient</h3>

      {/* Clinical flags like ASCVD / CKD / HF / PeriOp */}
      <div className="chips">
        {(p.flags || []).map((f: string) => (
          <span key={f} className="chip">{f}</span>
        ))}
      </div>

      <div style={{marginTop:8}}>
        <div><strong>Age/Sex:</strong> {p.age} / {p.sex}</div>
        {p.vitals?.bp && <div><strong>BP:</strong> {p.vitals.bp}</div>}
        {typeof p.labs?.a1c === 'number' && <div><strong>A1c:</strong> {p.labs!.a1c}%</div>}
        {typeof p.labs?.egfr === 'number' && <div><strong>eGFR:</strong> {p.labs!.egfr} mL/min/1.73m²</div>}
      </div>

      {(p.allergies && p.allergies.length > 0) && (
        <div style={{marginTop:8}}>
          <strong>Allergies:</strong>
          <div className="chips">
            {p.allergies.map((a: string) => <span key={a} className="chip">{a}</span>)}
          </div>
        </div>
      )}

      {(p.meds && p.meds.length > 0) && (
        <div style={{marginTop:8}}>
          <strong>Current meds:</strong>
          <div className="chips">
            {p.meds.map((m: string) => <span key={m} className="chip">{m}</span>)}
          </div>
        </div>
      )}

      {p.notes && <div style={{marginTop:8}}><em>{p.notes}</em></div>}
    </div>
  )
}
