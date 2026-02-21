import React, { useState } from 'react';
import { generateProceduralLoot } from '../../utils/lootGenerator';
// Import your Firebase database and the Firestore functions
import { db } from '../../firebase'; // Adjust this path if your firebase.js is somewhere else!
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const LootTerminal = () => {
  const [currentLoot, setCurrentLoot] = useState(null);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);

  const handleExtractLoot = () => {
    const newLoot = generateProceduralLoot();
    setCurrentLoot(newLoot);
    setBroadcastSuccess(false); // Reset the success state for the new item
  };

  const handleBroadcast = async () => {
    if (!currentLoot) return;
    
    setIsBroadcasting(true);
    try {
      // Push the item to the Neural Link (Firestore)
      await addDoc(collection(db, 'party_loot'), {
        ...currentLoot,
        extractedBy: "Player 1", // You can swap this with the actual logged-in user later
        timestamp: serverTimestamp()
      });
      
      setBroadcastSuccess(true);
    } catch (error) {
      console.error("Neural Link Failure:", error);
    }
    setIsBroadcasting(false);
  };

  return (
    <div className="p-6 bg-gray-900 border border-green-500 rounded-lg font-mono w-full max-w-2xl mx-auto shadow-2xl">
      <div className="flex justify-between items-end border-b border-green-500 pb-2 mb-6">
        <h2 className="text-2xl text-green-400 tracking-widest">/// ARMORY FORGE ///</h2>
        <span className="text-xs text-green-600">v2.5.0-Forge</span>
      </div>
      
      <button 
        onClick={handleExtractLoot}
        className="w-full py-4 mb-6 bg-green-900/50 hover:bg-green-700 text-green-100 border border-green-500 font-bold rounded transition-all active:scale-95 uppercase tracking-widest"
      >
        [ Init Extraction Sequence ]
      </button>

      {currentLoot ? (
        <div className="mt-4 p-4 bg-black border border-gray-700 rounded-md relative overflow-hidden">
          <div className={`absolute inset-0 opacity-10 pointer-events-none bg-current ${currentLoot.color}`}></div>
          
          <div className="relative z-10">
            <div className="flex justify-between text-xs text-gray-500 mb-2 uppercase">
              <span>Category: {currentLoot.category}</span>
              <span>Condition: {currentLoot.condition}</span>
            </div>
            
            <p className={`text-2xl font-bold mt-2 ${currentLoot.color}`}>
              {currentLoot.name}
            </p>
            
            <p className={`text-sm mt-1 uppercase tracking-wider ${currentLoot.color} opacity-80`}>
              [{currentLoot.tier}]
            </p>
            
            <button 
              onClick={handleBroadcast}
              disabled={isBroadcasting || broadcastSuccess}
              className={`mt-6 w-full py-2 text-sm border rounded transition-colors ${
                broadcastSuccess 
                  ? 'bg-green-900 text-green-400 border-green-500' 
                  : 'bg-gray-800 hover:bg-gray-700 text-gray-300 border-gray-600'
              }`}
            >
              {isBroadcasting ? "Uplinking..." : broadcastSuccess ? "✓ Broadcast Successful" : "Broadcast to Party Neural Link"}
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center text-gray-600 text-sm py-8 border border-dashed border-gray-700 rounded-md">
          Awaiting extraction command...
        </div>
      )}
    </div>
  );
};

export default LootTerminal;