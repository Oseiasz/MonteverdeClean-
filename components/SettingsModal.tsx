import React, { useState, useEffect } from 'react';
import { Apartment, AppSettings } from '../types';
import { X, Save, User, ChevronDown } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSave: (newSettings: AppSettings) => void;
}

const SettingsModal: React.FC<Props> = ({ isOpen, onClose, settings, onSave }) => {
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] ring-1 ring-black/5">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-white">
          <h2 className="text-xl font-extrabold text-black tracking-tight">Configurações da Escala</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto bg-white">
          <div className="mb-6">
            <label className="block text-sm font-extrabold text-black mb-2 uppercase tracking-wide">
              Data de Início do Ciclo (Apt 1)
            </label>
            <input
              type="date"
              value={localSettings.cycleStartDate}
              onChange={(e) => setLocalSettings({...localSettings, cycleStartDate: e.target.value})}
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-black focus:ring-0 outline-none text-black font-bold bg-white transition-all text-base"
            />
            <p className="text-xs text-gray-500 mt-2 font-bold">
              Data de referência onde o primeiro apartamento iniciou a limpeza.
            </p>
          </div>

          <div className="mb-8">
            <label className="block text-sm font-extrabold text-black mb-2 uppercase tracking-wide">
              Meu Apartamento (Para destaques)
            </label>
            <div className="relative">
              <select
                value={localSettings.myApartmentId || ''}
                onChange={(e) => setLocalSettings({...localSettings, myApartmentId: e.target.value || null})}
                className="w-full p-3 border-2 border-gray-200 rounded-xl text-black font-bold bg-white appearance-none focus:border-black outline-none text-base cursor-pointer pr-10"
              >
                <option value="">Nenhum selecionado</option>
                {localSettings.apartments.map(apt => (
                  <option key={apt.id} value={apt.id}>{apt.number} - {apt.name}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-black">
                <ChevronDown size={20} />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-extrabold text-black mb-4 uppercase tracking-wide">
              Apartamentos (Ordem de Rotação)
            </label>
            <div className="space-y-4">
              {localSettings.apartments.map((apt, index) => (
                <div key={apt.id} className="flex gap-3 items-center">
                  <span className="w-8 text-lg text-black font-black flex justify-center">{index + 1}</span>
                  <input
                    type="text"
                    placeholder="Nº"
                    value={apt.number}
                    onChange={(e) => handleApartmentChange(index, 'number', e.target.value)}
                    className="w-24 p-3 border-2 border-gray-200 rounded-xl text-base text-black font-bold bg-white placeholder-gray-400 focus:border-black outline-none transition-all text-center"
                  />
                  <input
                    type="text"
                    placeholder="Nome do Responsável"
                    value={apt.name}
                    onChange={(e) => handleApartmentChange(index, 'name', e.target.value)}
                    className="flex-1 p-3 border-2 border-gray-200 rounded-xl text-base text-black font-bold bg-white placeholder-gray-400 focus:border-black outline-none transition-all"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-5 border-t border-gray-100 bg-white flex justify-end">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 bg-black text-white px-8 py-3 rounded-xl hover:bg-gray-800 transition-colors font-bold shadow-lg text-base"
          >
            <Save size={20} />
            Salvar Alterações
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;