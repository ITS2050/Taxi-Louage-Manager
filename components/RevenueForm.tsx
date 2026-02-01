import React, { useState } from 'react';
import { db } from '../db/database';
import { DollarSign, Fuel, Navigation, Calendar } from 'lucide-react';

const FUEL_TYPES = ['Essence', 'Gasoil', 'Gasoil 50', 'GPL', 'Electrique'];

const RevenueForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    shift: 'Journée' as any,
    grossAmount: '',
    fuelAmount: '',
    fuelCost: '',
    fuelType: [] as string[],
    otherExpenses: '',
    mileageStart: '',
    mileageEnd: '',
  });

  const toggleFuelType = (type: string) => {
    setFormData(prev => ({
      ...prev,
      fuelType: prev.fuelType.includes(type) 
        ? prev.fuelType.filter(t => t !== type)
        : [...prev.fuelType, type].slice(0, 2) // Max 2 types (Hybrid)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await db.revenue.add({
      ...formData,
      grossAmount: Number(formData.grossAmount),
      fuelAmount: Number(formData.fuelAmount),
      fuelCost: Number(formData.fuelCost),
      otherExpenses: Number(formData.otherExpenses || 0),
      mileageStart: Number(formData.mileageStart),
      mileageEnd: Number(formData.mileageEnd),
    });
    onSuccess();
  };

  const net = Number(formData.grossAmount || 0) - Number(formData.fuelCost || 0) - Number(formData.otherExpenses || 0);

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white rounded-xl shadow-lg border border-slate-100">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-black text-slate-800">Recette du Jour</h3>
        <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
          Net: {new Intl.NumberFormat('fr-TN', { minimumFractionDigits: 3 }).format(net)} DT
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Date</label>
          <input type="date" required className="w-full p-2 bg-slate-50 border rounded-lg text-sm text-slate-900" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
        </div>
        <div>
          <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Shift</label>
          <select className="w-full p-2 bg-slate-50 border rounded-lg text-sm text-slate-900" value={formData.shift} onChange={e => setFormData({...formData, shift: e.target.value as any})}>
            <option>Matin</option>
            <option>Soir</option>
            <option>Journée</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Recette Brute (DT)</label>
        <div className="relative">
          <input type="number" step="0.001" required className="w-full p-3 pl-10 bg-slate-50 border rounded-xl text-lg font-bold text-slate-900" placeholder="0.000" value={formData.grossAmount} onChange={e => setFormData({...formData, grossAmount: e.target.value})} />
          <DollarSign className="absolute left-3 top-3.5 text-slate-400" size={20} />
        </div>
      </div>

      <div className="p-3 bg-blue-50/50 rounded-xl space-y-3">
        <label className="block text-[10px] uppercase font-bold text-blue-600 mb-1">Carburant</label>
        <div className="flex flex-wrap gap-2">
          {FUEL_TYPES.map(type => (
            <button
              key={type}
              type="button"
              onClick={() => toggleFuelType(type)}
              className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-all ${
                formData.fuelType.includes(type) ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-200 text-slate-500'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <input type="number" step="0.01" placeholder="Litres" className="w-full p-2 border rounded-lg text-sm text-slate-900" value={formData.fuelAmount} onChange={e => setFormData({...formData, fuelAmount: e.target.value})} />
          <input type="number" step="0.001" placeholder="Prix (DT)" className="w-full p-2 border rounded-lg text-sm font-bold text-slate-900" value={formData.fuelCost} onChange={e => setFormData({...formData, fuelCost: e.target.value})} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Km Départ</label>
          <input type="number" required className="w-full p-2 border rounded-lg text-sm text-slate-900" value={formData.mileageStart} onChange={e => setFormData({...formData, mileageStart: e.target.value})} />
        </div>
        <div>
          <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Km Arrivée</label>
          <input type="number" required className="w-full p-2 border rounded-lg text-sm text-slate-900" value={formData.mileageEnd} onChange={e => setFormData({...formData, mileageEnd: e.target.value})} />
        </div>
      </div>

      <button type="submit" className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl shadow-xl active:scale-95 transition-all">
        ENREGISTRER LA JOURNÉE
      </button>
    </form>
  );
};

export default RevenueForm;
