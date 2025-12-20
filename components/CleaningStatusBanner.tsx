import React from 'react';
import { AlertTriangle, CheckCircle, Clock, AlertCircle, Ban, CalendarCheck, Zap } from 'lucide-react';

interface Props {
  completedCount: number;
  totalTasks: number;
  isMyTurn: boolean;
  isPreCycle: boolean;
  plannedDay: number | null;
}

const DAYS_NAMES = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

const CleaningStatusBanner: React.FC<Props> = ({ completedCount, totalTasks, isMyTurn, isPreCycle, plannedDay }) => {
  if (isPreCycle) return null;

  const isCompleted = completedCount === totalTasks;
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Domingo
  
  const isDeadlineDay = dayOfWeek === 0;
  const isApproachingDeadline = dayOfWeek === 5 || dayOfWeek === 6; // Sexta ou Sábado

  if (isCompleted) {
    return (
      <div key="status-completed" className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-4 animate-slide-up-fade shadow-sm">
        <div className="bg-green-500 p-2 rounded-full text-white">
          <CheckCircle size={20} />
        </div>
        <div>
          <h4 className="text-green-900 font-black text-sm uppercase tracking-tight">Limpeza Concluída!</h4>
          <p className="text-green-700 text-xs font-medium">O condomínio está impecável. Ótimo trabalho!</p>
        </div>
      </div>
    );
  }

  if (isDeadlineDay && !isCompleted) {
    return (
      <div key="status-deadline" className="bg-red-700 border-4 border-red-950 rounded-3xl p-5 flex flex-col gap-4 animate-pulse shadow-[0_0_30px_rgba(220,38,38,0.5)] ring-4 ring-red-500/20">
        <div className="flex items-center gap-4">
          <div className="bg-white p-3 rounded-2xl text-red-700 shadow-xl">
            <Ban size={32} strokeWidth={3} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-red-100 text-red-800 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-[0.2em] flex items-center gap-1">
                <Zap size={10} fill="currentColor" /> URGENTE
              </span>
              <h4 className="text-white font-black text-xl uppercase tracking-tighter leading-none">CONDOMÍNIO NÃO LIMPO</h4>
            </div>
            <p className="text-red-100 font-bold text-xs leading-tight">
              Hoje é domingo! O ciclo de limpeza se encerra em poucas horas.
            </p>
          </div>
        </div>
        
        <div className="bg-black/20 rounded-xl p-3 border border-white/10">
          <p className="text-[10px] font-black text-red-200 uppercase tracking-widest mb-1">Ação Sugerida:</p>
          <div className="text-white text-sm font-black flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-white animate-ping"></div>
            {isMyTurn ? "FINALIZAR E MARCAR CHECKLIST AGORA" : "NOTIFICAR RESPONSÁVEL DO APT"}
          </div>
        </div>
      </div>
    );
  }

  if (plannedDay === dayOfWeek && !isCompleted) {
    return (
      <div key="status-planned-today" className="bg-blue-600 border border-blue-700 rounded-2xl p-4 flex items-center gap-4 animate-slide-up-fade shadow-md">
        <div className="bg-white p-2 rounded-full text-blue-600">
          <CalendarCheck size={20} />
        </div>
        <div>
          <h4 className="text-white font-black text-sm uppercase tracking-tight">Dia Planejado</h4>
          <p className="text-blue-50 text-xs font-medium">
            {isMyTurn 
              ? "Você marcou hoje como dia de limpeza. Vamos lá?" 
              : "O responsável agendou a limpeza para o dia de hoje."}
          </p>
        </div>
      </div>
    );
  }

  if (isApproachingDeadline && !isCompleted) {
    return (
      <div key="status-warning" className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-4 animate-slide-up-fade shadow-sm">
        <div className="bg-amber-500 p-2 rounded-full text-white">
          <AlertCircle size={20} />
        </div>
        <div>
          <h4 className="text-amber-900 font-black text-sm uppercase tracking-tight">Prazo Próximo</h4>
          <p className="text-amber-700 text-xs font-medium">
            {plannedDay !== null && plannedDay > dayOfWeek 
              ? `Limpeza agendada para ${DAYS_NAMES[plannedDay]}.`
              : "Lembrete: Conclua todas as tarefas até domingo."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div key="status-normal" className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-center gap-4 animate-slide-up-fade shadow-sm opacity-90">
      <div className="bg-blue-500 p-2 rounded-full text-white">
        <Clock size={20} />
      </div>
      <div>
        <h4 className="text-blue-900 font-black text-sm uppercase tracking-tight">Limpeza em Andamento</h4>
        <p className="text-blue-700 text-xs font-medium">
          {plannedDay !== null 
            ? `Agendado para ${DAYS_NAMES[plannedDay]}.` 
            : "O checklist está sendo atualizado. Prazo: Domingo."}
        </p>
      </div>
    </div>
  );
};

export default CleaningStatusBanner;