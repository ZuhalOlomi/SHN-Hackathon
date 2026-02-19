
import React from 'react'
import { useGame } from '../state/gameStore'
import type { Mode } from '../types'

export default function Home({onStart}:{onStart:(m:Mode)=>void}){
  const modes: Mode[] = ['clinic','hospital','challenge']
  const { setMode } = useGame()
  function start(m:Mode){ setMode(m); onStart(m) }
  return (
    <div className="container">
      <h1>ContinuumCare</h1>
      <p>Read a case → pick therapy cards → commit → get instant feedback.</p>
      <div style={{display:'flex', gap:12, flexWrap:'wrap'}}>
        {modes.map(m=> <button key={m} className="btn" onClick={()=>start(m)}>{m.title()}</button>)}
      </div>
    </div>
  )
}

declare global { interface String { title(): string } }
// helper to Title Case
if(!String.prototype.title){
  // @ts-ignore
  String.prototype.title = function(){ return this.charAt(0).toUpperCase()+this.slice(1) }
}
