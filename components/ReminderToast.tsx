import React, { useEffect, useState } from 'react';
import { Bell, X, CalendarCheck, AlertOctagon } from 'lucide-react';

interface Props {
  isVisible: boolean;
  onClose: () => void;
  apartmentNumber: string;
  plannedDay: number | null;
  tasksCompleted: boolean;
  isCritical?: boolean;
}

const DAYS_NAMES = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

const ReminderToast: React.FC<Props> = ({ isVisible, onClose, apartmentNumber, plannedDay, tasksCompleted, isCritical }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isVisible && !tasksCompleted) {
      const timer = setTimeout(() => setShow(true), 1500);
      return () => clearTimeout(timer);
    } else if (!isVisible || tasksCompleted) {
      setShow(false);
    }
  }, [isVisible, tasksCompleted]);

  if (!isVisible && !show) return null;

  const today = new Date().getDay();
  const isPlannedDayToday = plannedDay === today;

  return (
    <div 
      className={`
        fixed top-4 right-4 z-50 max-w-sm w-full rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border-l-8 p-6
        transform transition-all duration-700 cubic-bezier(0.175, 0.885, 0.32, 1.275)
        ${show ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-24 opacity-0 scale-90'}
        ${isCritical ? 'bg-red-900 border-red-500 text-white' : 'bg-white border-yellow-400'}
        ${!isCritical && isPlannedDayToday ? 'border-blue-600' : ''}
      `}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-2xl mt-1 ${
            isCritical ? 'bg-red-800 text-red-200' : 
            isPlannedDayToday ? 'bg-blue-100 text-blue-600' : 'bg-yellow-100 text-yellow-600'
          }`}>
            {isCritical ? <AlertOctagon size={24} className="animate-spin-slow" /> : 
             isPlannedDayToday ? <CalendarCheck size={22} className="animate-pulse" /> : <Bell size={22} className="animate-bounce" />}
          </div>
          <div>
            <h4 className={`font-black text-sm uppercase tracking-[0.2em] ${isCritical ? 'text-red-200' : 'text-gray-900'}`}>
              {isCritical ? 'PRAZO FINAL EXPIROU' : isPlannedDayToday ? 'DIA DE LIMPEZA!' : 'LEMBRETE SEMANAL'}
            </h4>
            <p className={`text-sm mt-1 leading-relaxed font-medium ${isCritical ? 'text-red-50' : 'text-gray-600'}`}>
              Olá <strong>Apt {apartmentNumber}</strong>! <br/>
              {isCritical 
                ? "Hoje é DOMINGO e a limpeza ainda não foi concluída. Por favor, finalize as tarefas agora!"
                : isPlannedDayToday 
                  ? "Hoje é o dia que você agendou para a limpeza. Mãos à obra!"
                  : plannedDay !== null 
                    ? `Sua limpeza está planejada para ${DAYS_NAMES[plannedDay]}.`
                    : "Esta é a sua semana. Não esqueça de realizar as tarefas."}
            </p>
          </div>
        </div>
        <button 
          onClick={() => { setShow(false); setTimeout(onClose, 500); }}
          className={`transition-colors ${isCritical ? 'text-red-300 hover:text-white' : 'text-gray-300 hover:text-gray-600'}`}
        >
          <X size={20} />
        </button>
      </div>
      
      {isCritical && (
        <div className="mt-4 pt-4 border-t border-red-800/50">
          <button 
             onClick={() => { setShow(false); setTimeout(onClose, 500); }}
             className="w-full bg-red-600 hover:bg-red-500 text-white font-black py-2 rounded-xl text-xs uppercase tracking-widest transition-all"
          >
            Vou fazer agora
          </button>
        </div>
      )}
    </div>
  );
};

export default ReminderToast;