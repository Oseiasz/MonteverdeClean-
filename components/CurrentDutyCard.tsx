
import React from 'react';
import { ScheduleItem, Task } from '../types';
import { formatDate } from '../utils/dateUtils';
import { Calendar, CheckCircle2, Circle, Clock, MessageSquareText, Lock, AlertCircle, Settings as SettingsIcon } from 'lucide-react';

interface Props {
  scheduleItem: ScheduleItem;
  isMyTurn: boolean;
  tasks: Task[];
  completedTasks: Record<string, boolean>;
  onToggleTask: (taskId: string) => void;
  plannedDay: number | null;
  onSetPlannedDay: (day: number) => void;
  observations: string;
  onUpdateObservations: (text: string) => void;
  isAdmin?: boolean;
}

const DAYS_OF_WEEK = [
  { label: 'Seg', value: 1 },
  { label: 'Ter', value: 2 },
  { label: 'Qua', value: 3 },
  { label: 'Qui', value: 4 },
  { label: 'Sex', value: 5 },
  { label: 'Sáb', value: 6 },
  { label: 'Dom', value: 0 },
];

const CurrentDutyCard: React.FC<Props> = ({ 
  scheduleItem, 
  isMyTurn, 
  tasks, 
  completedTasks, 
  onToggleTask,
  plannedDay,
  onSetPlannedDay,
  observations,
  onUpdateObservations,
  isAdmin = false
}) => {
  const completedCount = tasks.filter(t => completedTasks[t.id]).length;
  const allCompleted = completedCount === tasks.length;

  return (
    <div className={`
      border rounded-3xl p-8 transition-all duration-300 shadow-xl
      ${isMyTurn ? 'border-blue-600 bg-blue-50/30' : 'border-gray-100 bg-white'}
    `}>
      <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-10">
        <div>
          <div className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">
            Apartamento Responsável
          </div>
          <h3 className="text-5xl font-black text-gray-900 mb-1">
            Nº {scheduleItem.apartment.number}
          </h3>
          <p className="text-blue-600 font-bold text-lg">
            {scheduleItem.apartment.name || 'Limpeza Coletiva'}
          </p>
        </div>

        <div className="text-left md:text-right bg-white p-4 rounded-2xl shadow-inner border border-gray-50">
          <div className="flex items-center gap-2 text-gray-400 mb-1 md:justify-end">
            <Calendar size={14} />
            <span className="text-xs font-black uppercase tracking-widest">Semana</span>
          </div>
          <p className="text-xl font-black text-gray-800">
            {formatDate(scheduleItem.startDate)} — {formatDate(scheduleItem.endDate)}
          </p>
        </div>
      </div>

      {isMyTurn && !allCompleted && (
        <div className="mb-10 p-5 bg-white rounded-3xl border border-blue-100 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Clock size={18} className="text-blue-600" />
            <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest">Agendar Dia da Limpeza</h4>
          </div>
          <div className="grid grid-cols-7 gap-2">
            {DAYS_OF_WEEK.map((day) => (
              <button
                key={day.value}
                onClick={() => onSetPlannedDay(day.value)}
                className={`
                  py-3 rounded-xl text-xs font-black transition-all border-2
                  ${plannedDay === day.value 
                    ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200' 
                    : 'bg-gray-50 border-transparent text-gray-400 hover:bg-gray-100'}
                `}
              >
                {day.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between mb-2">
           <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Checklist Semanal</h4>
           <div className="flex items-center gap-2">
             {!isAdmin && completedCount > 0 && (
               <span className="text-[10px] font-bold text-red-400 flex items-center gap-1 uppercase tracking-tighter bg-red-50 px-2 py-0.5 rounded">
                 <Lock size={10}/> Trava Ativa
               </span>
             )}
             <span className="text-xs font-black text-blue-600">{completedCount}/{tasks.length} Concluídas</span>
           </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {tasks.map((task) => {
            const isCompleted = !!completedTasks[task.id];
            const cannotUncheck = isCompleted && !isAdmin;

            return (
              <button
                key={task.id}
                onClick={() => onToggleTask(task.id)}
                disabled={cannotUncheck}
                className={`
                  task-button flex items-center gap-4 p-5 rounded-2xl border-2 text-left group
                  ${isCompleted 
                    ? 'completed bg-green-50 border-green-100 shadow-sm' 
                    : 'bg-white border-gray-100 text-gray-700 hover:border-blue-300 hover:shadow-md'}
                  ${cannotUncheck ? 'cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                <div className="shrink-0 relative">
                  {isCompleted ? (
                    <CheckCircle2 size={24} className="text-green-500" />
                  ) : (
                    <Circle size={24} className="text-gray-200 group-hover:text-blue-300" />
                  )}
                  {cannotUncheck && (
                    <div className="absolute -top-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
                       <Lock size={8} className="text-gray-400" />
                    </div>
                  )}
                </div>
                <span className={`task-text font-bold text-sm ${isCompleted ? 'completed' : ''}`}>
                  {task.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-8">
        <div className="flex items-center gap-2 mb-3">
          <MessageSquareText size={18} className="text-gray-400" />
          <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Observações ou Feedback</h4>
        </div>
        
        {isMyTurn ? (
          <div className="relative group">
            <textarea
              value={observations}
              onChange={(e) => onUpdateObservations(e.target.value)}
              placeholder="Ex: Lâmpada do corredor queimada, falta desinfetante..."
              className="w-full min-h-[140px] p-5 rounded-2xl border-2 border-blue-100 outline-none transition-all font-bold text-sm bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 placeholder:text-gray-300 shadow-sm"
            />
            <div className="absolute bottom-3 right-3 opacity-30 group-focus-within:opacity-100 transition-opacity">
              <span className="text-[10px] font-black uppercase text-blue-600 tracking-widest">Modo Edição</span>
            </div>
          </div>
        ) : (
          <div className="group relative">
            <div className={`
              w-full min-h-[120px] p-6 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center text-center transition-all
              ${scheduleItem.isCurrentWeek ? 'bg-amber-50 border-amber-200' : 'bg-gray-50 border-gray-100'}
            `}>
              {observations ? (
                <p className="text-gray-600 font-bold italic text-sm leading-relaxed">
                  "{observations}"
                </p>
              ) : (
                <>
                  <AlertCircle size={20} className="text-amber-400 mb-2" />
                  <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">
                    {scheduleItem.isCurrentWeek ? "Selecione seu apartamento nas configurações para editar" : "Nenhuma observação registrada"}
                  </p>
                </>
              )}
            </div>
          </div>
        )}
        
        {!isMyTurn && scheduleItem.isCurrentWeek && (
           <p className="mt-4 text-[10px] font-black text-amber-600 uppercase tracking-widest text-center flex items-center justify-center gap-2">
             <Lock size={10}/> Somente o responsável desta semana pode editar.
           </p>
        )}
      </div>

      {allCompleted && (
        <div className="mt-8 pt-6 border-t border-dashed border-green-200 text-center animate-slide-up-fade">
           <p className="text-green-600 font-black flex items-center justify-center gap-2 text-sm">
             ✨ Limpeza realizada com sucesso! Parabéns!
           </p>
        </div>
      )}
    </div>
  );
};

export default CurrentDutyCard;
