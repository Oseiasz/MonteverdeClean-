import React, { useEffect, useState } from 'react';
import { Bell, X } from 'lucide-react';

interface Props {
  isVisible: boolean;
  onClose: () => void;
  apartmentNumber: string;
}

const ReminderToast: React.FC<Props> = ({ isVisible, onClose, apartmentNumber }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isVisible) {
      // Small delay for animation effect
      const timer = setTimeout(() => setShow(true), 500);
      return () => clearTimeout(timer);
    } else {
      setShow(false);
    }
  }, [isVisible]);

  if (!isVisible && !show) return null;

  return (
    <div 
      className={`
        fixed top-4 right-4 z-50 max-w-sm w-full bg-white rounded-2xl shadow-2xl border-l-8 border-yellow-400 p-4
        transform transition-all duration-500 ease-in-out
        ${show ? 'translate-y-0 opacity-100' : '-translate-y-12 opacity-0'}
      `}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="bg-yellow-100 p-2 rounded-full text-yellow-600 mt-1">
            <Bell size={20} className="animate-bounce" />
          </div>
          <div>
            <h4 className="font-extrabold text-gray-900 text-sm uppercase tracking-wide">Lembrete Automático</h4>
            <p className="text-gray-600 text-sm mt-1 leading-snug">
              Olá <strong>Apt {apartmentNumber}</strong>! <br/>
              Esta é a sua semana de limpeza.
            </p>
          </div>
        </div>
        <button 
          onClick={() => { setShow(false); setTimeout(onClose, 300); }}
          className="text-gray-400 hover:text-gray-600 p-1"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
};

export default ReminderToast;