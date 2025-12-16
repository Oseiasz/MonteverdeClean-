import React, { useState, useEffect } from 'react';
import { Settings, Home, BellRing } from 'lucide-react';
import { AppSettings, Apartment, ScheduleItem, Task } from './types';
import { generateSchedule, generatePastSchedule } from './utils/dateUtils';
import CurrentDutyCard from './components/CurrentDutyCard';
import ScheduleList from './components/ScheduleList';
import HistoryList from './components/HistoryList';
import SettingsModal from './components/SettingsModal';
import CleaningTip from './components/CleaningTip';
import ReminderToast from './components/ReminderToast';

// Default configuration
const DEFAULT_APARTMENTS: Apartment[] = [
  { id: '1', number: '101', name: '' },
  { id: '2', number: '102', name: '' },
  { id: '3', number: '201', name: '' },
  { id: '4', number: '202', name: '' },
  { id: '5', number: '301', name: '' },
  { id: '6', number: '302', name: '' },
];

const DEFAULT_TASKS: Task[] = [
  { id: 'stairs_corridor', label: 'Limpar Corredor e Escadas' },
  { id: 'garage', label: 'Limpar Garagem' },
  { id: 'bbq', label: 'Limpar Área da Churrasqueira' },
];

const App: React.FC = () => {
  // State initialization with localStorage persistence
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('condoCleanSettings_2026');
    return saved ? JSON.parse(saved) : {
      apartments: DEFAULT_APARTMENTS,
      // Defaulting to the first Monday of 2026
      cycleStartDate: '2026-01-05',
      myApartmentId: null,
    };
  });

  const [yearSchedule, setYearSchedule] = useState<ScheduleItem[]>([]);
  const [currentDutyItem, setCurrentDutyItem] = useState<ScheduleItem | null>(null);
  const [historySchedule, setHistorySchedule] = useState<ScheduleItem[]>([]);
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({});
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // Update schedule whenever settings change
  useEffect(() => {
    // 1. Generate the Full Year Schedule for 2026 (List View)
    const fullYearList = generateSchedule(
      settings.apartments, 
      settings.cycleStartDate, 
      53, 
      new Date(settings.cycleStartDate)
    );
    setYearSchedule(fullYearList);

    // 2. Generate the "Current Duty" item based on TODAY's date
    const todaySchedule = generateSchedule(settings.apartments, settings.cycleStartDate, 1);
    const todayItem = todaySchedule[0];
    setCurrentDutyItem(todayItem);

    // 3. Generate History
    const newHistory = generatePastSchedule(settings.apartments, settings.cycleStartDate, 4);
    setHistorySchedule(newHistory);
    
    localStorage.setItem('condoCleanSettings_2026', JSON.stringify(settings));

    // 4. AUTOMATIC NOTIFICATION LOGIC
    if (todayItem && settings.myApartmentId === todayItem.apartment.id) {
        // A. Show In-App Toast
        setShowToast(true);

        // B. Try Browser System Notification
        if ("Notification" in window && Notification.permission === "granted") {
            new Notification("Lembrete MonteverdeClean", {
                body: `Olá Apt ${todayItem.apartment.number}, é sua semana de limpeza!`,
                icon: "/favicon.ico"
            });
        } else if ("Notification" in window && Notification.permission !== "denied") {
            // Can't request without gesture, but good to check status
        }
    }
  }, [settings]);

  // Load completed tasks for the specific current week
  useEffect(() => {
    if (currentDutyItem) {
      const weekKey = `tasks_${currentDutyItem.startDate.toISOString().split('T')[0]}`;
      const savedTasks = localStorage.getItem(weekKey);
      
      if (savedTasks) {
        setCompletedTasks(JSON.parse(savedTasks));
      } else {
        setCompletedTasks({});
      }
    }
  }, [currentDutyItem]);

  const handleToggleTask = (taskId: string) => {
    if (!currentDutyItem) return;

    const newCompleted = {
      ...completedTasks,
      [taskId]: !completedTasks[taskId]
    };
    
    setCompletedTasks(newCompleted);
    const weekKey = `tasks_${currentDutyItem.startDate.toISOString().split('T')[0]}`;
    localStorage.setItem(weekKey, JSON.stringify(newCompleted));
  };

  const requestNotificationPermission = () => {
    if ("Notification" in window) {
      Notification.requestPermission().then(permission => {
        if (permission === "granted" && currentDutyItem && settings.myApartmentId === currentDutyItem.apartment.id) {
           new Notification("Notificações Ativadas!", {
             body: "Você será avisado automaticamente na sua vez."
           });
        }
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-12">
      {/* Automatic Reminder Toast */}
      <ReminderToast 
        isVisible={showToast} 
        onClose={() => setShowToast(false)} 
        apartmentNumber={currentDutyItem?.apartment.number || ''}
      />

      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 bg-opacity-80 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Home className="text-white" size={20} />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900">
              Monteverde<span className="text-blue-600">Clean</span> <span className="text-gray-400 font-light ml-2">2026</span>
            </h1>
          </div>
          <div className="flex gap-2">
             <button
               onClick={requestNotificationPermission}
               className="p-2 text-gray-500 hover:text-yellow-600 hover:bg-yellow-50 rounded-full transition-all"
               title="Ativar Notificações Automáticas"
             >
               <BellRing size={24} />
             </button>
             <button 
               onClick={() => setIsSettingsOpen(true)}
               className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all"
               aria-label="Configurações"
             >
               <Settings size={24} />
             </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        
        {/* Intro */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Cronograma 2026</h2>
            <p className="text-gray-500">Acompanhe a rotação oficial de limpeza para o ano.</p>
          </div>
        </div>

        {/* Hero Card - Shows active/current duty based on real time */}
        {currentDutyItem && (
          <div className="mb-8">
             <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1">Status Atual (Tempo Real)</div>
             <CurrentDutyCard 
               scheduleItem={currentDutyItem} 
               isMyTurn={settings.myApartmentId === currentDutyItem.apartment.id}
               tasks={DEFAULT_TASKS}
               completedTasks={completedTasks}
               onToggleTask={handleToggleTask}
             />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main List - Full 2026 Year */}
          <div className="md:col-span-2">
            <ScheduleList 
              schedule={yearSchedule} 
              myApartmentId={settings.myApartmentId} 
            />
            
            <HistoryList 
              history={historySchedule}
              totalTasks={DEFAULT_TASKS.length}
            />
          </div>

          {/* Sidebar / AI Tip */}
          <div className="md:col-span-1 space-y-6">
             <CleaningTip />
             
             <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
                <h4 className="font-bold text-blue-800 mb-2 text-sm uppercase tracking-wide">Rotação 2026</h4>
                <p className="text-sm text-blue-700/80 leading-relaxed mb-4">
                  O ciclo de 2026 foi configurado para iniciar em <strong>05 de Janeiro</strong>.
                </p>
                <p className="text-sm text-blue-700/80 leading-relaxed">
                  A rotação segue a ordem: Apt 101 → 102 → 201 → 202 → 301 → 302.
                </p>
                <div className="mt-4 pt-4 border-t border-blue-200">
                    <p className="text-xs font-bold text-blue-900 mb-1">DICA DE USO:</p>
                    <p className="text-xs text-blue-700">
                        Clique no ícone de sino <BellRing size={12} className="inline"/> no topo para permitir avisos automáticos no celular.
                    </p>
                </div>
             </div>
          </div>
        </div>

      </main>

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        settings={settings}
        onSave={setSettings}
      />
    </div>
  );
};

export default App;