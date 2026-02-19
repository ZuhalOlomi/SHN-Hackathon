
import React from 'react'
import type { TherapyCardDef } from '../types'
import { useGame } from '../state/gameStore'

export default function TherapyCard({card}:{card:TherapyCardDef}){
  const { selectCard, selected } = useGame()
  const isSel = selected.includes(card.id)
  return (
    <button className={"" + (isSel? 'selected':'')} onClick={()=>selectCard(card.id)} title={(card.tags||[]).join(', ')}>
      {card.label}
    </button>
  )
}
