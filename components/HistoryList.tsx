import React, { useState } from 'react';
import { ScheduleItem } from '../types';
import { formatDate } from '../utils/dateUtils';
import { History, MessageSquareText, AlertTriangle, PlayCircle, CheckCircle, Filter } from 'lucide-react';

interface Props {
  history: ScheduleItem[];
  totalTasks: number;
  myApartmentId: string | null;
}

type FilterStatus = 'all' | 'urgent' | 'partial' | 'completed';

const getAptHighlightStyle = (num: string) => {
  const map: Record<string, string> = {
    '101': 'bg-blue-50/50 border-blue-100 text-blue-800',
    '102': 'bg-emerald-50/50 border-emerald-100 text-emerald-800',
    '201': 'bg-purple-50/50 border-purple-100 text-purple-800',
    '202': 'bg-orange-50/50 border-orange-100 text-orange-800',
    '301': 'bg-pink-50/50 border-pink-100 text-pink-800',
    '302': 'bg-teal-50/50 border-teal-100 text-teal-800',
  };
  return map[num] || 'bg-indigo-50/50 border-indigo-100 text-indigo-800';
};

const analyzeObservation = (obs: string) => {
  const lowerObs = obs.toLowerCase();
  const urgentKeywords = ['urgente', 'atrasado', 'emergencia', 'problema', 'quebrado', 'lâmpada', 'vazamento'];
  const partialKeywords = ['parcial', 'metade', 'incompleto', 'faltou', 'falta', 'depois', 'concluir'];

  const isUrgent = urgentKeywords.some(key => lowerObs.includes(key));
  const isPartial = partialKeywords.some(key => lowerObs.includes(key));

  return { isUrgent, isPartial };
};

const HistoryList: React.FC<Props> = ({ history, totalTasks, myApartmentId }) => {
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');

  const getWeeklyData = (startDate: Date) => {
    const dateKey = startDate.toISOString().split('T')[0];
    const tasksKey = `tasks_${dateKey}`;
    const obsKey = `obs_${dateKey}`;
    
    let percent = 0;
    let obs = "";

    try {
      const savedTasks = localStorage.getItem(tasksKey);
      if (savedTasks) {
        const parsed = JSON.parse(savedTasks);
        const count = Object.values(parsed).filter(Boolean).length;
        percent = totalTasks > 0 ? Math.round((count / totalTasks) * 100) : 0;
      }
      obs = localStorage.getItem(obsKey) || "";
    } catch (e) {
      console.error(e);
    }

    const { isUrgent, isPartial } = analyzeObservation(obs);

    return { percent, obs, isUrgent, isPartial };
  };

  const filteredHistory = history.filter(item => {
    const data = getWeeklyData(item.startDate);
    if (filterStatus === 'all') return true;
    if (filterStatus === 'urgent') return data.isUrgent;
    if (filterStatus === 'completed') return data.percent === 100;
    if (filterStatus === 'partial') return (data.percent > 0 && data.percent < 100) || data.isPartial;
    return true;
  });

  return (
    <div className="pt-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <History size={18} className="text-gray-400" />
          <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Histórico Recente</h3>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <Filter size={14} className="text-gray-300 shrink-0" />
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tight transition-all border shrink-0 ${
              filterStatus === 'all' ? 'bg-black text-white border-black' : 'bg-white text-gray-500 border-gray-100 hover:border-gray-200'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setFilterStatus('urgent')}
            className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tight transition-all border shrink-0 ${
              filterStatus === 'urgent' ? 'bg-red-600 text-white border-red-600' : 'bg-white text-red-500 border-red-50 hover:border-red-100'
            }`}
          >
            Urgentes
          </button>
          <button
            onClick={() => setFilterStatus('partial')}
            className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tight transition-all border shrink-0 ${
              filterStatus === 'partial' ? 'bg-amber-500 text-white border-amber-500' : 'bg-white text-amber-600 border-amber-50 hover:border-amber-100'
            }`}
          >
            Parciais
          </button>
          <button
            onClick={() => setFilterStatus('completed')}
            className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tight transition-all border shrink-0 ${
              filterStatus === 'completed' ? 'bg-green-600 text-white border-green-600' : 'bg-white text-green-600 border-green-50 hover:border-green-100'
            }`}
          >
            Concluídos
          </button>
        </div>
      </div>
      
      <div className="space-y-4">
        {filteredHistory.length > 0 ? (
          filteredHistory.map((item, idx) => {
            const { percent, obs, isUrgent, isPartial } = getWeeklyData(item.startDate);
            const isMe = myApartmentId === item.apartment.id;
            const highlightStyle = getAptHighlightStyle(item.apartment.number);

            return (
              <div 
                key={idx} 
                className={`
                  p-4 rounded-2xl border transition-all animate-slide-up-fade
                  ${isMe ? `${highlightStyle} border-2 shadow-sm` : 'bg-white border-gray-50 text-gray-700 hover:border-gray-200'}
                `}
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-black">Apt {item.apartment.number}</p>
                      {isMe && <span className="text-[9px] font-black uppercase bg-white/60 px-2 py-0.5 rounded ring-1 ring-black/5">Eu</span>}
                      
                      {obs && isUrgent && (
                        <span className="flex items-center gap-1 text-[9px] font-black uppercase bg-red-100 text-red-700 px-2 py-0.5 rounded animate-pulse">
                          <AlertTriangle size={10} /> Urgente
                        </span>
                      )}
                      {obs && isPartial && !isUrgent && (
                        <span className="flex items-center gap-1 text-[9px] font-black uppercase bg-amber-100 text-amber-700 px-2 py-0.5 rounded">
                          <PlayCircle size={10} /> Parcial
                        </span>
                      )}
                      {percent === 100 && (
                        <span className="flex items-center gap-1 text-[9px] font-black uppercase bg-green-100 text-green-700 px-2 py-0.5 rounded">
                          <CheckCircle size={10} /> Concluído
                        </span>
                      )}
                    </div>
                    <p className={`text-[10px] font-bold uppercase tracking-tight ${isMe ? 'opacity-70' : 'text-gray-400'}`}>
                      {formatDate(item.startDate)} — {formatDate(item.endDate)}
                    </p>
                  </div>
                  
                  <div className="flex flex-col items-end shrink-0">
                    <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden mb-1">
                        <div 
                          className={`h-full rounded-full transition-all duration-700 ${percent === 100 ? 'bg-green-500' : 'bg-blue-400'}`}
                          style={{ width: `${percent}%` }}
                        />
                    </div>
                    <span className="text-[9px] font-black text-gray-400">{percent}% CONCLUÍDO</span>
                  </div>
                </div>

                {obs && (
                  <div className={`mt-3 p-3 rounded-xl flex items-start gap-2 text-xs font-medium border border-dashed transition-all group ${
                    isUrgent ? 'bg-red-50/50 border-red-100 text-red-900' : 
                    isPartial ? 'bg-amber-50/50 border-amber-100 text-amber-900' :
                    isMe ? 'bg-white/40 border-current/20' : 'bg-gray-50 border-gray-100'
                  }`}>
                    <MessageSquareText size={14} className="shrink-0 mt-0.5 opacity-50" />
                    <p className="italic leading-relaxed">"{obs}"</p>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="py-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <p className="text-gray-400 font-bold text-sm">Nenhum registro encontrado com este filtro.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryList;