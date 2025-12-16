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
    <div className="bg-gradient-to-r from-violet-500 to-fuchsia-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
      <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full blur-2xl"></div>
      
      <div className="flex justify-between items-start mb-3 relative z-10">
        <div className="flex items-center gap-2">
          <Sparkles className="text-yellow-300" size={24} />
          <h3 className="font-bold text-lg">Dica da Semana</h3>
        </div>
        <button 
          onClick={fetchTip} 
          disabled={loading}
          className="p-1 hover:bg-white/20 rounded-full transition-colors"
        >
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
        </button>
      </div>
      
      <div className="relative z-10 min-h-[60px]">
        {loading ? (
          <div className="space-y-2 animate-pulse">
            <div className="h-4 bg-white/30 rounded w-3/4"></div>
            <div className="h-4 bg-white/30 rounded w-1/2"></div>
          </div>
        ) : (
          <p className="text-white/95 leading-relaxed font-medium">
            "{tip}"
          </p>
        )}
      </div>
      
      <div className="mt-4 text-xs text-white/60 font-medium tracking-wider uppercase">
        Powered by Gemini AI
      </div>
    </div>
  );
};

export default CleaningTip;