// src/components/Tabs/CreatorTab.jsx
import React from 'react';
import { FORMS, DESTINIES } from '../../data/reference';

export default function CreatorTab({ 
    step, 
    setStep, 
    character, 
    setCharacter, 
    saveCharacter, 
    rollD20 
}) {
  return (
    <div className="p-6 animate-in fade-in duration-300 z-10 relative">
       {step === 1 && (
         <div className="space-y-6">
           <h2 className="text-3xl font-black uppercase">Initialize Unit</h2>
           <div>
               <div className="text-[10px] text-cyan-500 font-bold uppercase tracking-widest mb-1">Unit Designation</div>
               <input 
                  type="text" 
                  value={character.name === "UNIT_UNNAMED" ? "" : character.name} 
                  placeholder="ENTER_NAME" 
                  className="w-full bg-white/5 border-b-2 border-cyan-600 p-4 text-xl font-bold uppercase focus:outline-none mb-4" 
                  onChange={(e) => setCharacter({...character, name: e.target.value.toUpperCase()})} 
               />
               <div className="text-[10px] text-cyan-500 font-bold uppercase tracking-widest mb-1">Visual ID (Image URL) [Optional]</div>
               <input 
                  type="text" 
                  value={character.avatarUrl || ""} 
                  placeholder="https://..." 
                  className="w-full bg-white/5 border-b-2 border-cyan-600 p-3 text-sm focus:outline-none text-gray-300" 
                  onChange={(e) => setCharacter({...character, avatarUrl: e.target.value})} 
               />
           </div>
           {character.avatarUrl && (
               <div className="flex justify-center mt-4">
                   <div className="h-24 w-24 border border-cyan-500/50 bg-black/50 overflow-hidden shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                       <img src={character.avatarUrl} alt="Preview" className="h-full w-full object-cover" />
                   </div>
               </div>
           )}
           <button onClick={() => setStep(2)} className="w-full bg-cyan-600 hover:bg-cyan-500 py-4 font-bold uppercase text-black transition-colors mt-8">Next Phase</button>
         </div>
      )}

      {step === 2 && (
        <div className="space-y-3">
          <h2 className="text-xl font-black text-red-600 uppercase">Select Form</h2>
          {FORMS.map(form => (
            <button 
                key={form.id} 
                onClick={() => setCharacter({...character, form: form})} 
                className={`w-full text-left p-4 border transition-all ${character.form?.id === form.id ? 'bg-white text-black border-white' : 'border-white/10 text-gray-500'}`}
            >
              <div className="font-bold uppercase text-sm mb-2">{form.name}</div>
              <div className="text-[11px] opacity-90 leading-relaxed whitespace-pre-wrap">{form.description}</div>
            </button>
          ))}
          <button disabled={!character.form} onClick={() => setStep(3)} className="w-full bg-red-600 py-4 font-bold uppercase mt-4">Confirm</button>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-2">
          <h2 className="text-xl font-black text-red-600 uppercase mb-4">Select Destiny</h2>
          <div className="grid grid-cols-1 gap-2">
            {DESTINIES.map(destiny => (
              <button 
                  key={destiny.id} 
                  onClick={() => setCharacter({...character, destiny: destiny})} 
                  className={`text-left p-4 border flex flex-col justify-center ${character.destiny?.id === destiny.id ? 'bg-red-600 text-white border-red-600' : 'border-white/10 text-gray-500'}`}
              >
                <span className="font-bold uppercase text-sm">{destiny.name}</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {destiny.bonuses && Object.entries(destiny.bonuses).map(([key, val]) => ( 
                      <span key={key} className="text-[9px] bg-black/20 px-1 rounded uppercase">{key}+{val}</span> 
                  ))}
                </div>
              </button>
            ))}
          </div>
          <button disabled={!character.destiny} onClick={() => setStep(4)} className="w-full bg-red-600 py-4 font-bold uppercase mt-4">Confirm</button>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-6">
          <h2 className="text-xl font-black text-red-600 uppercase">Finalize Lore</h2>
          <button 
              onClick={() => { 
                  const roll = rollD20(); 
                  const result = character.form.tables.master.find(m => roll >= m.min && roll <= m.max); 
                  setCharacter({...character, master: result?.label}); 
              }} 
              className="w-full border border-purple-500 p-4 uppercase font-bold text-purple-400"
          > 
              {character.master ? character.master : "Roll Master Connection"} 
          </button>
          
          <div className="space-y-2">
              <div className="text-xs font-bold text-gray-500 uppercase">Select Dark Mark</div>
              {character.form?.darkMarks.map((mark, i) => (
                  <button 
                      key={i} 
                      onClick={() => setCharacter({...character, darkMark: mark})} 
                      className={`w-full text-left p-3 border ${character.darkMark?.name === mark.name ? 'border-blue-500 bg-blue-900/20' : 'border-white/10'}`}
                  >
                      <div className="text-[10px] font-bold text-blue-400 uppercase">{mark.name}</div>
                      <div className="text-[10px] text-gray-400">{mark.description}</div>
                  </button>
              ))}
          </div>
          <button onClick={saveCharacter} className="w-full bg-green-600 py-4 font-bold uppercase mt-8 text-black">Sync to Database</button>
        </div>
      )}
    </div>
  );
}