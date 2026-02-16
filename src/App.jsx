import { useState } from 'react';

function App() {
  const [view, setView] = useState('welcome');
  const [selectedChar, setSelectedChar] = useState(null);

 
  return (
    <div className="scanlines flex min-h-screen flex-col items-center justify-center bg-black font-mono text-white relative overflow-hidden">
      
      {/* ---------------- WELCOME VIEW ---------------- */}
      {view === 'welcome' && (
        <>
          <div className="absolute top-6 right-6 z-50">
            <button 
              onClick={() => console.log("Init_Auth")}
              className="group flex items-center gap-3 border border-white/10 bg-white/5 px-4 py-2 hover:border-red-600 transition-all cursor-pointer"
            >
              <div className="flex flex-col items-end">
                <span className="text-[8px] text-gray-500 uppercase leading-none">Access_Level</span>
                <span className="text-[10px] text-white font-bold uppercase tracking-widest">Guest_User</span>
              </div>
              <div className="h-8 w-8 rounded-sm border border-red-600/50 flex items-center justify-center group-hover:bg-red-600/20 transition-colors">
                <div className="h-1.5 w-1.5 rounded-full bg-red-600 animate-pulse"></div>
              </div>
            </button>
          </div>

          <div className="text-center z-10 animate-in fade-in duration-1000">
            <div className="relative inline-block group mb-12">
              <div className="absolute -top-4 -left-8 h-8 w-8 border-t-2 border-l-2 border-red-600/50 hidden md:block"></div>
              <div className="absolute -bottom-4 -right-8 h-8 w-8 border-b-2 border-r-2 border-red-600/50 hidden md:block"></div>
              
              <h1 className="text-5xl md:text-9xl font-black italic tracking-tighter text-red-600 uppercase shadow-red-glow animate-flicker leading-none select-none">
                Astro Inferno
              </h1>
            </div>
            
            <div className="flex flex-col items-center gap-6 w-full max-w-[280px] md:max-w-sm mx-auto">
              <span className="text-[9px] text-red-500 tracking-[0.4em] animate-pulse">
                ! WARNING: UNSANCTIONED_UPLINK !
              </span>

              <button 
                onClick={() => setView('select')} 
                className="w-full border-2 border-red-600 bg-red-600/5 py-5 text-red-600 font-bold uppercase hover:bg-red-600 hover:text-white transition-all active:scale-95 cursor-pointer"
              >
                Initialize Unit
              </button>
            </div>
          </div>
        </>
      )}

      {/* ---------------- SELECTION GRID VIEW ---------------- */}
      {view === 'select' && (
        <div className="w-full max-w-4xl px-6 animate-in fade-in slide-in-from-bottom-4 duration-500 z-10">
          <div className="flex justify-between items-end border-b border-red-600/30 pb-2 mb-8">
            <h2 className="text-2xl font-black uppercase italic text-red-600 tracking-tighter">
              Active_Units
            </h2>
            <button 
              onClick={() => setView('welcome')}
              className="text-[10px] text-gray-500 hover:text-white uppercase tracking-widest cursor-pointer"
            >
              [ Terminate_Link ]
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {characters.map((char) => (
              <div 
                key={char.id}
                onClick={() => { setSelectedChar(char); setView('deploy'); }}
                className={`group relative border p-4 bg-white/5 transition-all cursor-pointer overflow-hidden ${
                  char.type === 'Undying' ? 'border-blue-500/30 hover:border-blue-500' : 'border-red-600/30 hover:border-red-600'
                }`}
              >
                <span className="absolute -right-2 -bottom-2 text-4xl font-black text-white/5 italic select-none pointer-events-none">
                  {char.id}
                </span>

                <div className="flex justify-between items-start">
                  <div>
                    <p className={`text-[9px] font-bold tracking-widest leading-none mb-1 uppercase ${
                       char.type === 'Undying' ? 'text-blue-400' : 'text-red-500'
                    }`}>
                      // TYPE: {char.type}
                    </p>
                    <h3 className="text-3xl font-black text-white tracking-tighter italic uppercase">
                      {char.name}
                    </h3>
                  </div>
                  <div className="text-right border-l border-white/10 pl-4">
                    <p className="text-[9px] text-gray-500 uppercase">Verse</p>
                    <p className="text-lg font-bold text-white">{char.verse}</p>
                  </div>
                </div>

                <div className="mt-6 flex justify-between items-center border-t border-white/5 pt-4">
                  <span className="text-[10px] text-gray-500 uppercase tracking-widest">
                    Status: <span className="text-white">{char.status}</span>
                  </span>
                  <button className={`text-[10px] font-bold px-3 py-1 uppercase transition-colors ${
                    char.type === 'Undying' 
                      ? 'bg-blue-600 text-white hover:bg-white hover:text-blue-900' 
                      : 'bg-red-600 text-white hover:bg-white hover:text-red-900'
                  }`}>
                    Deploy
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ---------------- DEPLOYED / DASHBOARD VIEW (Placeholder) ---------------- */}
      {view === 'deploy' && selectedChar && (
        <div className="w-full max-w-5xl px-4 py-8 text-center">
            <h2 className="text-4xl text-red-600 font-black italic uppercase mb-4">Uplink Established: {selectedChar.name}</h2>
            <p className="text-gray-500 mb-8">System Ready. Loading Sheet Data...</p>
            <button onClick={() => setView('select')} className="border border-white px-6 py-2 uppercase hover:bg-white hover:text-black">Return to Grid</button>
        </div>
      )}
    </div>
  );
}

export default App;