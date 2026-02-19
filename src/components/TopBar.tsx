import React from 'react'
import { useGame } from '../state/gameStore'

export default function TopBar(){
  const { score, mode, setMode } = useGame()
  return (
    <div className="topbar container">
      <div style={{display:'flex', gap:8, alignItems:'center'}}>
        <strong>ContinuumCare</strong> {mode ? `— ${mode}` : ''}
        {mode && (
          <button className="btn secondary" onClick={()=>setMode(null)}>
            Go to Main Screen
          </button>
        )}
      </div>
      <div>⭐ Score: {score}</div>
    </div>
  )
}