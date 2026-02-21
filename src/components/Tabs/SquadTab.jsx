// src/components/Tabs/SquadTab.jsx
import React from 'react';

export default function SquadTab({
       claimGroundLoot,
    character,
    squadInput,
    setSquadInput,
    joinSquad,
    leaveSquad,
    encounter,
    squadRoster,
    getMaxVital,
    renderCombatLog
}) {
  return (
    <div className="p-4 space-y-4 animate-in fade-in z-10 relative">
      {!character.id ? (
          <div className="text-center py-20 opacity-50 border border-dashed border-white/20 p-8">
              <div className="text-4xl mb-4">⚠</div>
              <div className="text-sm font-bold uppercase tracking-widest text-white">No Unit Deployed</div>
              <div className="text-[10px] text-gray-400 mt-2">Deploy a unit from the Barracks to access the Squad Network.</div>
          </div>
      ) : !character.squadId ? (
          <div className="border border-cyan-900/50 p-6 bg-black/80 backdrop-blur-sm text-center shadow-[0_0_30px_rgba(6,182,212,0.1)]">
             <div className="text-[10px] text-cyan-500 font-bold uppercase tracking-[0.3em] mb-6">Neural Link Offline</div>
             <input 
                 type="text" 
                 value={squadInput} 
                 onChange={e => setSquadInput(e.target.value)} 
                 placeholder="ENTER SQUAD CODE" 
                 className="w-full bg-cyan-950/20 border-b-2 border-cyan-600 p-4 text-2xl font-black uppercase text-center text-white focus:outline-none mb-4 tracking-widest placeholder:text-gray-700" 
                 maxLength={6} 
             />
             <button onClick={() => joinSquad(squadInput)} className="w-full bg-cyan-600 text-black py-4 font-bold uppercase hover:bg-white hover:text-cyan-600 transition-colors mb-6">Establish Link</button>
             <div className="text-[8px] text-gray-500 uppercase tracking-widest mb-4">- OR -</div>
             <button onClick={() => joinSquad(Math.random().toString(36).substring(2, 6).toUpperCase())} className="w-full border border-cyan-900 text-cyan-500 py-3 text-[10px] font-bold uppercase hover:bg-cyan-900/20 transition-colors">Generate Secure Code</button>
          </div>
      ) : (
          <div className="space-y-4">
              <div className="flex justify-between items-end border-b border-cyan-500/50 pb-2 mb-4">
                  <div>
                      <div className="text-[8px] text-cyan-500 font-bold uppercase tracking-[0.3em] mb-1">Active Network Link</div>
                      <div className="text-3xl font-black text-white tracking-[0.2em] leading-none drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]">{character.squadId}</div>
                  </div>
                  <button onClick={leaveSquad} className="border border-red-900/50 bg-red-900/20 text-red-500 px-3 py-1 text-[9px] font-bold uppercase hover:bg-red-600 hover:text-white transition-colors">Sever Link</button>
              </div>

              {/* NETWORK ACTIVITY LOG */}
              {renderCombatLog()}

              {/* PLAYER VIEW: SHARED ENCOUNTER TRACKER */}
              {encounter && (
                 <div className="border border-red-900 bg-red-950/20 p-4 mb-6 shadow-[0_0_20px_rgba(220,38,38,0.2)] animate-pulse">
                     <div className="text-[8px] text-red-500 font-bold uppercase tracking-[0.3em] mb-2">Hostile Threat Detected</div>
                     <div className="text-2xl font-black text-white uppercase italic tracking-tighter mb-2">{encounter.name}</div>
                     <div className="h-4 w-full bg-black border border-red-900/50 relative overflow-hidden">
                         <div style={{width: `${(encounter.hp / encounter.maxHp) * 100}%`}} className="h-full bg-red-600 transition-all duration-500"></div>
                     </div>
                     <div className="text-right text-[10px] font-black text-red-400 mt-1">{encounter.hp} / {encounter.maxHp} HP</div>
                 </div>
              )}
{/* PLAYER VIEW: THE LOOT PILE (FIRST COME, FIRST SERVE) */}
        {encounter?.isDefeated && encounter.groundLoot?.length > 0 && (
            <div className="border-2 border-yellow-500 bg-yellow-900/20 p-4 mb-6 shadow-[0_0_30px_rgba(234,179,8,0.2)] animate-pulse">
                <div className="text-[10px] text-yellow-500 font-bold uppercase tracking-[0.3em] mb-3 border-b border-yellow-500/50 pb-2">
                    ⚠️ ASSETS DETECTED IN SECTOR ⚠️
                </div>
                <div className="space-y-2">
                    {encounter.groundLoot.map((item, index) => (
                        <div key={index} className="flex justify-between items-center bg-black/80 border border-yellow-900/50 p-2">
                            <span className="text-xs font-black uppercase text-yellow-400 drop-shadow-md">{item}</span>
                            <button 
                                onClick={() => claimGroundLoot(item, index)} 
                                className="bg-yellow-600 text-black px-4 py-2 text-[10px] font-black uppercase hover:bg-white transition-colors tracking-widest"
                            >
                                Claim
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        )}
              
              <div className="space-y-3">
                  {squadRoster.map(mate => (
                      <div key={mate.id} className={`border p-3 flex flex-col gap-3 relative overflow-hidden transition-all ${mate.id === character.id ? 'border-cyan-500/50 bg-cyan-950/10' : 'border-white/10 bg-black/60'}`}>
                          {(mate.statuses || []).includes('BLEEDING') && <div className="pointer-events-none absolute inset-0 z-0 border-2 border-red-900/60"></div>}
                          {(mate.statuses || []).includes('BURNING') && <div className="pointer-events-none absolute inset-0 z-0 shadow-[inset_0_0_30px_rgba(234,88,12,0.2)]"></div>}

                          <div className="flex justify-between items-start relative z-10">
                              <div className="flex items-center gap-3">
                                  <div className="h-10 w-10 bg-gray-900 border border-white/20 overflow-hidden shrink-0 shadow-md">
                                      {mate.avatarUrl ? <img src={mate.avatarUrl} alt="Avatar" className="h-full w-full object-cover" /> : <div className="h-full w-full flex items-center justify-center text-[8px] text-gray-600 font-bold uppercase">NO ID</div>}
                                  </div>
                                  <div>
                                      <div className="text-lg font-black italic uppercase leading-none text-white">{mate.name} {mate.id === character.id && <span className="text-[8px] text-cyan-500 font-normal not-italic ml-2 tracking-widest">(YOU)</span>}</div>
                                      <div className="text-[9px] text-gray-400 uppercase mt-1 tracking-widest">RK {mate.rank} • {mate.form?.name || 'UNKNOWN'}</div>
                                  </div>
                              </div>
                              <div className="flex gap-1">
                                  {(mate.statuses || []).map(s => (
                                     <div key={s} className={`h-2 w-2 rounded-full shadow-[0_0_5px_currentColor] ${s === 'BURNING' ? 'bg-orange-500 text-orange-500' : s === 'BLEEDING' ? 'bg-red-600 text-red-600' : s === 'POISONED' ? 'bg-green-500 text-green-500' : s === 'STUNNED' ? 'bg-yellow-500 text-yellow-500' : 'bg-purple-500 text-purple-500'}`}></div>
                                  ))}
                              </div>
                          </div>

                          <div className="space-y-1 relative z-10 border-t border-white/10 pt-2">
                              {['life', 'sanity', 'aura'].map(v => {
                                  const mMax = getMaxVital(v, mate);
                                  const mCur = mate.currentVitals?.[v] ?? mMax;
                                  const mPct = (mCur / mMax) * 100;
                                  return (
                                      <div key={v} className="flex items-center gap-2">
                                         <div className="w-8 text-[8px] font-bold text-gray-600 uppercase text-right tracking-widest">{v.substring(0,3)}</div>
                                         <div className="flex-1 h-1.5 bg-gray-900 relative overflow-hidden">
                                             <div style={{width: `${mPct}%`}} className={`h-full transition-all duration-300 ${v === 'life' ? 'bg-green-600' : v === 'sanity' ? 'bg-blue-600' : 'bg-purple-600'}`}></div>
                                         </div>
                                         <div className={`w-8 text-[9px] font-black text-right ${v === 'life' ? 'text-green-500' : v === 'sanity' ? 'text-blue-500' : 'text-purple-500'}`}>{mCur}</div>
                                      </div>
                                  );
                              })}
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      )}
    </div>
  );
}
