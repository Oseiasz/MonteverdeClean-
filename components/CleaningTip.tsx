import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';
import { getCleaningTip } from '../services/geminiService';

const CleaningTip: React.FC = () => {
  const [tip, setTip] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const fetchTip = async () => {
    setLoading(true);
    const newTip = await getCleaningTip();
    setTip(newTip);
    setLoading(false);
  };

  useEffect(() => {
    fetchTip();
  }, []);

  return (
    <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-3xl p-6 text-white shadow-xl shadow-blue-200">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-yellow-300" />
          <span className="text-xs font-black uppercase tracking-widest opacity-80">Dica da IA</span>
        </div>
        <button 
          onClick={fetchTip} 
          disabled={loading}
          className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
        </button>
      </div>
      
      {loading ? (
        <div className="space-y-2 animate-pulse">
           <div className="h-4 bg-white/20 rounded w-full"></div>
           <div className="h-4 bg-white/20 rounded w-4/5"></div>
        </div>
      ) : (
        <p className="text-white font-bold text-sm leading-relaxed italic">
          "{tip}"
        </p>
      )}
    </div>
  );
};

export default CleaningTip;