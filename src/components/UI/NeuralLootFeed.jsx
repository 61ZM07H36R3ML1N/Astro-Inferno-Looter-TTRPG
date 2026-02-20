import React, { useState, useEffect } from 'react';
import { db } from '../firebase'; // Adjust path if necessary
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';

const NeuralLootFeed = () => {
  const [lootFeed, setLootFeed] = useState([]);

  useEffect(() => {
    // This query listens to the last 5 items dropped, newest first
    const q = query(
      collection(db, 'party_loot'), 
      orderBy('timestamp', 'desc'), 
      limit(5)
    );

    // onSnapshot is the magic Neural Link. It updates instantly when the DB changes.
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const feedData = [];
      snapshot.forEach((doc) => {
        feedData.push({ id: doc.id, ...doc.data() });
      });
      setLootFeed(feedData);
    });

    return () => unsubscribe(); // Cleanup the listener when component unmounts
  }, []);

  return (
    <div className="p-4 bg-gray-900 border border-blue-500 rounded-lg font-mono w-full max-w-md shadow-lg">
      <h3 className="text-blue-400 text-sm mb-4 tracking-widest border-b border-blue-900 pb-2">
        /// NEURAL LOOT FEED ///
      </h3>
      
      <div className="space-y-3">
        {lootFeed.length === 0 ? (
          <p className="text-xs text-gray-600 italic">No telemetry detected...</p>
        ) : (
          lootFeed.map((item, index) => (
            <div 
              key={item.id} 
              className={`p-3 rounded border border-gray-800 bg-black animate-pulse ${index === 0 ? 'border-l-4 border-l-blue-500' : ''}`}
            >
              <div className="flex justify-between items-start">
                <p className={`text-sm font-bold ${item.color}`}>{item.name}</p>
                <span className="text-[10px] text-gray-500 mt-1 uppercase">New</span>
              </div>
              <div className="flex justify-between mt-2">
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">[{item.tier}]</p>
                <p className="text-[10px] text-gray-500">Condition: {item.condition}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NeuralLootFeed;