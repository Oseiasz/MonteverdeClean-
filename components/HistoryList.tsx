import React from 'react';
import { ScheduleItem } from '../types';
import { formatDate } from '../utils/dateUtils';
import { History, MessageSquareText } from 'lucide-react';

interface Props {
  history: ScheduleItem[];
  totalTasks: number;
  myApartmentId: string | null;
}

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

const HistoryList: React.FC<Props> = ({ history, totalTasks, myApartmentId }) => {
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

    return { percent, obs };
  };

  return (
    <div className="pt-2">
      <div className="flex items-center gap-2 mb-6">
        <History size={18} className="text-gray-400" />
        <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Histórico Recente</h3>
      </div>
      
      <div className="space-y-4">
        {history.map((item, idx) => {
          const { percent, obs } = getWeeklyData(item.startDate);
          const isMe = myApartmentId === item.apartment.id;
          const highlightStyle = getAptHighlightStyle(item.apartment.number);

          return (
            <div 
              key={idx} 
              className={`
                p-4 rounded-2xl border transition-all
                ${isMe ? `${highlightStyle} border-2` : 'bg-white border-gray-50 text-gray-700'}
              `}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-black">Apt {item.apartment.number}</p>
                    {isMe && <span className="text-[9px] font-black uppercase bg-white/60 px-2 py-0.5 rounded">Eu</span>}
                  </div>
                  <p className={`text-[10px] font-bold uppercase tracking-tight ${isMe ? 'opacity-70' : 'text-gray-400'}`}>
                    {formatDate(item.startDate)} — {formatDate(item.endDate)}
                  </p>
                </div>
                
                <div className="flex flex-col items-end">
                   <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden mb-1">
                      <div 
                        className={`h-full rounded-full transition-all duration-700 ${percent === 100 ? 'bg-green-500' : 'bg-blue-400'}`}
                        style={{ width: `${percent}%` }}
                      />
                   </div>
                   <span className="text-[10px] font-black text-gray-400">{percent}% CONCLUÍDO</span>
                </div>
              </div>

              {obs && (
                <div className={`mt-3 p-3 rounded-xl flex items-start gap-2 text-xs font-medium border border-dashed ${isMe ? 'bg-white/40 border-current/20' : 'bg-gray-50 border-gray-100'}`}>
                  <MessageSquareText size={14} className="shrink-0 mt-0.5 opacity-50" />
                  <p className="italic leading-relaxed">"{obs}"</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HistoryList;