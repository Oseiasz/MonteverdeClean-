import React from 'react';
import { ScheduleItem, Task } from '../types';
import { formatDate } from '../utils/dateUtils';
import { History, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

interface Props {
  history: ScheduleItem[];
  totalTasks: number;
}

const HistoryList: React.FC<Props> = ({ history, totalTasks }) => {
  // Helper to get completion status from localStorage synchronously for display
  const getCompletionData = (startDate: Date) => {
    const dateKey = startDate.toISOString().split('T')[0];
    const key = `tasks_${dateKey}`;
    try {
      const saved = localStorage.getItem(key);
      if (!saved) return { count: 0, status: 'none' };
      
      const parsed = JSON.parse(saved);
      const count = Object.values(parsed).filter(Boolean).length;
      return { count, status: 'saved' };
    } catch (e) {
      return { count: 0, status: 'error' };
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mt-6">
      <div className="p-5 border-b border-gray-100 flex items-center gap-2 bg-gray-50/50">
        <History className="text-gray-500" size={20} />
        <h3 className="font-bold text-gray-800 text-lg">Histórico Recente</h3>
      </div>
      
      <div className="divide-y divide-gray-100">
        {history.map((item, idx) => {
          const { count } = getCompletionData(item.startDate);
          const isComplete = count === totalTasks && totalTasks > 0;
          const isPartial = count > 0 && count < totalTasks;
          
          return (
            <div key={idx} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-6">
                <div className="text-sm font-medium text-gray-400 w-32">
                  {formatDate(item.startDate)} - {formatDate(item.endDate)}
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center font-bold text-xs">
                    {item.apartment.number}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-gray-700 text-sm">
                      {item.apartment.name || `Apartamento ${item.apartment.number}`}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2" title={
                isComplete ? "Concluído" : isPartial ? "Parcialmente Concluído" : "Não Concluído"
              }>
                <span className="text-xs font-medium text-gray-500 hidden sm:inline">
                  {count}/{totalTasks}
                </span>
                {isComplete ? (
                  <CheckCircle2 size={20} className="text-green-500" />
                ) : isPartial ? (
                   <AlertCircle size={20} className="text-yellow-500" />
                ) : (
                  <XCircle size={20} className="text-gray-300" />
                )}
              </div>
            </div>
          );
        })}
        {history.length === 0 && (
            <div className="p-8 text-center text-gray-400 text-sm">
                Nenhum histórico disponível ainda.
            </div>
        )}
      </div>
    </div>
  );
};

export default HistoryList;