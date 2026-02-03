import React, { useState } from 'react';
import { db } from '../db/database';
import { CreditCard, Calendar, RefreshCcw, Tag, ArrowLeft } from 'lucide-react';

interface ExpenseFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const CATEGORIES = [
  { id: 'Assurance', label: 'Assurance' },
  { id: 'Vignette', label: 'Vignette' },
  { id: 'Visite Technique', label: 'Visite Technique' },
  { id: 'Taxe', label: 'Taxe (Radio/Patente)' },
  { id: 'Loyer', label: 'Loyer Louage/Garage' },
  { id: 'Parking', label: 'Parking' },
  { id: 'Lavage', label: 'Lavage' },
  { id: 'Autre', label: 'Autre' },
];

const ExpenseForm = ({ onSuccess, onCancel }: ExpenseFormProps) => {
  const [formData, setFormData] = useState({
    type: 'Fixe' as 'Fixe' | 'Variable',
    category: 'Assurance' as any,
    amount: '',
    frequency: 'Mensuel' as any,
    expiryDate: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await db.expenses.add({
      ...formData,
      amount: Number(formData.amount),
      expiryDate: formData.expiryDate || undefined,
    });
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-5 bg-white rounded-3xl shadow-xl border border-slate-100">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-xl font-black text-slate-900 tracking-tight">Ajouter une charge</h3>
      </div>

      <div className="flex bg-slate-100 p-1 rounded-2xl">
        {(['Fixe', 'Variable'] as const).map(t => (
          <button
            key={t}
            type="button"
            onClick={() => setFormData({ ...formData, type: t })}
            className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${formData.type === t ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400'}`}
          >
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-[10px] uppercase font-black text-slate-400 mb-1 ml-1">Catégorie</label>
          <div className="relative">
            <select
              className="w-full p-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-900 appearance-none outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.category}
              onChange={e => setFormData({ ...formData, category: e.target.value as any })}
            >
              {CATEGORIES.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.label}</option>
              ))}
            </select>
            <Tag size={16} className="absolute right-4 top-4 text-slate-300 pointer-events-none" />
          </div>
        </div>

        <div>
          <label className="block text-[10px] uppercase font-black text-slate-400 mb-1 ml-1">Montant (DT)</label>
          <div className="relative">
            <input
              type="number"
              step="0.001"
              required
              placeholder="0.000"
              className="w-full p-3.5 pl-10 bg-slate-50 border-none rounded-2xl text-lg font-black text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.amount}
              onChange={e => setFormData({ ...formData, amount: e.target.value })}
            />
            <CreditCard size={18} className="absolute left-3.5 top-4 text-slate-300" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] uppercase font-black text-slate-400 mb-1 ml-1">Fréquence</label>
            <select
              className="w-full p-3.5 bg-slate-50 border-none rounded-2xl text-xs font-bold text-slate-900 outline-none"
              value={formData.frequency}
              onChange={e => setFormData({ ...formData, frequency: e.target.value as any })}
            >
              <option value="Quotidien">Quotidien</option>
              <option value="Mensuel">Mensuel</option>
              <option value="Trimestriel">Trimestriel</option>
              <option value="Annuel">Annuel</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] uppercase font-black text-slate-400 mb-1 ml-1">Date d'Échéance</label>
            <input
              type="date"
              className="w-full p-3.5 bg-slate-50 border-none rounded-2xl text-xs font-bold text-slate-900 outline-none"
              value={formData.expiryDate}
              onChange={e => setFormData({ ...formData, expiryDate: e.target.value })}
            />
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button 
          type="button" 
          onClick={onCancel}
          className="flex-1 py-4.5 bg-slate-100 text-slate-500 font-black rounded-[1.5rem] active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <ArrowLeft size={18} /> RETOUR
        </button>
        <button 
          type="submit" 
          className="flex-[2] py-4.5 bg-slate-900 text-white font-black rounded-[1.5rem] shadow-xl hover:opacity-90 active:scale-95 transition-all"
        >
          ENREGISTRER
        </button>
      </div>
    </form>
  );
};

export default ExpenseForm;
