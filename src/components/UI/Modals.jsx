import React from 'react';

const Modals = ({
  grenadeResult, setGrenadeResult,
  rollResult, setRollResult,
  viewData, setViewData, character,
  viewPromotion, setViewPromotion, promoteUnit
}) => {

  // --- SAFETY FILTERS ---
  const safeName = (field, fallback) => {
    if (!field) return fallback;
    if (typeof field === 'string') return field;
    return field.name || fallback;
  };

  const safeDesc = (field) => {
    if (!field) return null;
    if (typeof field === 'string') return null;
    // This now checks for a direct description OR a nested feature description
    return field.description || field?.feature?.description || null;
  };

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

      {/* --- DATALINK MODAL (RESTORED AESTHETIC) --- */}
      {viewData && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="max-w-md w-full relative max-h-[90vh] overflow-y-auto custom-scrollbar font-mono text-left">
            
            {/* FALLBACK FOR CORRUPT DATA */}
            {!character?.form ? (
              <div className="text-center py-10 border border-red-900 bg-black p-6 shadow-[0_0_30px_rgba(220,38,38,0.2)]">
                <h2 className="text-red-500 font-black text-2xl uppercase tracking-widest mb-2 animate-pulse">FILE CORRUPTED</h2>
                <p className="text-gray-400 text-xs">No Core Form detected for this unit. Please deploy a new unit via the Barracks.</p>
                <button onClick={() => setViewData(false)} className="mt-8 w-full border border-cyan-900 bg-black text-cyan-400 font-bold py-4 uppercase tracking-widest hover:bg-cyan-900/30 transition-colors">
                  Terminate Link
                </button>
              </div>
            ) : (
              <div className="bg-black/80 border border-cyan-900/20 p-6 shadow-[0_0_20px_rgba(8,145,178,0.1)]">
                
                {/* HEADER */}
                <div className="text-center mb-8 border-b border-cyan-900/30 pb-6 mt-2">
                  <h2 className="text-cyan-400 font-black text-2xl italic uppercase tracking-widest drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]">DATA_UPLINK</h2>
                  <p className="text-cyan-600 text-[9px] uppercase tracking-[0.2em] mt-2">Secure Connection Established</p>
                </div>
                
                {/* FORM / BACKGROUND */}
                <div className="mb-6">
                  <h3 className="text-white font-black text-lg uppercase tracking-widest mb-2">
                    {safeName(character.form, "UNKNOWN FORM")}
                  </h3>
                  
                  {/* If there's a description, show it */}
                  {safeDesc(character.form) && (
                    <p className="text-gray-400 text-[11px] leading-relaxed mb-4">
                      {safeDesc(character.form)}
                    </p>
                  )}

                  {/* If the Form has Base Stats, display them in a grid! */}
                  {character.form?.baseStats && (
                    <div className="mt-3 bg-cyan-950/10 border border-cyan-900/30 p-2">
                      <div className="text-cyan-600 text-[8px] font-bold uppercase tracking-[0.2em] mb-2 text-center">Core Combat Matrix</div>
                      <div className="grid grid-cols-4 gap-1">
                        {Object.entries(character.form.baseStats).map(([stat, val]) => (
                          <div key={stat} className="bg-black/50 border border-cyan-900/20 p-1 text-center">
                            <div className="text-gray-500 text-[8px] uppercase">{stat}</div>
                            <div className="text-cyan-400 text-xs font-bold">{val}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* DARK MARK / SECONDARY TRAIT */}
                <div className="mb-8">
                  <h3 className="text-white font-black text-lg uppercase tracking-widest mb-2">
                    {safeName(character.darkMark, "UNDETECTED")}
                  </h3>
                  <p className="text-gray-400 text-[11px] leading-relaxed">
                    {safeDesc(character.darkMark) || "No anomaly data found."}
                  </p>
                </div>

                {/* PROTOCOL / DESTINY (RED BOX) */}
                <div className="border border-red-900/40 bg-red-950/10 p-5 mb-8">
                  <div className="text-red-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">Active Protocol (Curse)</div>
                  <div className="text-red-400 font-black text-lg uppercase tracking-widest">
                    {safeName(character.destiny, "UNASSIGNED")}
                  </div>
                  
                  {/* Inject the Feature Name if it exists! */}
                  {character.destiny?.feature?.name && (
                    <div className="text-red-500/80 text-[9px] font-bold uppercase tracking-widest mt-1 mb-3">
                      // {character.destiny.feature.name}
                    </div>
                  )}

                  <p className="text-red-400/80 text-[11px] leading-relaxed">
                    {safeDesc(character.destiny) || "No protocol data found."}
                  </p>
                </div>

                {/* ORIGIN SOURCE / MASTER (PURPLE) */}
                <div className="mb-10">
                  <div className="text-purple-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-1">Origin Source</div>
                  <div className="text-purple-400 font-black text-lg uppercase tracking-widest">
                    {safeName(character.master, "NONE")}
                  </div>
                  {safeDesc(character.master) && (
                    <p className="text-purple-400/80 text-[11px] leading-relaxed mt-2">
                      {safeDesc(character.master)}
                    </p>
                  )}
                </div>

                {/* TERMINATE BUTTON */}
                <button onClick={() => setViewData(false)} className="w-full border border-cyan-900 bg-transparent text-cyan-400 font-bold py-4 text-xs uppercase tracking-[0.2em] hover:bg-cyan-900/30 transition-colors">
                  Terminate Link
                </button>
                
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