import React from 'react'
import { useGame } from '../state/gameStore'

export default function CitationModal({keys, onClose}:{keys:string[]; onClose:()=>void}){
  const { citations } = useGame()
  const items = (keys||[]).map(k => ({ key:k, item: citations?.[k]})).filter(x=>!!x.item)
  return (
    <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.35)', display:'flex', alignItems:'center', justifyContent:'center', padding:16}}>
      <div className="card" style={{maxWidth:640, width:'100%', background:'#fff'}}>
        <h3>Guideline sources</h3>
        {items.length===0 && <div>No sources</div>}
        {items.map(({key,item})=>(
          <div key={key} style={{marginBottom:12}}>
            <div><strong>{item!.title}</strong></div>
            <div style={{margin:'6px 0'}}>{item!.summary}</div>
            <div><a href={item!.link} target="_blank" rel="noreferrer">{item!.source}</a></div>
          </div>
        ))}
        <div style={{marginTop:12, textAlign:'right'}}>
          <button className="btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  )
}