import React from 'react';
import { ScheduleItem } from '../types';
import { formatDate } from '../utils/dateUtils';
import { CalendarDays } from 'lucide-react';

interface Props {
  schedule: ScheduleItem[];
  myApartmentId: string | null;
}

const getAptHighlightStyle = (num: string) => {
  const map: Record<string, string> = {
    '101': 'bg-blue-50 border-blue-200 text-blue-700',
    '102': 'bg-emerald-50 border-emerald-200 text-emerald-700',
    '201': 'bg-purple-50 border-purple-200 text-purple-700',
    '202': 'bg-orange-50 border-orange-200 text-orange-700',
    '301': 'bg-pink-50 border-pink-200 text-pink-700',
    '302': 'bg-teal-50 border-teal-200 text-teal-700',
  };
  return map[num] || 'bg-indigo-50 border-indigo-200 text-indigo-700';
};

const ScheduleList: React.FC<Props> = ({ schedule, myApartmentId }) => {
  const upcomingItems = schedule.slice(0, 12);

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <CalendarDays size={18} className="text-blue-500" />
        <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Próximas Semanas</h3>
      </div>
      
      <div className="space-y-2">
        {upcomingItems.map((item, idx) => {
          const isMe = myApartmentId === item.apartment.id;
          const highlightStyle = getAptHighlightStyle(item.apartment.number);
          
          return (
            <div 
              key={idx} 
              className={`
                p-4 flex items-center justify-between rounded-2xl border transition-all
                ${isMe ? `${highlightStyle} shadow-sm scale-[1.02] border-2` : 'bg-white border-gray-50 text-gray-600'}
              `}
            >
              <div className="flex items-center gap-4">
                <div className="flex flex-col">
                  <span className={`text-[10px] font-black uppercase tracking-tighter ${isMe ? 'opacity-70' : 'text-gray-400'}`}>
                    Início em
                  </span>
                  <span className="text-sm font-black">
                    {formatDate(item.startDate)}
                  </span>
                </div>
                <div className="h-8 w-px bg-current opacity-10 hidden sm:block"></div>
                <span className={`text-base font-black ${isMe ? '' : 'text-gray-900'}`}>
                  Apartamento {item.apartment.number}
                </span>
              </div>
              
              {isMe && (
                <span className="text-[10px] font-black bg-white/50 px-3 py-1 rounded-full uppercase tracking-widest">
                  Sua Vez
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ScheduleList;