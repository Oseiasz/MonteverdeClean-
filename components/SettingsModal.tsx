
import React, { useState, useEffect } from 'react';
import { Apartment, AppSettings } from '../types';
import { X, Save, ChevronDown, AlertCircle, Database, ShieldCheck, Eye, EyeOff, Lock } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSave: (newSettings: AppSettings) => void;
}

const SettingsModal: React.FC<Props> = ({ isOpen, onClose, settings, onSave }) => {
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  const [showKeys, setShowKeys] = useState(false);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings, isOpen]);

  if (!isOpen) return null;

  const handleApartmentChange = (index: number, field: keyof Apartment, value: string) => {
    const newApts = [...localSettings.apartments];
    newApts[index] = { ...newApts[index], [field]: value };
    setLocalSettings({ ...localSettings, apartments: newApts });
  };

  const handleSave = () => {
    onSave(localSettings);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] ring-1 ring-black/5 animate-slide-up-fade">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white shrink-0">
          <div>
            <h2 className="text-xl font-black text-black tracking-tight leading-none">Configurações</h2>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Gestão de Dados 2026</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto bg-white flex-1 space-y-8 scrollbar-hide">
          {/* Sincronização em Tempo Real - SEGURANÇA REFORÇADA */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Database size={18} className="text-blue-600" />
                <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest">Base de Dados (Supabase)</h3>
              </div>
              <button 
                onClick={() => setShowKeys(!showKeys)}
                className="flex items-center gap-1 text-[9px] font-black uppercase text-blue-600 hover:bg-blue-50 px-2 py-1 rounded-lg border border-blue-100"
              >
                {showKeys ? <><EyeOff size={10} /> Ocultar</> : <><Eye size={10} /> Mostrar Chaves</>}
              </button>
            </div>
            
            <div className="space-y-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="flex items-start gap-3 mb-2 p-2 bg-amber-50 rounded-xl border border-amber-100">
                <Lock size={14} className="text-amber-600 shrink-0 mt-0.5" />
                <p className="text-[10px] text-amber-800 font-bold leading-tight">
                  Chaves sensíveis. Não compartilhe com quem não é administrador do condomínio.
                </p>
              </div>
              
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wide mb-1 ml-1">URL do Projeto</label>
                <input
                  type={showKeys ? "text" : "password"}
                  value={localSettings.supabaseUrl || ''}
                  onChange={(e) => setLocalSettings({...localSettings, supabaseUrl: e.target.value})}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl text-sm font-bold bg-white focus:border-blue-500 outline-none transition-all"
                  placeholder="https://xyz.supabase.co"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wide mb-1 ml-1">Chave Anon (API)</label>
                <input
                  type={showKeys ? "text" : "password"}
                  value={localSettings.supabaseAnonKey || ''}
                  onChange={(e) => setLocalSettings({...localSettings, supabaseAnonKey: e.target.value})}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl text-sm font-bold bg-white focus:border-blue-500 outline-none transition-all"
                  placeholder="Seu token secreto"
                />
              </div>
            </div>
          </section>

          {/* Data do Ciclo */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle size={18} className="text-indigo-600" />
              <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest">Cronograma 2026</h3>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wide mb-1 ml-1">Início da Contagem (Padrão 2026-01-05)</label>
                <input
                  type="date"
                  value={localSettings.cycleStartDate}
                  onChange={(e) => setLocalSettings({ ...localSettings, cycleStartDate: e.target.value })}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl text-sm font-bold bg-white focus:border-black outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wide mb-1 ml-1">Identificar meu Apartamento</label>
                <select
                  value={localSettings.myApartmentId || ''}
                  onChange={(e) => setLocalSettings({...localSettings, myApartmentId: e.target.value || null})}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl text-sm font-bold bg-white focus:border-black outline-none transition-all"
                >
                  <option value="">Visualizador Externo</option>
                  {localSettings.apartments.map(apt => (
                    <option key={apt.id} value={apt.id}>{apt.number} - {apt.name || 'Responsável'}</option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* Moradores */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck size={18} className="text-emerald-600" />
              <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest">Identificação das Unidades</h3>
            </div>
            <div className="space-y-3">
              {localSettings.apartments.map((apt, index) => (
                <div key={apt.id} className="flex gap-2 items-center group">
                  <span className="w-10 text-[10px] text-gray-400 font-black text-center group-hover:text-blue-600 transition-colors uppercase">Apt {apt.number}</span>
                  <input
                    type="text"
                    placeholder="Nome do Morador ou Família"
                    value={apt.name}
                    onChange={(e) => handleApartmentChange(index, 'name', e.target.value)}
                    className="flex-1 p-2.5 border-2 border-gray-100 rounded-xl text-xs text-black font-bold focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="p-6 border-t border-gray-100 bg-white flex justify-end shrink-0">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-10 py-4 rounded-2xl bg-black text-white hover:bg-gray-800 transition-all font-black shadow-xl text-xs uppercase tracking-widest active:scale-95"
          >
            <Save size={16} />
            Salvar Alterações
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
