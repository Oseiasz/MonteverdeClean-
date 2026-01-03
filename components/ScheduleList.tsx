
import React, { useState } from 'react';
import { ScheduleItem, Apartment } from '../types';
import { formatDate } from '../utils/dateUtils';
import { CalendarDays, Filter, ChevronRight, LayoutGrid, Calendar as CalendarIcon, List, Info, X } from 'lucide-react';

interface Props {
  schedule: ScheduleItem[];
  apartments: Apartment[];
  myApartmentId: string | null;
}

type ViewMode = 'upcoming' | 'month' | 'year';

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

const ScheduleList: React.FC<Props> = ({ schedule, apartments, myApartmentId }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('upcoming');
  const [filterAptId, setFilterAptId] = useState<string | 'all'>('all');
  const [selectedWeek, setSelectedWeek] = useState<ScheduleItem | null>(null);

  const filteredSchedule = schedule.filter(item => {
    const matchesApt = filterAptId === 'all' || item.apartment.id === filterAptId;
    if (viewMode === 'upcoming') return matchesApt; 
    if (viewMode === 'month') {
      const today = new Date();
      return matchesApt && item.startDate.getMonth() === today.getMonth() && item.startDate.getFullYear() === today.getFullYear();
    }
    return matchesApt;
  });

  const displayItems = viewMode === 'upcoming' ? filteredSchedule.slice(0, 8) : filteredSchedule;

  const groupedByMonth: Record<string, ScheduleItem[]> = {};
  if (viewMode === 'year') {
    displayItems.forEach(item => {
      const monthName = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(item.startDate);
      if (!groupedByMonth[monthName]) groupedByMonth[monthName] = [];
      groupedByMonth[monthName].push(item);
    });
  }

  const renderItem = (item: ScheduleItem, idx: number) => {
    const isMe = myApartmentId === item.apartment.id;
    const highlightStyle = getAptHighlightStyle(item.apartment.number);
    
    return (
      <button 
        key={`${item.startDate.toISOString()}-${idx}`} 
        onClick={() => setSelectedWeek(item)}
        className={`
          w-full text-left p-4 flex items-center justify-between rounded-2xl border transition-all animate-slide-up-fade active:scale-[0.98]
          ${isMe ? `${highlightStyle} shadow-sm border-2` : 'bg-white border-gray-100 text-gray-600 hover:border-gray-300'}
        `}
        style={{ animationDelay: `${idx * 0.05}s` }}
      >
        <div className="flex items-center gap-4">
          <div className="flex flex-col min-w-[60px]">
            <span className={`text-[9px] font-black uppercase tracking-tighter ${isMe ? 'opacity-70' : 'text-gray-400'}`}>
              Início
            </span>
            <span className="text-sm font-black">
              {formatDate(item.startDate)}
            </span>
          </div>
          <div className="h-8 w-px bg-current opacity-10"></div>
          <div className="flex flex-col">
             <span className={`text-base font-black ${isMe ? '' : 'text-gray-900'}`}>
               Apt {item.apartment.number}
             </span>
             <span className="text-[10px] font-bold opacity-60 truncate max-w-[120px]">
               {item.apartment.name || 'Pendente'}
             </span>
          </div>
        </div>
        
        <ChevronRight size={16} className="opacity-20" />
      </button>
    );
  };

  return (
    <div className="space-y-6">
      {/* Detalhes da Semana Modal/Overlay */}
      {selectedWeek && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
           <div className="bg-white rounded-3xl p-6 shadow-2xl w-full max-w-xs animate-slide-up-fade border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h5 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Detalhamento da Limpeza</h5>
                <button onClick={() => setSelectedWeek(null)} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                   <X size={18} />
                </button>
              </div>
              
              <div className="space-y-4">
                 <div className="bg-blue-600 p-6 rounded-2xl text-center shadow-lg shadow-blue-100">
                    <p className="text-[10px] font-black text-blue-200 uppercase tracking-widest mb-1">Responsável da Semana</p>
                    <p className="text-3xl font-black text-white">Apt {selectedWeek.apartment.number}</p>
                    <p className="text-sm font-bold text-blue-100 mt-1">{selectedWeek.apartment.name || 'Residente do Condomínio'}</p>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 p-4 rounded-2xl text-center border border-gray-100">
                       <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Data Início</p>
                       <p className="text-sm font-black text-gray-800">{formatDate(selectedWeek.startDate)}/26</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-2xl text-center border border-gray-100">
                       <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Data Término</p>
                       <p className="text-sm font-black text-gray-800">{formatDate(selectedWeek.endDate)}/26</p>
                    </div>
                 </div>
              </div>

              <button 
                onClick={() => setSelectedWeek(null)}
                className="w-full mt-6 py-4 bg-gray-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest active:scale-95 transition-all shadow-xl"
              >
                Fechar Detalhes
              </button>
           </div>
        </div>
      )}

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarDays size={18} className="text-blue-500" />
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Escala de Manutenção 2026</h3>
          </div>
        </div>

        <div className="flex p-1 bg-gray-100 rounded-xl">
          <button 
            onClick={() => setViewMode('upcoming')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${viewMode === 'upcoming' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <List size={14} /> Em Breve
          </button>
          <button 
            onClick={() => setViewMode('month')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${viewMode === 'month' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <CalendarIcon size={14} /> Deste Mês
          </button>
          <button 
            onClick={() => setViewMode('year')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${viewMode === 'year' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <LayoutGrid size={14} /> Ano Todo
          </button>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <div className="flex-shrink-0 p-2 text-gray-400">
            <Filter size={14} />
          </div>
          <button 
            onClick={() => setFilterAptId('all')}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-[10px] font-black uppercase transition-all ${filterAptId === 'all' ? 'bg-black text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
          >
            Todos
          </button>
          {apartments.map(apt => (
            <button 
              key={apt.id}
              onClick={() => setFilterAptId(apt.id)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-[10px] font-black uppercase transition-all ${filterAptId === apt.id ? 'bg-blue-600 text-white shadow-md shadow-blue-100' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
            >
              Apt {apt.number}
            </button>
          ))}
        </div>
      </div>
      
      <div className="space-y-4">
        {viewMode === 'year' ? (
          Object.entries(groupedByMonth).map(([month, items]) => (
            <div key={month} className="space-y-2">
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2 mt-4 flex items-center gap-2">
                <ChevronRight size={12} className="text-blue-500" /> {month}
              </h4>
              <div className="space-y-2">
                {items.map((item, idx) => renderItem(item, idx))}
              </div>
            </div>
          ))
        ) : (
          <div className="space-y-2">
            {displayItems.length > 0 ? (
              displayItems.map((item, idx) => renderItem(item, idx))
            ) : (
              <div className="py-12 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <p className="text-gray-400 font-bold text-sm uppercase tracking-widest">Nenhuma escala encontrada.</p>
              </div>
            )}
          </div>
        )}
      </div>

      <p className="text-[9px] text-gray-400 font-bold flex items-center justify-center gap-2 mt-4 uppercase">
         <Info size={10} /> Toque em uma semana para ver o período completo
      </p>
    </div>
  );
};

export default ScheduleList;
