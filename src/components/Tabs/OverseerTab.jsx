// src/components/Tabs/OverseerTab.jsx
import React from 'react';

export default function OverseerTab({
    gmSquadId,
    squadInput,
    setSquadInput,
    joinAsGm,
    leaveGm,
    renderCombatLog,
    encounter,
    bossNameInput,
    setBossNameInput,
    bossHpInput,
    setBossHpInput,
    spawnBoss,
    updateBossHp,
    clearBoss,
    squadRoster,
    getMaxVital
}) {
  return (
    <div className="p-4 space-y-4 animate-in fade-in z-10 relative">
        {!gmSquadId ? (
            <div className="border border-purple-900/50 p-6 bg-black/80 backdrop-blur-sm text-center shadow-[0_0_30px_rgba(168,85,247,0.1)] mt-10">
                <div className="text-[10px] text-purple-500 font-bold uppercase tracking-[0.3em] mb-6">Game Master Link</div>
                <input 
                    type="text" 
                    value={squadInput} 
                    onChange={e => setSquadInput(e.target.value)} 
                    placeholder="ENTER SQUAD CODE" 
                    className="w-full bg-purple-950/20 border-b-2 border-purple-600 p-4 text-2xl font-black uppercase text-center text-white focus:outline-none mb-6 tracking-widest placeholder:text-gray-700" 
                    maxLength={6} 
                />
                <button onClick={() => joinAsGm(squadInput)} className="w-full bg-purple-600 text-black py-4 font-bold uppercase hover:bg-white hover:text-purple-600 transition-colors">Assume Control</button>
            </div>
        ) : (
            <div className="space-y-6">
                
                {/* GM HEADER */}
                <div className="flex justify-between items-end border-b border-purple-500/50 pb-2">
                     <div>
                         <div className="text-[8px] text-purple-500 font-bold uppercase tracking-[0.3em] mb-1">Overseeing Network</div>
                         <div className="text-2xl font-black text-white tracking-[0.2em] leading-none drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]">{gmSquadId}</div>
                     </div>
                     <button onClick={leaveGm} className="border border-gray-600 text-gray-400 px-3 py-1 text-[9px] font-bold uppercase hover:bg-white hover:text-black transition-colors">Relinquish</button>
                </div>

                {/* GM NETWORK LOG */}
                {renderCombatLog()}

                {/* GM ENCOUNTER TRACKER (BOSS CONTROLS) */}
                <div className="border-2 border-red-900 bg-black p-4 relative shadow-[0_0_20px_rgba(220,38,38,0.2)]">
                    <div className="text-[8px] text-red-500 font-bold uppercase tracking-[0.3em] mb-4 border-b border-red-900/50 pb-2">Global Encounter Tracker</div>
                    
                    {!encounter ? (
                        <div className="space-y-2">
                            <input type="text" value={bossNameInput} onChange={e => setBossNameInput(e.target.value)} placeholder="THREAT CLASSIFICATION (e.g. Leviathan)" className="w-full bg-red-950/20 border border-red-900/50 p-2 text-xs text-white focus:outline-none uppercase" />
                            <input type="number" value={bossHpInput} onChange={e => setBossHpInput(e.target.value)} placeholder="MAX HEALTH (e.g. 500)" className="w-full bg-red-950/20 border border-red-900/50 p-2 text-xs text-white focus:outline-none uppercase" />
                            <button onClick={spawnBoss} className="w-full bg-red-600 text-white py-2 font-bold uppercase text-[10px] hover:bg-white hover:text-red-600 transition-colors mt-2">Initialize Threat</button>
                        </div>
                    ) : (
                        <div>
                            <div className="text-xl font-black text-white uppercase italic tracking-tighter mb-2">{encounter.name}</div>
                            <div className="h-4 w-full bg-black border border-red-900/50 relative overflow-hidden mb-2">
                                <div style={{width: `${(encounter.hp / encounter.maxHp) * 100}%`}} className="h-full bg-red-600 transition-all duration-500"></div>
                            </div>
                            <div className="flex justify-between items-center mb-4">
                                <div className="text-[12px] font-black text-red-500">{encounter.hp} <span className="text-red-900 text-[10px]">/ {encounter.maxHp} HP</span></div>
                                <div className="flex gap-1">
                                    <button onClick={() => updateBossHp(-10)} className="bg-red-900/30 text-red-400 border border-red-900/50 px-2 py-1 text-[9px] hover:bg-red-600 hover:text-white">-10</button>
                                    <button onClick={() => updateBossHp(-1)} className="bg-red-900/30 text-red-400 border border-red-900/50 px-2 py-1 text-[9px] hover:bg-red-600 hover:text-white">-1</button>
                                    <button onClick={() => updateBossHp(1)} className="bg-red-900/30 text-red-400 border border-red-900/50 px-2 py-1 text-[9px] hover:bg-red-600 hover:text-white">+1</button>
                                    <button onClick={() => updateBossHp(10)} className="bg-red-900/30 text-red-400 border border-red-900/50 px-2 py-1 text-[9px] hover:bg-red-600 hover:text-white">+10</button>
                                </div>
                            </div>
                            <button onClick={clearBoss} className="w-full border border-red-900 text-red-600 py-2 font-bold uppercase text-[9px] hover:bg-red-600 hover:text-white transition-colors">Terminate Threat</button>
                        </div>
                    )}
                </div>

                {/* GM SQUAD GRID */}
                <div>
                    <div className="text-[8px] text-gray-500 font-bold uppercase tracking-[0.3em] mb-2">Active Operatives</div>
                    <div className="grid grid-cols-2 gap-2">
                        {squadRoster.map(mate => (
                            <div key={mate.id} className="bg-black/60 border border-white/10 p-2 relative overflow-hidden">
                                {(mate.statuses || []).includes('BLEEDING') && <div className="pointer-events-none absolute inset-0 z-0 border-2 border-red-900/60"></div>}
                                
                                <div className="text-[10px] font-black uppercase text-white truncate mb-1 relative z-10">{mate.name}</div>
                                
                                <div className="space-y-1 relative z-10 border-b border-white/10 pb-1 mb-1">
                                    {['life', 'sanity', 'aura'].map(v => {
                                        const mMax = getMaxVital(v, mate);
                                        const mCur = mate.currentVitals?.[v] ?? mMax;
                                        return (
                                            <div key={v} className="flex justify-between items-center text-[8px]">
                                                <span className="text-gray-500 uppercase">{v.substring(0,3)}</span>
                                                <span className={`font-bold ${v === 'life' ? 'text-green-500' : v === 'sanity' ? 'text-blue-500' : 'text-purple-500'}`}>{mCur}/{mMax}</span>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="flex justify-between text-[8px] text-gray-400 relative z-10">
                                    <span>STIM: <span className="text-blue-400 font-bold">{mate.consumables?.stims || 0}</span></span>
                                    <span>ORD: <span className="text-orange-400 font-bold">{mate.consumables?.grenades || 0}</span></span>
                                </div>
                            </div>
                        ))}
                        {squadRoster.length === 0 && <div className="col-span-2 text-center text-[9px] text-gray-600 py-4 border border-dashed border-white/10">NO OPERATIVES DETECTED</div>}
                    </div>
                </div>

            </div>
        )}
    </div>
  );
}