import React from 'react';
import { FORMS, DESTINIES } from '../../data/reference';

export default function Modals({
    grenadeResult, setGrenadeResult,
    rollResult, setRollResult,
    viewData, setViewData, character,
    viewPromotion, setViewPromotion, promoteUnit
}) {
  return (
    <>
      {/* DETONATION PROTOCOL MODAL */}
      {grenadeResult && (
        <div className="fixed inset-0 z-[100] bg-red-950/90 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-100" onClick={() => setGrenadeResult(null)}>
           <div className="w-full max-w-sm border-4 border-red-600 bg-black p-8 text-center shadow-[0_0_80px_rgba(220,38,38,0.6)]" onClick={e => e.stopPropagation()}>
              <div className="text-[12px] font-bold uppercase tracking-[0.4em] mb-6 text-red-500 animate-pulse">Detonation Protocol</div>
              <div className="mb-6 border-b border-red-900/50 pb-4"><div className="text-3xl font-black text-white uppercase italic">{grenadeResult.tier.name}</div><div className="text-orange-400 text-[10px] uppercase font-bold tracking-widest mt-1">Area: {grenadeResult.tier.area}</div></div>
              <div className="flex justify-center gap-4 mb-6"><div className="bg-red-900/20 border border-red-900 p-2 w-1/2"><div className="text-[9px] text-gray-500 uppercase tracking-widest">Damage</div><div className="text-2xl font-black text-red-500">{grenadeResult.tier.dmg}</div></div><div className="bg-orange-900/20 border border-orange-900 p-2 w-1/2"><div className="text-[9px] text-gray-500 uppercase tracking-widest">Duration</div><div className="text-2xl font-black text-orange-500">{grenadeResult.tier.dur}</div></div></div>
              <div className="bg-white/5 p-4 border border-white/10 text-left"><div className="text-yellow-500 font-bold uppercase text-[10px] mb-1 tracking-widest">Payload: {grenadeResult.juice.type}</div><div className="text-sm text-white italic leading-relaxed">"{grenadeResult.juice.desc}"</div><div className="text-[9px] text-gray-400 mt-2 border-t border-white/10 pt-2">{grenadeResult.tier.effect}</div></div>
              <button onClick={() => setGrenadeResult(null)} className="mt-8 w-full border border-red-600 text-red-500 py-3 uppercase text-xs font-bold hover:bg-red-600 hover:text-white transition-colors">Clear Blast Zone</button>
           </div>
        </div>
      )}

      {/* ROLL RESULT MODAL */}
      {rollResult && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-100" onClick={() => setRollResult(null)}>
           <div className={`w-full max-w-sm border-2 p-8 text-center shadow-[0_0_30px_rgba(0,0,0,0.5)] transform scale-100 transition-all ${
               rollResult.type === 'CRIT' ? 'border-yellow-500 bg-yellow-900/20' : rollResult.type === 'SUCCESS' ? 'border-green-500 bg-green-900/20' : rollResult.type === 'JAM' ? 'border-red-600 bg-red-900/20 border-dashed' : 'border-red-800 bg-red-950/40'}`}>
              <div className="text-[10px] font-bold uppercase tracking-[0.3em] mb-4 text-white opacity-70">Resolution Protocol</div>
              <div className="text-6xl font-black mb-2 text-white drop-shadow-md">{rollResult.roll}</div>
              <div className={`text-2xl font-black uppercase italic tracking-tighter mb-4 ${ rollResult.type === 'CRIT' ? 'text-yellow-400' : rollResult.type === 'SUCCESS' ? 'text-green-500' : rollResult.type === 'JAM' ? 'text-red-600 animate-pulse' : 'text-red-800'}`}>
                  {rollResult.type === 'CRIT' ? 'HOT STREAK' : rollResult.type === 'JAM' ? 'FATAL ERROR' : rollResult.type}
              </div>
              <div className="border-t border-white/20 pt-4 space-y-1 text-left text-[9px] font-mono text-gray-400 uppercase tracking-widest bg-black/50 p-3">
                  <div className="flex justify-between"><span className="text-gray-500">Skill</span><span className="text-white font-bold">{rollResult.skill}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Active Weapon</span><span className="text-blue-400 font-bold">{rollResult.weaponName}</span></div>
                  <div className="flex justify-between mt-2 border-t border-white/10 pt-1"><span className="text-gray-500">Base Target</span><span className="text-white">≤{rollResult.baseTarget}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Weapon Bonus</span><span className="text-green-400">+{rollResult.weaponBonus}</span></div>
                  <div className="flex justify-between border-t border-white/10 pt-1 text-xs"><span className="text-gray-300">Final Target</span><span className="text-white font-black">≤{rollResult.finalTarget}</span></div>
                  <div className="flex justify-between text-[8px] text-yellow-500/80 mt-2"><span>Crit Range</span><span>1-{rollResult.critWindow}</span></div>
              </div>
              <div className="mt-8 text-[9px] uppercase tracking-widest text-gray-500 animate-pulse">Tap anywhere to dismiss</div>
           </div>
        </div>
      )}

      {/* DATALINK MODAL */}
      {viewData && character.form && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setViewData(false)}>
            <div className="w-full max-w-sm border border-cyan-900/50 bg-cyan-950/10 p-6 relative shadow-[0_0_50px_rgba(8,145,178,0.2)]" onClick={e => e.stopPropagation()}>
                <div className="text-center mb-6 border-b border-cyan-500/20 pb-4">
                    <h2 className="text-xl font-black italic text-cyan-400 uppercase tracking-tighter">DATA_UPLINK</h2>
                    <div className="text-[9px] text-cyan-600 font-mono">SECURE CONNECTION ESTABLISHED</div>
                </div>
                <div className="space-y-6 overflow-y-auto max-h-[60vh] custom-scrollbar pr-2">
                    {character.avatarUrl && (
                        <div className="border border-cyan-900/50 p-1 bg-black">
                            <img src={character.avatarUrl} alt="Dossier" className="w-full h-40 object-cover grayscale opacity-80" />
                        </div>
                    )}
                    <div>
                        <div className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1">Identity Config</div>
                        {(() => {
                            const freshForm = FORMS.find(f => f.id === character.form?.id) || character.form;
                            return (
                                <>
                                    <div className="text-lg font-bold text-white uppercase">{freshForm?.name || 'UNKNOWN FORM'}</div>
                                    <div className="text-[10px] text-gray-400 leading-relaxed mb-4">{freshForm?.description || 'No data found.'}</div>
                                </>
                            );
                        })()}
                        {(() => {
                            const freshDestiny = DESTINIES.find(d => d.id === character.destiny?.id) || character.destiny;
                            return (
                                <>
                                    <div className="text-sm font-bold text-white uppercase">{freshDestiny?.name || 'UNKNOWN DESTINY'}</div>
                                    {freshDestiny?.feature ? (
                                        <div className="mt-2 bg-black/50 border border-white/5 p-3">
                                            <div className="text-[9px] font-bold text-yellow-500 uppercase tracking-widest mb-1">{freshDestiny.feature.name}</div>
                                            <div className="text-[10px] text-gray-300 leading-relaxed">{freshDestiny.feature.description}</div>
                                        </div>
                                    ) : (
                                        <div className="text-[10px] text-gray-400 leading-relaxed mt-1">{freshDestiny?.description || 'No data found.'}</div>
                                    )}
                                </>
                            );
                        })()}
                    </div>
                    <div className="border border-red-900/30 bg-red-950/10 p-3">
                        <div className="text-[9px] font-bold text-red-500 uppercase tracking-widest mb-1">Active Protocol (Curse)</div>
                        <div className="text-sm font-bold text-red-400 uppercase">{character.darkMark?.name || 'NO ACTIVE PROTOCOL'}</div>
                        <div className="text-[10px] text-red-300/80 leading-relaxed">{character.darkMark?.description || 'Data corrupted or missing.'}</div>
                    </div>
                    <div>
                        <div className="text-[9px] font-bold text-purple-500 uppercase tracking-widest mb-1">Origin Source</div>
                        <div className="text-sm font-bold text-purple-400 uppercase">{character.master || 'UNKNOWN ORIGIN'}</div>
                    </div>
                </div>
                <button onClick={() => setViewData(false)} className="w-full mt-6 border border-cyan-900 text-cyan-500 py-3 uppercase text-xs font-bold hover:bg-cyan-900/20 transition-colors">Terminate Link</button>
            </div>
        </div>
      )}

      {/* PROMOTION MODAL */}
      {viewPromotion && (
          <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setViewPromotion(false)}>
              <div className="w-full max-w-sm border border-yellow-500 bg-yellow-900/20 p-6 relative shadow-[0_0_50px_rgba(234,179,8,0.3)]" onClick={e => e.stopPropagation()}>
                  <div className="text-center mb-6"><h2 className="text-2xl font-black italic text-yellow-400 uppercase tracking-tighter">PROMOTION AUTHORIZED</h2><div className="text-[10px] text-yellow-600 font-mono">SELECT UPGRADE MODULE</div></div>
                  <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-2">{['PHY', 'SPD', 'COG', 'DRV', 'CHA', 'SPR'].map(stat => (<button key={stat} onClick={() => promoteUnit('stat', stat)} className="bg-black/40 border border-yellow-600/30 hover:border-yellow-400 p-3 text-left group"><div className="text-[9px] text-gray-400 group-hover:text-yellow-400 transition-colors">UPGRADE</div><div className="text-lg font-bold text-white">{stat} +1</div></button>))}</div>
                      <div className="border-t border-yellow-600/30 pt-4 mt-2"><div className="text-[9px] text-center text-gray-500 mb-2 uppercase tracking-widest">Or Fortify Vitals</div><div className="flex gap-2"><button onClick={() => promoteUnit('vital', 'life')} className="flex-1 bg-green-900/20 border border-green-700/50 p-3 text-center hover:bg-green-900/40"><div className="text-[9px] text-green-500 font-bold uppercase">MAX LIFE</div><div className="text-xl text-white font-black">+2</div></button><button onClick={() => promoteUnit('vital', 'sanity')} className="flex-1 bg-blue-900/20 border border-blue-700/50 p-3 text-center hover:bg-blue-900/40"><div className="text-[9px] text-blue-500 font-bold uppercase">MAX SANITY</div><div className="text-xl text-white font-black">+2</div></button></div></div>
                  </div>
                  <button onClick={() => setViewPromotion(false)} className="w-full mt-6 text-gray-500 text-[10px] uppercase hover:text-white">Cancel Promotion</button>
              </div>
          </div>
      )}
    </>
  );
}