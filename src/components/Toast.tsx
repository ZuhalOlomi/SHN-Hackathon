
import React from 'react'
export default function Toast({message,onClose}:{message:string;onClose:()=>void}){
  return (
    <div style={{position:'fixed',bottom:24,left:0,right:0,display:'flex',justifyContent:'center',pointerEvents:'none'}}>
      <div style={{background:'#C53030',color:'#fff',padding:'10px 14px',borderRadius:8,boxShadow:'0 6px 18px rgba(0,0,0,.2)',pointerEvents:'auto'}}>
        <div style={{display:'flex',gap:12,alignItems:'center'}}>
          <span>⚠️</span>
          <span style={{fontWeight:600}}>{message}</span>
          <button style={{marginLeft:8,background:'transparent',border:'none',color:'#fff',cursor:'pointer',fontWeight:600}} onClick={onClose}>OK</button>
        </div>
      </div>
    </div>
  )
}
