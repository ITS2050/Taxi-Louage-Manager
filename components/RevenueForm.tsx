import React, { useState, useEffect } from 'react';
import { db } from '../db/database';
import { DollarSign, Fuel, Navigation, Calendar, ArrowLeft, User } from 'lucide-react';

interface RevenueFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const FUEL_TYPES = [
  { id: 'Essence', defaultPrice: 2.525 },
  { id: 'Gasoil', defaultPrice: 1.980 },
  { id: 'Gasoil 50', defaultPrice: 2.235 },
  { id: 'GPL', defaultPrice: 1.000 },
  { id: 'Electrique', defaultPrice: 0.200 },
];

const RevenueForm = ({ onSuccess, onCancel }: RevenueFormProps) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    shift: 'Journée' as any,
    grossAmount: '',
    fuelAmount: '',
    fuelCost: '',
    fuelType: [] as string[],
    driverShare: '', // Nouveau
    otherExpenses: '',
    mileageStart: '',
    mileageEnd: '',
  });

  const [pricePerLiter, setPricePerLiter] = useState(2.525);

  useEffect(() => {
    const loadDefaultFuel = async () => {
      const user = await db.userProfile.toCollection().first();
      if (user && user.fuelType) {
        const types = user.fuelType.includes('+') 
          ? user.fuelType.split(' + ') 
          : [user.fuelType];
        setFormData(prev => ({ ...prev, fuelType: types }));
        const fuelInfo = FUEL_TYPES.find(f => f.id === types[0]);
        if (fuelInfo) setPricePerLiter(fuelInfo.defaultPrice);
      }
    };
    loadDefaultFuel();
  }, []);

  useEffect(() => {
    if (formData.fuelCost && pricePerLiter > 0) {
      const liters = (Number(formData.fuelCost) / pricePerLiter).toFixed(2);
      setFormData(prev => ({ ...prev, fuelAmount: liters }));
    }
  }, [formData.fuelCost, pricePerLiter]);

  const toggleFuelType = (type: string) => {
    const fuelInfo = FUEL_TYPES.find(f => f.id === type);
    if (fuelInfo) setPricePerLiter(fuelInfo.defaultPrice);
    setFormData(prev => ({
      ...prev,
      fuelType: prev.fuelType.includes(type) 
        ? prev.fuelType.filter(t => t !== type)
        : [...prev.fuelType, type].slice(0, 2)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await db.revenue.add({
      ...formData,
      grossAmount: Number(formData.grossAmount),
      fuelAmount: Number(formData.fuelAmount),
      fuelCost: Number(formData.fuelCost),
      driverShare: Number(formData.driverShare || 0),
      otherExpenses: Number(formData.otherExpenses || 0),
      mileageStart: Number(formData.mileageStart),
      mileageEnd: Number(formData.mileageEnd),
    });
    onSuccess();
  };

  const dailyNet = Number(formData.grossAmount || 0) 
    - Number(formData.fuelCost || 0) 
    - Number(formData.driverShare || 0) 
    - Number(formData.otherExpenses || 0);

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white rounded-xl shadow-lg border border-slate-100 max-h-[90vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-black text-slate-800">Recette du Jour</h3>
        <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-black uppercase">
          Net: {new Intl.NumberFormat('fr-TN', { minimumFractionDigits: 3 }).format(dailyNet)} DT
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

      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-1">
          <label className="block text-[10px] uppercase font-black text-slate-400 mb-1">Recette Brute</label>
          <div className="relative">
            <input type="number" step="0.001" required className="w-full p-3 pl-8 bg-slate-50 border rounded-xl text-md font-bold text-slate-900" placeholder="0.000" value={formData.grossAmount} onChange={e => setFormData({...formData, grossAmount: e.target.value})} />
            <DollarSign className="absolute left-2.5 top-3.5 text-slate-400" size={16} />
          </div>
        </div>
        <div className="col-span-1">
          <label className="block text-[10px] uppercase font-black text-slate-400 mb-1">Part Chauffeur</label>
          <div className="relative">
            <input type="number" step="0.001" className="w-full p-3 pl-8 bg-slate-50 border rounded-xl text-md font-bold text-slate-700" placeholder="0.000" value={formData.driverShare} onChange={e => setFormData({...formData, driverShare: e.target.value})} />
            <User className="absolute left-2.5 top-3.5 text-slate-400" size={16} />
          </div>
        </div>
      </div>

      <div className="p-3 bg-blue-50/50 rounded-xl space-y-3 border border-blue-100">
        <div className="flex justify-between items-center">
          <label className="block text-[10px] uppercase font-bold text-blue-600">Carburant</label>
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-black text-slate-400 uppercase">Prix/L:</span>
            <input 
              type="number" 
              step="0.001" 
              className="w-14 p-1 bg-white border rounded text-[10px] font-black text-center text-blue-700"
              value={pricePerLiter}
              onChange={e => setPricePerLiter(Number(e.target.value))}
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {FUEL_TYPES.map(fuel => (
            <button key={fuel.id} type="button" onClick={() => toggleFuelType(fuel.id)} className={`px-2 py-1 rounded-full text-[9px] font-bold border transition-all ${formData.fuelType.includes(fuel.id) ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-200 text-slate-500'}`}>
              {fuel.id}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <input type="number" step="0.001" placeholder="Montant DT" className="w-full p-2 border rounded-lg text-sm font-black text-slate-900 bg-white" value={formData.fuelCost} onChange={e => setFormData({...formData, fuelCost: e.target.value})} />
          <input type="number" step="0.01" placeholder="Litres" className="w-full p-2 border rounded-lg text-sm text-blue-600 font-bold bg-slate-50" value={formData.fuelAmount} readOnly />
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

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} className="flex-1 py-4 bg-slate-100 text-slate-500 font-black rounded-2xl active:scale-95 transition-all flex items-center justify-center gap-2">
          <ArrowLeft size={18} /> RETOUR
        </button>
        <button type="submit" className="flex-[2] py-4 bg-slate-900 text-white font-black rounded-2xl shadow-xl active:scale-95 transition-all">
          ENREGISTRER
        </button>
      </div>
    </form>
  );
};

export default RevenueForm;
