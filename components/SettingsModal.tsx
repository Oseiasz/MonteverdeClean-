
import React, { useState, useEffect } from 'react';
import { Apartment, AppSettings } from '../types';
import { X, Save, ChevronDown, AlertCircle, Database, ShieldCheck, Eye, EyeOff, Lock, Unlock, Key } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSave: (newSettings: AppSettings) => void;
}

const SettingsModal: React.FC<Props> = ({ isOpen, onClose, settings, onSave }) => {
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  const [showKeys, setShowKeys] = useState(false);
  const [password, setPassword] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [passError, setPassError] = useState(false);

  useEffect(() => {
    setLocalSettings(settings);
    if (!isOpen) {
      setIsUnlocked(false);
      setPassword("");
      setPassError(false);
      setShowKeys(false);
    }
  }, [settings, isOpen]);

  if (!isOpen) return null;

  const handleUnlock = () => {
    if (password === "Oseias1@") {
      setIsUnlocked(true);
      setPassError(false);
    } else {
      setPassError(true);
      setTimeout(() => setPassError(false), 2000);
    }
  };

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
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] ring-1 ring-black/5 animate-slide-up-fade border border-gray-200">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white shrink-0">
          <div>
            <h2 className="text-xl font-black text-black tracking-tight leading-none">Configurações</h2>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Administração Condomínio</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto bg-white flex-1 space-y-8 scrollbar-hide">
          {/* Seção Banco de Dados - Protegida por Senha */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Database size={18} className="text-blue-600" />
              <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest">Base de Dados (Supabase)</h3>
            </div>
            
            {!isUnlocked ? (
              <div className="p-6 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-4">
                  <Lock size={20} className="text-slate-400" />
                </div>
                <h4 className="text-sm font-black text-slate-800 uppercase tracking-wide mb-2">Acesso Privado</h4>
                <p className="text-[10px] text-slate-500 font-bold mb-4 px-8 leading-relaxed">
                  As chaves de API e URL são sensíveis. Digite a senha para editar.
                </p>
                <div className="w-full max-w-[200px] space-y-3">
                  <input 
                    type="password"
                    placeholder="Senha de acesso"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
                    className={`w-full p-2.5 bg-white border-2 rounded-xl text-center font-black text-sm outline-none transition-all ${passError ? 'border-red-400 animate-shake' : 'border-slate-200 focus:border-blue-500'}`}
                  />
                  <button 
                    onClick={handleUnlock}
                    className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg"
                  >
                    Desbloquear Chaves
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 p-4 bg-blue-50 rounded-2xl border border-blue-100 animate-slide-up-fade">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-1.5 text-blue-700">
                    <Unlock size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Acesso Autorizado</span>
                  </div>
                  <button 
                    onClick={() => setShowKeys(!showKeys)}
                    className="text-[9px] font-black uppercase text-blue-600 hover:underline"
                  >
                    {showKeys ? "Ocultar" : "Mostrar"}
                  </button>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wide mb-1 ml-1">URL do Projeto</label>
                  <input
                    type={showKeys ? "text" : "password"}
                    value={localSettings.supabaseUrl || ''}
                    onChange={(e) => setLocalSettings({...localSettings, supabaseUrl: e.target.value})}
                    className="w-full p-3 border-2 border-white rounded-xl text-sm font-bold bg-white focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wide mb-1 ml-1">Chave API (Anon)</label>
                  <input
                    type={showKeys ? "text" : "password"}
                    value={localSettings.supabaseAnonKey || ''}
                    onChange={(e) => setLocalSettings({...localSettings, supabaseAnonKey: e.target.value})}
                    className="w-full p-3 border-2 border-white rounded-xl text-sm font-bold bg-white focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>
            )}
          </section>

          {/* Configurações do Ciclo */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle size={18} className="text-indigo-600" />
              <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest">Cronograma 2026</h3>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wide mb-1 ml-1">Início do Ciclo (Apt 101)</label>
                <input
                  type="date"
                  value={localSettings.cycleStartDate}
                  onChange={(e) => setLocalSettings({ ...localSettings, cycleStartDate: e.target.value })}
                  className="w-full p-3 border-2 border-gray-100 rounded-xl text-sm font-bold bg-white focus:border-black outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wide mb-1 ml-1">Vincular meu Apartamento</label>
                <select
                  value={localSettings.myApartmentId || ''}
                  onChange={(e) => setLocalSettings({...localSettings, myApartmentId: e.target.value || null})}
                  className="w-full p-3 border-2 border-gray-100 rounded-xl text-sm font-bold bg-white focus:border-black outline-none transition-all"
                >
                  <option value="">Nenhum (Visualização)</option>
                  {localSettings.apartments.map(apt => (
                    <option key={apt.id} value={apt.id}>Apt {apt.number}</option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* Lista de Responsáveis - FUNDO BRANCO PARA MELHOR LEITURA */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck size={18} className="text-emerald-600" />
              <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest">Responsáveis das Unidades</h3>
            </div>
            <div className="space-y-3">
              {localSettings.apartments.map((apt, index) => (
                <div key={apt.id} className="flex gap-2 items-center group">
                  <div className="w-12 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-[10px] font-black text-blue-600 uppercase shrink-0 border border-blue-100">
                    {apt.number}
                  </div>
                  <input
                    type="text"
                    placeholder="Nome do responsável"
                    value={apt.name}
                    onChange={(e) => handleApartmentChange(index, 'name', e.target.value)}
                    className="flex-1 p-2.5 border-2 border-gray-100 rounded-xl text-xs text-slate-900 font-black bg-white focus:border-blue-500 outline-none transition-all shadow-sm"
                  />
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="p-6 border-t border-gray-100 bg-white flex justify-end shrink-0">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-12 py-4 rounded-2xl bg-black text-white hover:bg-gray-800 transition-all font-black shadow-xl text-xs uppercase tracking-widest active:scale-95"
          >
            <Save size={16} />
            Salvar Tudo
          </button>
        </div>
      </div>
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-shake { animation: shake 0.2s ease-in-out 2; }
      `}</style>
    </div>
  );
};

export default SettingsModal;
