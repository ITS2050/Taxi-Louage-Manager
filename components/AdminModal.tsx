import React, { useState } from 'react';
import { X, Copy, Check } from 'lucide-react';
import { getLicenseCode } from '../utils/format';

const AdminModal = ({ onClose }: { onClose: () => void }) => {
  const [plate, setPlate] = useState('');
  const [generatedCode, setGeneratedCode] = useState<{ code: string, days: number } | null>(null);
  const [copied, setCopied] = useState(false);

  const generate = (days: 30 | 90) => {
    if (!plate) return;
    const code = getLicenseCode(plate, days);
    setGeneratedCode({ code, days });
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b bg-slate-50">
          <h2 className="font-bold text-slate-800">Admin Code Generator</h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Matricule (Format: 123 TU 4567)</label>
            <input
              type="text"
              placeholder="Ex: 200 TU 5555"
              className="w-full p-3 border rounded-xl font-mono text-lg uppercase"
              value={plate}
              onChange={e => setPlate(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => generate(30)}
              className="py-3 bg-blue-100 text-blue-700 font-bold rounded-xl hover:bg-blue-200 transition-colors"
            >
              30 Jours
            </button>
            <button
              onClick={() => generate(90)}
              className="py-3 bg-indigo-100 text-indigo-700 font-bold rounded-xl hover:bg-indigo-200 transition-colors"
            >
              90 Jours
            </button>
          </div>

          {generatedCode && (
            <div className="mt-6 p-4 bg-slate-900 rounded-xl text-center space-y-2">
              <span className="text-slate-400 text-xs uppercase tracking-widest">Code d'activation ({generatedCode.days}j)</span>
              <div className="flex items-center justify-center gap-4">
                <span className="text-3xl font-mono font-bold text-white tracking-widest">{generatedCode.code}</span>
                <button
                  onClick={copyToClipboard}
                  className={`p-2 rounded-lg transition-colors ${copied ? 'bg-green-500' : 'bg-slate-700 hover:bg-slate-600'}`}
                >
                  {copied ? <Check size={18} className="text-white" /> : <Copy size={18} className="text-white" />}
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
