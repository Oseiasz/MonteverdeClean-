
import React, { useState, useEffect } from 'react';
import { Apartment, AppSettings } from '../types';
import { X, Save, ChevronDown, AlertCircle, Database, ShieldCheck } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSave: (newSettings: AppSettings) => void;
}

const SettingsModal: React.FC<Props> = ({ isOpen, onClose, settings, onSave }) => {
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLocalSettings(settings);
    setError(null);
  }, [settings, isOpen]);

  if (!isOpen) return null;

  const validateDate = (dateStr: string): string | null => {
    if (!dateStr) return "A data de início é obrigatória.";
    const selectedDate = new Date(dateStr);
    if (isNaN(selectedDate.getTime())) return "Data inválida.";
    return null;
  };

  const handleApartmentChange = (index: number, field: keyof Apartment, value: string) => {
    const newApts = [...localSettings.apartments];
    newApts[index] = { ...newApts[index], [field]: value };
    setLocalSettings({ ...localSettings, apartments: newApts });
  };

  const handleSave = () => {
    const dateError = validateDate(localSettings.cycleStartDate);
    if (dateError) {
      setError(dateError);
      return;
    }
    onSave(localSettings);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] ring-1 ring-black/5 animate-slide-up-fade">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-white shrink-0">
          <h2 className="text-xl font-extrabold text-black tracking-tight">Configurações</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto bg-white flex-1 space-y-8 scrollbar-hide">
          {/* Sincronização em Tempo Real */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Database size={18} className="text-blue-600" />
              <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest">Sincronização Realtime (Supabase)</h3>
            </div>
            <div className="space-y-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wide mb-1 ml-1">Project URL</label>
                <input
                  type="text"
                  placeholder="https://xyz.supabase.co"
                  value={localSettings.supabaseUrl || ''}
                  onChange={(e) => setLocalSettings({...localSettings, supabaseUrl: e.target.value})}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl text-sm font-bold bg-white focus:border-blue-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wide mb-1 ml-1">Anon Key</label>
                <input
                  type="password"
                  placeholder="Seu token de acesso público"
                  value={localSettings.supabaseAnonKey || ''}
                  onChange={(e) => setLocalSettings({...localSettings, supabaseAnonKey: e.target.value})}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl text-sm font-bold bg-white focus:border-blue-500 outline-none transition-all"
                />
              </div>
              <p className="text-[10px] text-gray-500 font-bold leading-relaxed px-1">
                Obtenha estas chaves no painel do Supabase em Project Settings > API. Isso permitirá que todos os moradores vejam as atualizações instantaneamente.
              </p>
            </div>
          </section>

          {/* Data do Ciclo */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Database size={18} className="text-indigo-600" />
              <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest">Cronograma</h3>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wide mb-1 ml-1">Início do Ciclo (Apt 101)</label>
                <input
                  type="date"
                  value={localSettings.cycleStartDate}
                  onChange={(e) => setLocalSettings({ ...localSettings, cycleStartDate: e.target.value })}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl text-sm font-bold bg-white focus:border-black outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wide mb-1 ml-1">Meu Apartamento</label>
                <select
                  value={localSettings.myApartmentId || ''}
                  onChange={(e) => setLocalSettings({...localSettings, myApartmentId: e.target.value || null})}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl text-sm font-bold bg-white focus:border-black outline-none transition-all"
                >
                  <option value="">Não sou morador / Visitante</option>
                  {localSettings.apartments.map(apt => (
                    <option key={apt.id} value={apt.id}>{apt.number} - {apt.name || 'Sem nome'}</option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* Moradores */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck size={18} className="text-emerald-600" />
              <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest">Responsáveis por Unidade</h3>
            </div>
            <div className="space-y-3">
              {localSettings.apartments.map((apt, index) => (
                <div key={apt.id} className="flex gap-2 items-center">
                  <span className="w-8 text-xs text-gray-400 font-black text-center">{index + 1}</span>
                  <input
                    type="text"
                    value={apt.number}
                    onChange={(e) => handleApartmentChange(index, 'number', e.target.value)}
                    className="w-16 p-2 border-2 border-gray-100 rounded-lg text-xs text-black font-black text-center focus:border-blue-500 outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Nome"
                    value={apt.name}
                    onChange={(e) => handleApartmentChange(index, 'name', e.target.value)}
                    className="flex-1 p-2 border-2 border-gray-100 rounded-lg text-xs text-black font-bold focus:border-blue-500 outline-none"
                  />
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="p-5 border-t border-gray-100 bg-white flex justify-end shrink-0">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-8 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-all font-bold shadow-lg shadow-blue-100 text-sm uppercase tracking-widest active:scale-95"
          >
            <Save size={18} />
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
