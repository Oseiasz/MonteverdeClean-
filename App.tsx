
import React, { useState, useEffect, useRef } from 'react';
import { Settings, Home, BellRing, Info, Bell, BellOff, CheckCircle, Wifi, WifiOff } from 'lucide-react';
import { AppSettings, Apartment, ScheduleItem, Task } from './types';
import { generateSchedule, generatePastSchedule } from './utils/dateUtils';
import { getSupabaseClient } from './services/supabaseClient';
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
    const saved = localStorage.getItem('condoCleanLocalSettings_v4');
    const defaultSettings: AppSettings = {
      apartments: DEFAULT_APARTMENTS,
      cycleStartDate: '2025-01-06',
      myApartmentId: null,
      supabaseUrl: 'https://fyavpagkobzfbxfnfwbz.supabase.co',
      supabaseAnonKey: 'sb_publishable_DtIpJid2A34Mv3dq4Tw45A_N1VLRKbZ'
    };
    return saved ? JSON.parse(saved) : defaultSettings;
  });

  const [yearSchedule, setYearSchedule] = useState<ScheduleItem[]>([]);
  const [currentDutyItem, setCurrentDutyItem] = useState<ScheduleItem | null>(null);
  const [historySchedule, setHistorySchedule] = useState<ScheduleItem[]>([]);
  const [historySyncData, setHistorySyncData] = useState<Record<string, any>>({});
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({});
  const [plannedDay, setPlannedDay] = useState<number | null>(null);
  const [observations, setObservations] = useState<string>("");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [isPreCycle, setIsPreCycle] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>('default');
  
  const hasNotifiedCompletion = useRef<string | null>(null);
  const supabase = useRef<ReturnType<typeof getSupabaseClient>>(null);

  useEffect(() => {
    supabase.current = getSupabaseClient(settings.supabaseUrl, settings.supabaseAnonKey);
    setIsOnline(!!supabase.current);
  }, [settings.supabaseUrl, settings.supabaseAnonKey]);

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
        body: "Monitoramento em tempo real ativado!",
        icon: "https://cdn-icons-png.flaticon.com/512/3119/3119338.png"
      });
    }
  };

  // Carregar Configurações Globais e Dados Históricos
  useEffect(() => {
    const client = supabase.current;
    if (!client || !isOnline) return;

    const fetchData = async () => {
      // 1. Configurações Globais
      const { data: setts } = await client.from('app_settings').select('*').eq('id', 'global').single();
      if (setts) {
        setSettings(prev => ({ ...prev, apartments: setts.apartments, cycleStartDate: setts.cycle_start_date }));
      }

      // 2. Dados Históricos (últimas semanas)
      const pastKeys = historySchedule.map(h => h.startDate.toISOString().split('T')[0]);
      if (pastKeys.length > 0) {
        const { data: pastTasks } = await client.from('weekly_tasks').select('*').in('week_key', pastKeys);
        const { data: pastMeta } = await client.from('weekly_metadata').select('*').in('week_key', pastKeys);
        
        const syncMap: Record<string, any> = {};
        pastKeys.forEach(key => {
          const weekTasks = pastTasks?.filter(t => t.week_key === key) || [];
          const weekMeta = pastMeta?.find(m => m.week_key === key);
          const doneCount = weekTasks.filter(t => t.is_completed).length;
          syncMap[key] = {
            percent: Math.round((doneCount / DEFAULT_TASKS.length) * 100),
            obs: weekMeta?.observations || ""
          };
        });
        setHistorySyncData(syncMap);
      }
    };

    fetchData();

    const settingsSub = client
      .channel('global_changes')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'app_settings' }, (payload) => {
        setSettings(prev => ({ ...prev, apartments: payload.new.apartments, cycleStartDate: payload.new.cycle_start_date }));
      })
      .subscribe();

    return () => { settingsSub.unsubscribe(); };
  }, [isOnline, historySchedule.length]);

  // Gerar Escalas
  useEffect(() => {
    try {
      const cycleStart = new Date(settings.cycleStartDate);
      const fullYearList = generateSchedule(settings.apartments, settings.cycleStartDate, 52, cycleStart);
      setYearSchedule(fullYearList);

      const today = new Date();
      today.setHours(0,0,0,0);

      if (today < cycleStart) {
        setIsPreCycle(true);
        setCurrentDutyItem(fullYearList[0] || null);
      } else {
        setIsPreCycle(false);
        const todaySchedule = generateSchedule(settings.apartments, settings.cycleStartDate, 1);
        setCurrentDutyItem(todaySchedule[0] || null);
      }

      setHistorySchedule(generatePastSchedule(settings.apartments, settings.cycleStartDate, 4));
      localStorage.setItem('condoCleanLocalSettings_v4', JSON.stringify(settings));
    } catch (err) {
      console.error(err);
    }
  }, [settings]);

  // Sincronização em Tempo Real da Semana Atual
  useEffect(() => {
    if (!currentDutyItem || !supabase.current) return;
    const client = supabase.current;
    const weekKey = currentDutyItem.startDate.toISOString().split('T')[0];

    const fetchWeekData = async () => {
      const { data: tasks } = await client.from('weekly_tasks').select('*').eq('week_key', weekKey);
      if (tasks) {
        const obj: Record<string, boolean> = {};
        tasks.forEach(t => { obj[t.task_id] = t.is_completed; });
        setCompletedTasks(obj);
      }
      const { data: meta } = await client.from('weekly_metadata').select('*').eq('week_key', weekKey).single();
      if (meta) {
        setPlannedDay(meta.planned_day);
        setObservations(meta.observations || "");
      }
    };
    fetchWeekData();

    const channel = client
      .channel(`live_week_${weekKey}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'weekly_tasks', filter: `week_key=eq.${weekKey}` }, (payload: any) => {
        setCompletedTasks(prev => {
          const next = { ...prev, [payload.new.task_id]: payload.new.is_completed };
          const completedCount = DEFAULT_TASKS.filter(t => next[t.id]).length;
          
          if (completedCount === DEFAULT_TASKS.length && hasNotifiedCompletion.current !== weekKey) {
            if (notifPermission === 'granted') {
              new Notification("✨ Prédio Limpo!", {
                body: `O morador do Apt ${currentDutyItem.apartment.number} acabou de finalizar a limpeza!`,
                icon: "https://cdn-icons-png.flaticon.com/512/190/190.png"
              });
            }
            hasNotifiedCompletion.current = weekKey;
          }
          return next;
        });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'weekly_metadata', filter: `week_key=eq.${weekKey}` }, (payload: any) => {
        setPlannedDay(payload.new.planned_day);
        setObservations(payload.new.observations || "");
      })
      .subscribe();

    if (!isPreCycle && settings.myApartmentId === currentDutyItem.apartment.id) {
      setShowToast(true);
    }

    return () => { channel.unsubscribe(); };
  }, [currentDutyItem, isPreCycle, settings.myApartmentId, isOnline]);

  const handleToggleTask = async (taskId: string) => {
    if (!currentDutyItem) return;
    const weekKey = currentDutyItem.startDate.toISOString().split('T')[0];
    const newState = !completedTasks[taskId];
    setCompletedTasks(prev => ({ ...prev, [taskId]: newState }));
    if (supabase.current) {
      await supabase.current.from('weekly_tasks').upsert({ week_key: weekKey, task_id: taskId, is_completed: newState });
    }
  };

  const handleSetPlannedDay = async (day: number) => {
    if (!currentDutyItem) return;
    const weekKey = currentDutyItem.startDate.toISOString().split('T')[0];
    setPlannedDay(day);
    if (supabase.current) {
      await supabase.current.from('weekly_metadata').upsert({ week_key: weekKey, planned_day: day }, { onConflict: 'week_key' });
    }
  };

  const handleUpdateObservations = async (text: string) => {
    if (!currentDutyItem) return;
    const weekKey = currentDutyItem.startDate.toISOString().split('T')[0];
    setObservations(text);
    if (supabase.current) {
      await supabase.current.from('weekly_metadata').upsert({ week_key: weekKey, observations: text }, { onConflict: 'week_key' });
    }
  };

  const handleSaveSettings = async (newSettings: AppSettings) => {
    setSettings(newSettings);
    if (supabase.current) {
      await supabase.current.from('app_settings').upsert({ id: 'global', apartments: newSettings.apartments, cycle_start_date: newSettings.cycleStartDate });
    }
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
            <div className="flex flex-col">
              <h1 className="text-xl font-black tracking-tight text-gray-900 leading-none">
                Monteverde<span className="text-blue-600">Clean</span>
              </h1>
              <span className="flex items-center gap-1 text-[8px] font-bold uppercase tracking-widest text-gray-400 mt-1">
                {isOnline ? <><Wifi size={8} className="text-green-500" /> Cloud Sync On</> : <><WifiOff size={8} className="text-red-400" /> Offline</>}
              </span>
            </div>
          </div>
          <button onClick={() => setIsSettingsOpen(true)} className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all">
            <Settings size={22} />
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {notifPermission === 'default' && (
          <div className="bg-white border-2 border-blue-100 rounded-3xl p-6 shadow-xl shadow-blue-50 flex flex-col md:flex-row items-center justify-between gap-6 animate-slide-up-fade">
            <div className="flex items-center gap-5">
              <div className="bg-blue-600 p-4 rounded-2xl text-white shadow-lg shrink-0">
                <BellRing size={28} />
              </div>
              <div>
                <h4 className="text-gray-900 font-black text-lg">Avisos em Tempo Real</h4>
                <p className="text-gray-500 font-medium text-sm">Receba alertas quando os vizinhos terminarem a manutenção.</p>
              </div>
            </div>
            <button onClick={handleRequestNotification} className="bg-blue-600 hover:bg-blue-700 text-white font-black px-8 py-4 rounded-2xl transition-all shadow-lg text-xs uppercase tracking-widest">
              Ativar Sincronização
            </button>
          </div>
        )}

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black text-gray-900 leading-tight">Escala do Prédio</h2>
            <p className="text-gray-500 font-medium">Sincronizado via Supabase Cloud.</p>
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

        <CleaningTip />

        {currentDutyItem && (
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
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
              <ScheduleList schedule={yearSchedule} apartments={settings.apartments} myApartmentId={settings.myApartmentId} />
            </div>
            <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
              <HistoryList history={historySchedule} totalTasks={DEFAULT_TASKS.length} myApartmentId={settings.myApartmentId} syncData={historySyncData} />
            </div>
          </div>
          <div className="md:col-span-1">
             <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm sticky top-24">
                <h4 className="font-black text-gray-900 mb-4 text-xs uppercase tracking-widest">Condo Live</h4>
                <p className="text-sm text-gray-600 font-medium mb-4">
                  Todas as marcações são refletidas <strong>instantaneamente</strong> para os outros 5 apartamentos.
                </p>
                <div className="p-4 bg-green-50 rounded-2xl border border-green-100">
                  <span className="text-[10px] font-black text-green-600 uppercase">Cloud OK</span>
                  <p className="text-xs font-bold text-green-900 mt-1">Serviço de mensageria ativo e operando.</p>
                </div>
             </div>
          </div>
        </div>
      </main>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} settings={settings} onSave={handleSaveSettings} />
    </div>
  );
};

export default App;
