import React from 'react';
import { ScheduleItem } from '../types';
import { formatDate } from '../utils/dateUtils';
import { CalendarDays, ArrowRight, CalendarPlus, Download } from 'lucide-react';

interface Props {
  schedule: ScheduleItem[];
  myApartmentId: string | null;
}

const ScheduleList: React.FC<Props> = ({ schedule, myApartmentId }) => {
  // Group by Month
  const groupedSchedule: Record<string, ScheduleItem[]> = {};
  
  schedule.forEach(item => {
    // Get month name "Janeiro 2026"
    const monthKey = item.startDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    // Capitalize first letter
    const formattedKey = monthKey.charAt(0).toUpperCase() + monthKey.slice(1);
    
    if (!groupedSchedule[formattedKey]) {
      groupedSchedule[formattedKey] = [];
    }
    groupedSchedule[formattedKey].push(item);
  });

  const handleAddToCalendar = (item: ScheduleItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const start = item.startDate.toISOString().replace(/-|:|\.\d\d\d/g, "").substring(0, 8);
    const endDateObj = new Date(item.endDate);
    endDateObj.setDate(endDateObj.getDate() + 1);
    const end = endDateObj.toISOString().replace(/-|:|\.\d\d\d/g, "").substring(0, 8);
    
    const title = encodeURIComponent(`Limpeza do Condomínio - Apt ${item.apartment.number}`);
    const details = encodeURIComponent(
      `Lembrete: Semana de limpeza das áreas comuns. Responsável: Apt ${item.apartment.number}.\n\nGerado pelo MonteverdeClean`
    );
    
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}`;
    window.open(url, '_blank');
  };

  const handleDownloadFullSchedule = () => {
    // Basic ICS file generation
    let icsContent = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//MonteverdeClean//Schedule//PT\nCALSCALE:GREGORIAN\nMETHOD:PUBLISH\n";

    schedule.forEach(item => {
      // Only add events for my apartment if selected, otherwise add all?
      // User asked for "automatic reminder", usually implies their own. 
      // But let's add logic: if myApartmentId is set, only download mine. If not, download all.
      
      if (myApartmentId && item.apartment.id !== myApartmentId) return;

      const start = item.startDate.toISOString().replace(/-|:|\.\d\d\d/g, "").substring(0, 8);
      const endDateObj = new Date(item.endDate);
      endDateObj.setDate(endDateObj.getDate() + 1);
      const end = endDateObj.toISOString().replace(/-|:|\.\d\d\d/g, "").substring(0, 8);
      
      const aptName = item.apartment.number;
      
      icsContent += "BEGIN:VEVENT\n";
      icsContent += `DTSTART;VALUE=DATE:${start}\n`;
      icsContent += `DTEND;VALUE=DATE:${end}\n`;
      icsContent += `SUMMARY:Limpeza Condomínio (Apt ${aptName})\n`;
      icsContent += `DESCRIPTION:Lembrete de limpeza das áreas comuns.\n`;
      icsContent += "END:VEVENT\n";
    });

    icsContent += "END:VCALENDAR";

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'escala_limpeza_2026.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
            <CalendarDays className="text-blue-500" size={20} />
            <h3 className="font-bold text-gray-900 text-lg">Cronograma Definitivo 2026</h3>
        </div>
        {myApartmentId && (
            <button 
                onClick={handleDownloadFullSchedule}
                className="flex items-center gap-2 text-xs font-bold bg-blue-50 text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-100 transition-colors"
            >
                <Download size={14} />
                Baixar Minha Escala 2026
            </button>
        )}
      </div>
      
      <div className="max-h-[600px] overflow-y-auto">
        {Object.entries(groupedSchedule).map(([month, items]) => (
          <div key={month}>
            <div className="bg-gray-50 px-5 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider sticky top-0 z-10 border-y border-gray-100">
              {month}
            </div>
            <div className="divide-y divide-gray-100">
              {items.map((item, idx) => {
                const isMe = myApartmentId === item.apartment.id;
                
                return (
                  <div 
                    key={idx} 
                    className={`
                      p-4 flex items-center justify-between transition-colors
                      ${isMe ? 'bg-green-50/50' : 'hover:bg-gray-50'}
                    `}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-6">
                      <div className="text-sm font-bold text-gray-900 w-32">
                        {formatDate(item.startDate)} - {formatDate(item.endDate)}
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className={`
                          w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-sm
                          ${isMe ? 'bg-green-600 text-white' : 'bg-white border-2 border-gray-200 text-gray-700'}
                        `}>
                          {item.apartment.number}
                        </div>
                        <div className="flex flex-col">
                          <span className={`font-bold ${isMe ? 'text-green-700' : 'text-gray-900'}`}>
                            {item.apartment.name || `Apartamento ${item.apartment.number}`}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => handleAddToCalendar(item, e)}
                        className={`p-2 rounded-full transition-colors ${
                          isMe 
                            ? 'text-green-600 hover:bg-green-100' 
                            : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'
                        }`}
                        title="Adicionar lembrete à agenda"
                      >
                        <CalendarPlus size={18} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScheduleList;