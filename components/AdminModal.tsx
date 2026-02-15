
import React, { useState } from 'react';
import { X, Copy, Check, Calendar } from 'lucide-react';
import { getLicenseCode } from '../utils/format';

const AdminModal = ({ onClose }: { onClose: () => void }) => {
  const [plate, setPlate] = useState('');
  const [generatedCode, setGeneratedCode] = useState<{ code: string, days: number, label: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const DURATIONS = [
    { days: 30, label: '1 Mois' },
    { days: 90, label: '3 Mois' },
    { days: 180, label: '6 Mois' },
    { days: 365, label: '12 Mois' },
  ];

  const generate = (days: number, label: string) => {
    if (!plate) return;
    const code = getLicenseCode(plate, days);
    setGeneratedCode({ code, days, label });
    setCopied(false);
  };

  const copyToClipboard = () => {
    if (generatedCode) {
      navigator.clipboard.writeText(generatedCode.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <div className="w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-200">
        <div className="flex justify-between items-center p-6 border-b bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white">
              <Calendar size={18} />
            </div>
            <h2 className="font-black text-slate-800 tracking-tight">Générateur Admin</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Matricule du véhicule</label>
            <input
              type="text"
              placeholder="Ex: 200 TU 5555"
              className="w-full p-4 bg-slate-50 border-none rounded-2xl font-mono text-xl uppercase text-slate-900 font-bold focus:ring-2 focus:ring-slate-900 outline-none"
              value={plate}
              onChange={e => setPlate(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {DURATIONS.map((dur) => (
              <button
                key={dur.days}
                onClick={() => generate(dur.days, dur.label)}
                disabled={!plate}
                className={`py-4 rounded-2xl font-black text-xs transition-all active:scale-95 ${
                  !plate 
                  ? 'bg-slate-100 text-slate-300 opacity-50' 
                  : 'bg-slate-900 text-white shadow-lg shadow-slate-900/10 hover:bg-slate-800'
                }`}
              >
                {dur.label}
              </button>
            ))}
          </div>

          {generatedCode && (
            <div className="mt-6 p-6 bg-slate-900 rounded-[2rem] text-center space-y-3 animate-in zoom-in duration-300">
              <div className="inline-block px-3 py-1 bg-yellow-400 text-slate-900 rounded-full text-[9px] font-black uppercase tracking-tighter">
                Code {generatedCode.label}
              </div>
              <div className="flex flex-col items-center gap-3">
                <span className="text-4xl font-mono font-black text-white tracking-[0.2em]">{generatedCode.code}</span>
                <button
                  onClick={copyToClipboard}
                  className={`w-full py-3 rounded-xl transition-all flex items-center justify-center gap-2 font-black text-xs ${
                    copied ? 'bg-green-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  {copied ? (
                    <><Check size={16} /> COPIÉ !</>
                  ) : (
                    <><Copy size={16} /> COPIER LE CODE</>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminModal;
