import React from 'react';
import { ScheduleItem, Task } from '../types';
import { formatDate } from '../utils/dateUtils';
import { Calendar, CheckCircle2, Circle, Clock, MessageSquareText } from 'lucide-react';

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
  onUpdateObservations
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
          <p className="text-[10px] text-gray-400 font-bold mt-3 text-center uppercase tracking-tighter">
            {plannedDay !== null 
              ? `Você planejou limpar na ${DAYS_OF_WEEK.find(d => d.value === plannedDay)?.label}-feira.` 
              : 'Selecione um dia para ser lembrado.'}
          </p>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between mb-2">
           <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Checklist Semanal</h4>
           <span className="text-xs font-black text-blue-600">{completedCount}/{tasks.length} Concluídas</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {tasks.map((task) => {
            const isCompleted = !!completedTasks[task.id];
            return (
              <button
                key={task.id}
                onClick={() => onToggleTask(task.id)}
                className={`
                  flex items-center gap-4 p-5 rounded-2xl border-2 transition-all text-left group
                  ${isCompleted 
                    ? 'bg-green-50 border-green-100 text-green-700 opacity-60' 
                    : 'bg-white border-gray-100 text-gray-700 hover:border-blue-300 hover:shadow-md'}
                `}
              >
                {isCompleted ? (
                  <CheckCircle2 size={24} className="text-green-500 shrink-0" />
                ) : (
                  <Circle size={24} className="text-gray-200 group-hover:text-blue-300 shrink-0" />
                )}
                <span className={`font-bold text-sm ${isCompleted ? 'line-through' : ''}`}>
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
        <textarea
          value={observations}
          onChange={(e) => onUpdateObservations(e.target.value)}
          placeholder={isMyTurn ? "Ex: Lâmpada do corredor queimada, falta desinfetante..." : "Nenhuma observação registrada."}
          disabled={!isMyTurn}
          className={`
            w-full min-h-[100px] p-4 rounded-2xl border-2 outline-none transition-all font-medium text-sm
            ${isMyTurn 
              ? 'bg-white border-gray-100 focus:border-blue-300 focus:shadow-md' 
              : 'bg-gray-50/50 border-transparent text-gray-500 cursor-default resize-none'}
          `}
        />
      </div>

      {allCompleted && (
        <div className="mt-8 pt-6 border-t border-dashed border-green-200 text-center animate-slide-up-fade">
           <p className="text-green-600 font-black flex items-center justify-center gap-2">
             ✨ Limpeza realizada com sucesso!
           </p>
        </div>
      )}
    </div>
  );
};

export default CurrentDutyCard;