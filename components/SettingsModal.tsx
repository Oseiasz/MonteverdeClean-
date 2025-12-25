import React, { useState, useEffect } from 'react';
import { Apartment, AppSettings } from '../types';
import { X, Save, ChevronDown, AlertCircle } from 'lucide-react';

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

    const today = new Date();
    const maxFuture = new Date();
    maxFuture.setFullYear(today.getFullYear() + 2); // Limite de 2 anos no futuro

    const minPast = new Date('2020-01-01');

    if (selectedDate > maxFuture) {
      return "A data não pode ser superior a 2 anos no futuro.";
    }
    if (selectedDate < minPast) {
      return "A data não pode ser anterior a 2020.";
    }

    return null;
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalSettings({ ...localSettings, cycleStartDate: val });
    setError(validateDate(val));
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

  const isInvalid = !!error || !localSettings.cycleStartDate;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] ring-1 ring-black/5 animate-slide-up-fade">
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
              onChange={handleDateChange}
              className={`w-full p-3 border-2 rounded-xl focus:ring-0 outline-none font-bold bg-white transition-all text-base ${
                error ? 'border-red-500 text-red-600' : 'border-gray-200 text-black focus:border-black'
              }`}
            />
            {error ? (
              <div className="flex items-center gap-1 mt-2 text-red-500 text-xs font-bold animate-pulse">
                <AlertCircle size={14} />
                <span>{error}</span>
              </div>
            ) : (
              <p className="text-xs text-gray-500 mt-2 font-bold">
                Data de referência onde o primeiro apartamento iniciou a limpeza.
              </p>
            )}
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
            disabled={isInvalid}
            className={`flex items-center gap-2 px-8 py-3 rounded-xl transition-all font-bold shadow-lg text-base ${
              isInvalid 
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none' 
                : 'bg-black text-white hover:bg-gray-800'
            }`}
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