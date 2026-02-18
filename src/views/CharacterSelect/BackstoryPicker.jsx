import React, { useState } from 'react';

const BackstoryPicker = ({ onComplete }) => {
  const [selections, setSelections] = useState({
    form: '',
    origin: '',
    truth: ''
  });

  const options = {
    forms: ["Undying", "Nano Suit", "Satanic Entity", "Genesis Machine"],
    origins: ["Satanic Court", "The Ancients", "Genesis Machine", "Secular"],
    truths: {
      "Satanic Court": ["Ex-Torturer", "Cursed Bloodline", "Demon-Debt Holder"],
      "The Ancients": ["Memory Fragment", "Relic Guardian", "Void Walker"],
      "Genesis Machine": ["Protocol Glitch", "Silenced AI", "Scrap-Heap Reborn"],
      "Secular": ["Vault Survivor", "Black Market Dealer", "Old World Soldier"]
    }
  };

  const handleFinish = () => {
    const finalBackstoryJSON = {
      ...selections,
      mechanical_impact: getMechanicalImpact(selections.origin),
      timestamp: new Date().toISOString()
    };
    if (onComplete) onComplete(finalBackstoryJSON);
  };

  const getMechanicalImpact = (origin) => {
    const impacts = {
      "Satanic Court": { bonus: "Melee Damage", penalty: "+10% Jam Risk", color: "text-red-600" },
      "The Ancients": { bonus: "Critical Range", penalty: "Aura Drain", color: "text-amber-500" },
      "Genesis Machine": { bonus: "Accuracy", penalty: "Overheat Risk", color: "text-cyan-400" },
      "Secular": { bonus: "Scavenge Luck", penalty: "Fragile Gear", color: "text-zinc-400" }
    };
    return impacts[origin] || {};
  };

  return (
    <div className="bg-zinc-950 text-zinc-100 p-8 border-2 border-red-900 rounded-lg max-w-md mx-auto my-10 shadow-2xl">
      <h2 className="text-2xl font-bold mb-6 text-red-700 tracking-tighter uppercase italic">Soul-Forge Protocol</h2>
      
      <section className="mb-6">
        <label className="block text-xs uppercase tracking-widest text-zinc-500 mb-2 font-bold">1. Select Physical Form</label>
        <div className="grid grid-cols-2 gap-2">
          {options.forms.map(f => (
            <button key={f} onClick={() => setSelections({...selections, form: f})} 
              className={`p-2 text-sm border transition-all ${selections.form === f ? 'bg-red-900 border-red-500 text-white' : 'border-zinc-800 text-zinc-400 hover:border-zinc-600'}`}>
