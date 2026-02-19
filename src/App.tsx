import React, { useEffect, useState } from 'react'
import './styles.css'
import TopBar from './components/TopBar'
import Home from './pages/Home'
import CaseView from './pages/CaseView'
import { useGame } from './state/gameStore'
import { loadCases, loadCards, loadRules, loadDebrief, loadCitations } from './lib/fetchData'

export default function App(){
  const { mode, setData } = useGame()
  const [ready, setReady] = useState(false)

  useEffect(()=>{ (async ()=>{
    const [cases, cards, rules, debrief, citations] = await Promise.all([
      loadCases(), loadCards(), loadRules(), loadDebrief(), loadCitations()
    ])
    setData(cases, cards, rules, debrief, citations)
    setReady(true)
  })() },[])

  if (!ready) return <div className="container">Loading…</div>

  return (
    <>
      <TopBar />
      {!mode ? <Home onStart={()=>{}} /> : <CaseView />}
    </>
  )
}