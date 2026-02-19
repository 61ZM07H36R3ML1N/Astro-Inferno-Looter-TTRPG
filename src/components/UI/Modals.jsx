import React from 'react';

const Modals = ({
  grenadeResult, setGrenadeResult,
  rollResult, setRollResult,
  viewData, setViewData, character,
  viewPromotion, setViewPromotion, promoteUnit
}) => {
  return (
    <>
      {/* --- GRENADE RESULT MODAL --- */}
      {grenadeResult && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
          <div className="bg-zinc-900 border-2 border-orange-600 max-w-sm w-full p-6 text-center shadow-[0_0_40px_rgba(234,88,12,0.4)]">
            <h2 className="text-orange-500 font-black text-2xl uppercase tracking-widest mb-4">Ordnance Deployed</h2>
            <div className="text-white text-lg font-bold mb-2">[{grenadeResult.tier.name}]</div>
            <div className="text-orange-400 text-sm mb-6 uppercase">{grenadeResult.juice.type} Payload</div>
            <p className="text-gray-400 text-xs italic mb-6">"Fire in the void."</p>
            <button onClick={() => setGrenadeResult(null)} className="w-full bg-orange-600 text-white font-bold py-3 uppercase hover:bg-white hover:text-orange-600 transition-colors">Acknowledge</button>
          </div>
        </div>
      )}

      {/* --- ROLL RESULT MODAL --- */}
      {rollResult && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in zoom-in-95 duration-200">
          <div className={`bg-zinc-900 border-2 max-w-sm w-full p-6 text-center shadow-[0_0_40px_currentColor] ${
            rollResult.type === 'CRIT' ? 'border-yellow-500 text-yellow-500' :
            rollResult.type === 'JAM' ? 'border-red-600 text-red-600' :
            rollResult.type === 'SUCCESS' ? 'border-green-500 text-green-500' : 'border-gray-500 text-gray-500'
          }`}>
            <h2 className="font-black text-3xl uppercase tracking-widest mb-2">{rollResult.type}</h2>
            <div className="text-white text-6xl font-black my-4 drop-shadow-[0_0_10px_currentColor]">{rollResult.roll}</div>
            <div className="text-gray-400 text-xs uppercase tracking-widest mb-6">
              Skill: <span className="text-white">{rollResult.skill}</span> <br/>
              Target: {rollResult.finalTarget} (Base {rollResult.baseTarget} + Wpn {rollResult.weaponBonus})
            </div>
            <button onClick={() => setRollResult(null)} className="w-full border-2 border-current text-current font-bold py-3 uppercase hover:bg-current hover:text-black transition-colors">Clear</button>
          </div>
        </div>
      )}

      {/* --- DATALINK MODAL --- */}
      {viewData && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-zinc-900 border-2 border-cyan-900 max-w-2xl w-full p-6 relative shadow-[0_0_30px_rgba(8,145,178,0.3)] max-h-[90vh] overflow-y-auto custom-scrollbar">
            <button onClick={() => setViewData(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white font-black text-xl leading-none">X</button>

            {!character?.form ? (
              <div className="text-center py-10">
                <h2 className="text-red-500 font-black text-2xl uppercase tracking-widest mb-2 animate-pulse">FILE CORRUPTED</h2>
                <p className="text-gray-400 text-xs">No Core Form detected for this unit. Please deploy a new unit via the Barracks.</p>
              </div>
            ) : (
              <div>
                <h2 className="text-cyan-500 font-black text-xl uppercase tracking-widest border-b border-cyan-900/50 pb-2 mb-4">
                  Datalink // {character.name || "UNIT_UNNAMED"}
                </h2>
                
                <div className="grid grid-cols-2 gap-4 text-xs font-mono mb-6">
                  <div className="bg-black/50 p-3 border border-cyan-900/30">
                    <div className="text-gray-500 mb-1">RANK // XP</div>
                    <div className="text-white font-bold">{character.rank} // {character.xp}</div>
                  </div>
                  <div className="bg-black/50 p-3 border border-cyan-900/30">
                    <div className="text-gray-500 mb-1">CORE FORM</div>
                    <div className="text-cyan-400 font-bold">{character.form.name}</div>
                  </div>
                  <div className="bg-black/50 p-3 border border-cyan-900/30 col-span-2">
                    <div className="text-gray-500 mb-1">DESTINY PROTOCOL</div>
                    <div className="text-purple-400 font-bold">{character.destiny?.name || "UNASSIGNED"}</div>
                    <div className="text-gray-400 text-[10px] mt-1 italic">{character.destiny?.description || ""}</div>
                  </div>
                </div>

                <div className="border border-cyan-900/50 p-4 bg-black/30">
                  <h3 className="text-[10px] text-cyan-600 uppercase font-black tracking-widest mb-3">Active Upgrades</h3>
                  {Object.keys(character.upgrades || {}).length === 0 ? (
                    <span className="text-gray-600 italic text-xs">No cybernetic or arcane modifications installed.</span>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {Object.entries(character.upgrades).map(([key, val]) => (
                        <div key={key} className="flex justify-between border-b border-white/5 pb-1">
                          <span className="text-gray-400 uppercase">{key}</span>
                          <span className="text-cyan-400 font-bold">+{val}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- PROMOTION MODAL --- */}
      {viewPromotion && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in slide-in-from-bottom-4">
          <div className="bg-zinc-900 border-2 border-yellow-600 max-w-md w-full p-6 text-center shadow-[0_0_40px_rgba(202,138,4,0.3)]">
            <h2 className="text-yellow-500 font-black text-2xl uppercase tracking-widest mb-2">Unit Promotion</h2>
            <p className="text-gray-400 text-xs mb-6">XP threshold reached. Select an upgrade vector.</p>
            
            <div className="space-y-3 mb-6 text-left">
              <div className="text-[10px] text-yellow-600 font-bold uppercase tracking-widest border-b border-yellow-900/50 pb-1">Vitals (+2)</div>
              <div className="grid grid-cols-3 gap-2">
                {['life', 'sanity', 'aura'].map(v => (
                  <button key={v} onClick={() => promoteUnit('vital', v)} className="bg-black border border-yellow-900/50 text-yellow-500 py-2 text-xs uppercase hover:bg-yellow-600 hover:text-black transition-colors">{v.substring(0,3)}</button>
                ))}
              </div>
              
              <div className="text-[10px] text-yellow-600 font-bold uppercase tracking-widest border-b border-yellow-900/50 pb-1 mt-4">Core Stats (+1)</div>
              <div className="grid grid-cols-4 gap-2">
                {['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA', 'PHY', 'DRV'].map(s => (
                  <button key={s} onClick={() => promoteUnit('stat', s)} className="bg-black border border-yellow-900/50 text-yellow-500 py-2 text-xs uppercase hover:bg-yellow-600 hover:text-black transition-colors">{s}</button>
                ))}
              </div>
            </div>
            <button onClick={() => setViewPromotion(false)} className="w-full border border-gray-600 text-gray-400 font-bold py-2 uppercase text-xs hover:bg-white hover:text-black transition-colors">Postpone</button>
          </div>
        </div>
      )}
    </>
  );
};

export default Modals;