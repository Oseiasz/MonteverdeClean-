import React from 'react';
import { ScheduleItem, Task } from '../types';
import { formatDate } from '../utils/dateUtils';
import { Calendar, UserCheck, AlertCircle, CheckCircle2, Circle, CalendarPlus } from 'lucide-react';

interface Props {
  scheduleItem: ScheduleItem;
  isMyTurn: boolean;
  tasks: Task[];
  completedTasks: Record<string, boolean>;
  onToggleTask: (taskId: string) => void;
}

const CurrentDutyCard: React.FC<Props> = ({ 
  scheduleItem, 
  isMyTurn, 
  tasks, 
  completedTasks, 
  onToggleTask 
}) => {
  
  const completedCount = tasks.filter(t => completedTasks[t.id]).length;
  const progress = Math.round((completedCount / tasks.length) * 100);
  const allCompleted = completedCount === tasks.length;

  const handleAddToCalendar = () => {
    const start = scheduleItem.startDate.toISOString().replace(/-|:|\.\d\d\d/g, "").substring(0, 8);
    // Add 1 day to end date for Google Calendar exclusive end date
    const endDateObj = new Date(scheduleItem.endDate);
    endDateObj.setDate(endDateObj.getDate() + 1);
    const end = endDateObj.toISOString().replace(/-|:|\.\d\d\d/g, "").substring(0, 8);
    
    const title = encodeURIComponent(`Limpeza do Condomínio - Apt ${scheduleItem.apartment.number}`);
    const details = encodeURIComponent(
      `Tarefas da semana:\n${tasks.map(t => `- ${t.label}`).join('\n')}\n\nGerado pelo MonteverdeClean`
    );
    
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}`;
    window.open(url, '_blank');
  };

  return (
    <div className={`
      relative rounded-3xl p-6 md:p-8 shadow-xl transition-all duration-300 transform hover:scale-[1.01] overflow-hidden
      ${isMyTurn 
        ? 'bg-gradient-to-br from-green-500 to-emerald-700 text-white ring-4 ring-green-200' 
        : 'bg-white text-gray-800 border border-gray-100'
      }
    `}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        
        {/* Left Side: Status & Date */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className={`
              px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
              ${isMyTurn ? 'bg-white text-green-700' : 'bg-blue-100 text-blue-700'}
            `}>
              Esta Semana
            </span>
            {isMyTurn && (
              <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-400 text-yellow-900 text-xs font-bold uppercase tracking-wider animate-pulse">
                <AlertCircle size={12} /> É a sua vez!
              </span>
            )}
          </div>
          
          <h2 className={`text-3xl md:text-4xl font-extrabold mb-1 ${isMyTurn ? 'text-white' : 'text-gray-900'}`}>
            Apt. {scheduleItem.apartment.number}
          </h2>
          {scheduleItem.apartment.name && (
            <p className={`text-lg font-medium opacity-90 ${isMyTurn ? 'text-green-50' : 'text-gray-500'}`}>
              {scheduleItem.apartment.name}
            </p>
          )}
        </div>

        {/* Right Side: Date Range */}
        <div className={`
          flex flex-col gap-2 p-4 rounded-2xl w-full md:w-auto
          ${isMyTurn ? 'bg-white/10 backdrop-blur-sm' : 'bg-gray-50'}
        `}>
          <div className="flex items-center gap-4">
            <Calendar size={32} className={isMyTurn ? 'text-green-200' : 'text-blue-500'} />
            <div>
              <p className={`text-xs uppercase font-bold tracking-wider ${isMyTurn ? 'text-green-200' : 'text-gray-400'}`}>
                Período
              </p>
              <p className={`text-xl font-bold ${isMyTurn ? 'text-white' : 'text-gray-800'}`}>
                {formatDate(scheduleItem.startDate)} - {formatDate(scheduleItem.endDate)}
              </p>
            </div>
          </div>
          
          {isMyTurn && (
            <button 
              onClick={handleAddToCalendar}
              className="mt-1 flex items-center justify-center gap-2 w-full py-2 px-3 bg-white/20 hover:bg-white/30 text-white rounded-xl text-sm font-semibold transition-colors"
            >
              <CalendarPlus size={16} />
              Criar Lembrete
            </button>
          )}
          {!isMyTurn && (
             <button 
               onClick={handleAddToCalendar}
               className="mt-1 flex items-center justify-center gap-2 w-full py-2 px-3 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-xl text-sm font-semibold transition-colors"
             >
               <CalendarPlus size={16} />
               Agendar
             </button>
          )}
        </div>
      </div>

      {/* Task Checklist Section */}
      <div className={`
        rounded-2xl p-5 
        ${isMyTurn ? 'bg-black/20 backdrop-blur-md' : 'bg-slate-50 border border-slate-100'}
      `}>
        <div className="flex justify-between items-center mb-4">
          <h3 className={`font-bold text-sm uppercase tracking-wider flex items-center gap-2 ${isMyTurn ? 'text-white/90' : 'text-gray-600'}`}>
            <UserCheck size={18} />
            Checklist de Limpeza
          </h3>
          <span className={`text-sm font-bold ${isMyTurn ? 'text-white' : 'text-blue-600'}`}>
            {completedCount}/{tasks.length}
          </span>
        </div>

        {/* Progress Bar */}
        <div className={`w-full h-2 rounded-full mb-5 ${isMyTurn ? 'bg-white/20' : 'bg-gray-200'}`}>
          <div 
            className={`h-full rounded-full transition-all duration-500 ${isMyTurn ? 'bg-yellow-400' : 'bg-blue-500'}`} 
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="space-y-3">
          {tasks.map((task) => {
            const isCompleted = !!completedTasks[task.id];
            
            return (
              <button
                key={task.id}
                onClick={() => onToggleTask(task.id)}
                className={`
                  w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left group
                  ${isMyTurn 
                    ? 'hover:bg-white/10 text-white' 
                    : 'hover:bg-white bg-white/50 text-gray-700'
                  }
                `}
              >
                <div className={`
                  flex-shrink-0 transition-colors
                  ${isCompleted 
                    ? (isMyTurn ? 'text-yellow-300' : 'text-green-500') 
                    : (isMyTurn ? 'text-white/40' : 'text-gray-300')
                  }
                `}>
                  {isCompleted ? <CheckCircle2 size={24} className="fill-current" /> : <Circle size={24} />}
                </div>
                
                <span className={`
                  flex-1 font-medium text-sm md:text-base transition-all
                  ${isCompleted && 'line-through opacity-60'}
                `}>
                  {task.label}
                </span>
              </button>
            );
          })}
        </div>

        {allCompleted && (
           <div className={`mt-4 text-center text-sm font-bold py-2 ${isMyTurn ? 'text-yellow-300' : 'text-green-600'}`}>
             ✨ Tudo limpo! Ótimo trabalho!
           </div>
        )}
      </div>
    </div>
  );
};

export default CurrentDutyCard;