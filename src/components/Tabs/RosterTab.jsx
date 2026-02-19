// src/components/Tabs/RosterTab.jsx
import React from 'react';

export default function RosterTab({ roster, loadCharacter, deleteCharacter }) {
  return (
    <div className="p-4 space-y-4 animate-in fade-in z-10 relative">
      <div className="text-xs font-bold text-gray-500 uppercase tracking-widest border-b border-white/10 pb-2">
          Deployable Units
      </div>
      
      {roster.length === 0 ? (
        <div className="text-center py-10 opacity-50">
            <div className="text-4xl mb-2">∅</div>
            <div>No Units Found</div>
        </div>
      ) : (
        roster.map(char => (
          <div key={char.id} className="w-full bg-white/5 border border-white/10 p-4 flex justify-between items-center group relative overflow-hidden">
             <button onClick={() => loadCharacter(char)} className="flex-1 text-left z-10 flex items-center gap-3">
                <div className="h-10 w-10 bg-gray-800 border border-white/20 overflow-hidden shrink-0">
                    {char.avatarUrl ? <img src={char.avatarUrl} alt="avatar" className="h-full w-full object-cover" /> : <div className="h-full w-full flex items-center justify-center text-[8px] text-gray-600 font-bold uppercase">NO ID</div>}
                </div>
                <div>
                    <div className="flex items-center gap-2">
                        <div className="text-lg font-black italic uppercase group-hover:text-red-500 transition-colors">{char.name}</div>
                        <div className="bg-yellow-600/20 border border-yellow-600/50 text-yellow-500 text-[9px] px-1 font-bold">RK {char.rank || 1}</div>
                    </div>
                    <div className="text-[10px] text-gray-400 uppercase">{char.form?.name || 'UNKNOWN FORM'} • {char.destiny?.name || 'UNKNOWN DESTINY'}</div>
                </div>
             </button>
             <div className="flex flex-col items-end gap-2 z-20 pl-4 border-l border-white/10 ml-4">
                <div className="text-[8px] text-gray-500 uppercase">STATUS: <span className="text-green-500 font-bold">READY</span></div>
                <button onClick={(e) => { e.stopPropagation(); deleteCharacter(char.id, char.name); }} className="text-[8px] text-red-600 border border-red-900/50 px-2 py-1 hover:bg-red-600 hover:text-white transition-colors uppercase">Discharge</button>
             </div>
          </div>
        ))
      )}

      {/* --- OVERSEER TIP JAR --- */}
      <div className="mt-8 border border-white/10 bg-black/50 p-4 relative overflow-hidden">
          <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-3 border-b border-white/10 pb-1 text-center">Support Network Command</div>
          <div className="flex gap-2 relative z-10">
              <a href="https://ko-fi.com/YOUR_LINK" target="_blank" rel="noreferrer" className="flex-1 bg-red-900/20 border border-red-900/50 hover:bg-red-600 hover:text-white text-red-500 p-3 text-center transition-colors group">
                  <div className="text-[8px] uppercase tracking-widest mb-1 text-gray-400 group-hover:text-red-200 transition-colors">Fuel the Architect</div>
                  <div className="text-xs font-bold uppercase">Send Brian a Coffee</div>
              </a>
              <a href="https://ko-fi.com/RJS_LINK" target="_blank" rel="noreferrer" className="flex-1 bg-purple-900/20 border border-purple-900/50 hover:bg-purple-600 hover:text-white text-purple-500 p-3 text-center transition-colors group">
                  <div className="text-[8px] uppercase tracking-widest mb-1 text-gray-400 group-hover:text-purple-200 transition-colors">Bribe the Co-GM</div>
                  <div className="text-xs font-bold uppercase">Buy RJ a Drink</div>
              </a>
          </div>
      </div>
    </div>
  );
}