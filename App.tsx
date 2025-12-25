
import React, { useState, useEffect, useRef } from 'react';
import { Settings, Home, BellRing, Info, Bell, BellOff, CheckCircle } from 'lucide-react';
import { AppSettings, Apartment, ScheduleItem, Task } from './types';
import { generateSchedule, generatePastSchedule } from './utils/dateUtils';
import CurrentDutyCard from './components/CurrentDutyCard';
import ScheduleList from './components/ScheduleList';
import HistoryList from './components/HistoryList';
import SettingsModal from './components/SettingsModal';
import CleaningTip from './components/CleaningTip';
import ReminderToast from './components/ReminderToast';
import CleaningStatusBanner from './components/CleaningStatusBanner';

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
  { id: 'trash_house', label: 'Limpar a Casinha do Lixo' },
];

const App: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('condoCleanSettings_v2');
    return saved ? JSON.parse(saved) : {
      apartments: DEFAULT_APARTMENTS,
      cycleStartDate: '2025-01-06',
      myApartmentId: null,
    };
  });

  const [yearSchedule, setYearSchedule] = useState<ScheduleItem[]>([]);
  const [currentDutyItem, setCurrentDutyItem] = useState<ScheduleItem | null>(null);
  const [historySchedule, setHistorySchedule] = useState<ScheduleItem[]>([]);
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({});
  const [plannedDay, setPlannedDay] = useState<number | null>(null);
  const [observations, setObservations] = useState<string>("");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [isPreCycle, setIsPreCycle] = useState(false);
  
  // Estado para notificações
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>('default');
  
  // Ref para evitar disparos duplicados de notificação de conclusão na mesma sessão
  const hasNotifiedCompletion = useRef<string | null>(null);

  useEffect(() => {
    if ('Notification' in window) {
      setNotifPermission(Notification.permission);
    }
  }, []);

  const handleRequestNotification = async () => {
    if (!('Notification' in window)) return;
    
    const permission = await Notification.requestPermission();
    setNotifPermission(permission);
    
    if (permission === 'granted') {
      new Notification("MonteverdeClean", {
        body: "Notificações ativadas! Avisaremos quando chegar sua vez e quando a limpeza for concluída.",
        icon: "https://cdn-icons-png.flaticon.com/512/3119/3119338.png"
      });
    }
  };

  useEffect(() => {
    try {
      const cycleStart = new Date(settings.cycleStartDate);
      const today = new Date();
      today.setHours(0,0,0,0);

      const fullYearList = generateSchedule(settings.apartments, settings.cycleStartDate, 52, cycleStart);
      setYearSchedule(fullYearList);

      if (today < cycleStart) {
        setIsPreCycle(true);
        setCurrentDutyItem(fullYearList[0] || null);
      } else {
        setIsPreCycle(false);
        const todaySchedule = generateSchedule(settings.apartments, settings.cycleStartDate, 1);
        setCurrentDutyItem(todaySchedule[0] || null);
      }

      const newHistory = generatePastSchedule(settings.apartments, settings.cycleStartDate, 4);
      setHistorySchedule(newHistory);
      
      localStorage.setItem('condoCleanSettings_v2', JSON.stringify(settings));
    } catch (err) {
      console.error("Erro ao processar datas:", err);
    }
  }, [settings]);

  useEffect(() => {
    if (currentDutyItem) {
      const weekKey = currentDutyItem.startDate.toISOString().split('T')[0];
      const savedTasks = localStorage.getItem(`tasks_${weekKey}`);
      const savedPlanned = localStorage.getItem(`planned_${weekKey}`);
      const savedObs = localStorage.getItem(`obs_${weekKey}`);
      
      const tasksObj = savedTasks ? JSON.parse(savedTasks) : {};
      setCompletedTasks(tasksObj);
      setPlannedDay(savedPlanned !== null ? parseInt(savedPlanned) : null);
      setObservations(savedObs || "");

      if (!isPreCycle && settings.myApartmentId === currentDutyItem.apartment.id) {
          setShowToast(true);
      }
    }
  }, [currentDutyItem, isPreCycle, settings.myApartmentId]);

  const handleToggleTask = (taskId: string) => {
    if (!currentDutyItem) return;
    const newCompleted = { ...completedTasks, [taskId]: !completedTasks[taskId] };
    setCompletedTasks(newCompleted);
    
    const weekKey = currentDutyItem.startDate.toISOString().split('T')[0];
    localStorage.setItem(`tasks_${weekKey}`, JSON.stringify(newCompleted));

    // Lógica de Notificação de Conclusão Total
    const currentCompletedCount = DEFAULT_TASKS.filter(t => newCompleted[t.id]).length;
    if (currentCompletedCount === DEFAULT_TASKS.length) {
      // Se acabou de completar e ainda não notificamos nesta semana/sessão
      if (notifPermission === 'granted' && hasNotifiedCompletion.current !== weekKey) {
        new Notification("Limpeza Concluída! ✨", {
          body: `O Apartamento ${currentDutyItem.apartment.number} finalizou todas as tarefas da semana. O condomínio está pronto!`,
          icon: "https://cdn-icons-png.flaticon.com/512/190/190.png"
        });
        hasNotifiedCompletion.current = weekKey;
      }
    } else {
      // Se desmarcou algo, reseta o trigger para permitir nova notificação se completar de novo
      if (hasNotifiedCompletion.current === weekKey) {
        hasNotifiedCompletion.current = null;
      }
    }
  };

  const handleSetPlannedDay = (day: number) => {
    if (!currentDutyItem) return;
    setPlannedDay(day);
    const weekKey = currentDutyItem.startDate.toISOString().split('T')[0];
    localStorage.setItem(`planned_${weekKey}`, day.toString());
  };

  const handleUpdateObservations = (text: string) => {
    if (!currentDutyItem) return;
    setObservations(text);
    const weekKey = currentDutyItem.startDate.toISOString().split('T')[0];
    localStorage.setItem(`obs_${weekKey}`, text);
  };

  const completedCount = DEFAULT_TASKS.filter(t => completedTasks[t.id]).length;
  const isSunday = new Date().getDay() === 0;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-12">
      <ReminderToast 
        isVisible={showToast} 
        onClose={() => setShowToast(false)} 
        apartmentNumber={currentDutyItem?.apartment.number || ''}
        plannedDay={plannedDay}
        tasksCompleted={completedCount === DEFAULT_TASKS.length}
        isCritical={isSunday && completedCount < DEFAULT_TASKS.length}
      />

      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 bg-opacity-90 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg shadow-md">
              <Home className="text-white" size={20} />
            </div>
            <h1 className="text-xl font-black tracking-tight text-gray-900">
              Monteverde<span className="text-blue-600">Clean</span>
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {notifPermission === 'denied' && (
              <div className="p-2 text-red-400 bg-red-50 rounded-full" title="Notificações bloqueadas">
                <BellOff size={18} />
              </div>
            )}
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all"
            >
              <Settings size={22} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        
        {/* Banner de Permissão de Notificação */}
        {notifPermission === 'default' && (
          <div className="bg-white border-2 border-blue-100 rounded-3xl p-6 shadow-xl shadow-blue-50 flex flex-col md:flex-row items-center justify-between gap-6 animate-slide-up-fade">
            <div className="flex items-center gap-5 text-center md:text-left">
              <div className="bg-blue-600 p-4 rounded-2xl text-white shadow-lg shadow-blue-100 animate-bounce">
                <BellRing size={28} />
              </div>
              <div>
                <h4 className="text-gray-900 font-black text-lg">Mantenha-se informado!</h4>
                <p className="text-gray-500 font-medium text-sm">Podemos avisar quando a limpeza for concluída ou quando chegar sua vez?</p>
              </div>
            </div>
            <button 
              onClick={handleRequestNotification}
              className="bg-blue-600 hover:bg-blue-700 text-white font-black px-8 py-4 rounded-2xl transition-all shadow-lg shadow-blue-200 active:scale-95 whitespace-nowrap uppercase tracking-widest text-xs"
            >
              Ativar Notificações
            </button>
          </div>
        )}

        {notifPermission === 'granted' && (
           <div className="bg-green-50/50 border border-green-100 rounded-2xl px-4 py-2 flex items-center justify-center gap-2 text-[10px] font-black text-green-600 uppercase tracking-widest animate-slide-up-fade">
             <CheckCircle size={12} /> Notificações de conclusão e escala ativadas
           </div>
        )}

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black text-gray-900 leading-tight">Escala de Limpeza</h2>
            <p className="text-gray-500 font-medium">Organização semanal da manutenção comum.</p>
          </div>
          <div className="md:w-80">
            <CleaningStatusBanner 
              completedCount={completedCount} 
              totalTasks={DEFAULT_TASKS.length} 
              isMyTurn={settings.myApartmentId === currentDutyItem?.apartment.id}
              isPreCycle={isPreCycle}
              plannedDay={plannedDay}
            />
          </div>
        </div>

        {isPreCycle && (
          <div className="bg-amber-50 border border-amber-200 rounded-3xl p-4 flex items-start gap-3">
            <Info className="text-amber-500 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <p className="text-amber-800 font-bold text-sm">O ciclo ainda não começou.</p>
              <p className="text-amber-700/80 text-xs font-medium">Aguardando a data de início configurada.</p>
            </div>
          </div>
        )}

        <CleaningTip />

        {currentDutyItem ? (
          <div className="mb-8">
             <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 ml-1">
               {isPreCycle ? 'PRIMEIRA ESCALA' : 'RESPONSÁVEL ATUAL'}
             </div>
             <CurrentDutyCard 
               scheduleItem={currentDutyItem} 
               isMyTurn={settings.myApartmentId === currentDutyItem.apartment.id}
               tasks={DEFAULT_TASKS}
               completedTasks={completedTasks}
               onToggleTask={handleToggleTask}
               plannedDay={plannedDay}
               onSetPlannedDay={handleSetPlannedDay}
               observations={observations}
               onUpdateObservations={handleUpdateObservations}
             />
          </div>
        ) : (
          <div className="p-10 text-center bg-white rounded-3xl border border-dashed border-gray-200">
            <p className="text-gray-400 font-bold">Nenhuma escala encontrada para este período.</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
              <ScheduleList 
                schedule={yearSchedule} 
                apartments={settings.apartments}
                myApartmentId={settings.myApartmentId} 
              />
            </div>
            
            <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
              <HistoryList 
                history={historySchedule}
                totalTasks={DEFAULT_TASKS.length}
                myApartmentId={settings.myApartmentId}
              />
            </div>
          </div>

          <div className="md:col-span-1 space-y-6">
             <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                <h4 className="font-black text-gray-900 mb-3 text-xs uppercase tracking-widest">Regras de Ouro</h4>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5"></div>
                    <p className="text-sm text-gray-600 font-medium">
                      Finalize as tarefas impreterivelmente até <strong>Domingo</strong>.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5"></div>
                    <p className="text-sm text-gray-600 font-medium">
                      Marque o checklist para notificar os vizinhos da conclusão.
                    </p>
                  </div>
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
