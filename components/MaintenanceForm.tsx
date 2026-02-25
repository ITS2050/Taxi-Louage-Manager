import React, { useState, useEffect } from 'react';
import { db } from '../db/database';
import { MAINTENANCE_SYSTEMS, MaintenanceSystem, SubSystem } from '../constants/maintenance';
import { Camera as CameraIcon, X as XIcon, ChevronRight, PlusCircle } from 'lucide-react';

const MaintenanceForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    mileage: '',
    systemId: MAINTENANCE_SYSTEMS[0].id,
    subSystem: MAINTENANCE_SYSTEMS[0].subSystems[0].label,
    brand: '',
    price: '',
    notes: '',
    intervalKm: MAINTENANCE_SYSTEMS[0].subSystems[0].defaultInterval.toString(),
  });
  
  const [customSubSystem, setCustomSubSystem] = useState('');
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [photo, setPhoto] = useState<Blob | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const currentSystem = MAINTENANCE_SYSTEMS.find((s: MaintenanceSystem) => s.id === formData.systemId) || MAINTENANCE_SYSTEMS[0];

  useEffect(() => {
    if (!isAddingCustom) {
      const sub = currentSystem.subSystems.find((s: SubSystem) => s.label === formData.subSystem);
      if (sub) {
        setFormData(prev => ({ ...prev, intervalKm: sub.defaultInterval.toString() }));
      }
    }
  }, [formData.subSystem, formData.systemId, isAddingCustom, currentSystem]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const mileage = Number(formData.mileage);
    const interval = Number(formData.intervalKm);
    const subSystemName = isAddingCustom ? customSubSystem : formData.subSystem;

    await db.maintenance.add({
      date: formData.date,
      mileage,
      systemId: formData.systemId,
      subSystem: subSystemName,
      brand: formData.brand,
      price: Number(formData.price),
      photo: photo || undefined,
      notes: formData.notes,
    });

    const existingTask = await db.maintenanceTasks
      .where({ systemId: formData.systemId, subSystem: subSystemName })
      .first();

    if (existingTask) {
      await db.maintenanceTasks.update(existingTask.id!, {
        lastMaintenanceMileage: mileage,
        nextMaintenanceMileage: mileage + interval,
        intervalKm: interval,
        isActive: true
      });
    } else {
      await db.maintenanceTasks.add({
        systemId: formData.systemId,
        subSystem: subSystemName,
        intervalKm: interval,
        lastMaintenanceMileage: mileage,
        nextMaintenanceMileage: mileage + interval,
        isActive: true
      });
    }

    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6 bg-white rounded-3xl shadow-xl border border-slate-100">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-black text-slate-900 italic tracking-tight">CARNET D'ENTRETIEN</h3>
        <div className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-full uppercase tracking-wider">Nouveau</div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Date d'intervention</label>
          <input
            type="date"
            required
            className="w-full p-3.5 bg-slate-50 border-none rounded-2xl text-sm text-slate-900 font-bold focus:ring-2 focus:ring-blue-500 outline-none"
            value={formData.date}
            onChange={e => setFormData({ ...formData, date: e.target.value })}
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Kilométrage actuel</label>
          <input
            type="number"
            placeholder="Km"
            required
            className="w-full p-3.5 bg-slate-50 border-none rounded-2xl text-sm text-slate-900 font-bold focus:ring-2 focus:ring-blue-500 outline-none"
            value={formData.mileage}
            onChange={e => setFormData({ ...formData, mileage: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Système de maintenance</label>
        <div className="grid grid-cols-4 gap-2">
          {MAINTENANCE_SYSTEMS.map((sys: MaintenanceSystem) => {
            const Icon = sys.icon;
            const isActive = formData.systemId === sys.id;
            return (
              <button
                key={sys.id}
                type="button"
                onClick={() => {
                  setFormData({ 
                    ...formData, 
                    systemId: sys.id, 
                    subSystem: sys.subSystems[0].label,
                    intervalKm: sys.subSystems[0].defaultInterval.toString()
                  });
                  setIsAddingCustom(false);
                }}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all ${
                  isActive ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white border-slate-100 text-slate-400 hover:border-blue-200'
                }`}
              >
                <Icon size={20} />
                <span className="text-[8px] mt-1.5 font-bold uppercase truncate w-full text-center">{sys.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between ml-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sous-système / Pièce</label>
          <button 
            type="button" 
            onClick={() => setIsAddingCustom(!isAddingCustom)}
            className="text-[10px] font-bold text-blue-600 flex items-center gap-1"
          >
            {isAddingCustom ? 'Choisir liste' : 'Ajouter autre'}
            <PlusCircle size={12} />
          </button>
        </div>
        
        {isAddingCustom ? (
          <input
            type="text"
            placeholder="Nom du sous-système personnalisé..."
            required
            className="w-full p-3.5 bg-slate-50 border-none rounded-2xl text-sm text-slate-900 font-bold focus:ring-2 focus:ring-blue-500 outline-none"
            value={customSubSystem}
            onChange={e => setCustomSubSystem(e.target.value)}
          />
        ) : (
          <select
            className="w-full p-3.5 bg-slate-50 border-none rounded-2xl text-sm text-slate-900 font-bold focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
            value={formData.subSystem}
            onChange={e => setFormData({ ...formData, subSystem: e.target.value })}
          >
            {currentSystem.subSystems.map(sub => (
              <option key={sub.id} value={sub.label}>{sub.label}</option>
            ))}
          </select>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Intervalle (Km)</label>
          <input
            type="number"
            placeholder="Ex: 10000"
            required
            className="w-full p-3.5 bg-slate-50 border-none rounded-2xl text-sm text-slate-900 font-bold focus:ring-2 focus:ring-blue-500 outline-none"
            value={formData.intervalKm}
            onChange={e => setFormData({ ...formData, intervalKm: e.target.value })}
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Prix (DT)</label>
          <input
            type="number"
            step="0.001"
            placeholder="0.000"
            required
            className="w-full p-3.5 bg-slate-50 border-none rounded-2xl text-sm text-slate-900 font-bold focus:ring-2 focus:ring-blue-500 outline-none"
            value={formData.price}
            onChange={e => setFormData({ ...formData, price: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Marque / Notes</label>
        <input
          type="text"
          placeholder="Ex: Castrol, Bosch, Filtre changé..."
          className="w-full p-3.5 bg-slate-50 border-none rounded-2xl text-sm text-slate-900 font-medium focus:ring-2 focus:ring-blue-500 outline-none"
          value={formData.brand}
          onChange={e => setFormData({ ...formData, brand: e.target.value })}
        />
      </div>

      <div className="flex items-center gap-4">
        <label className="flex-1 cursor-pointer flex items-center justify-center gap-2 p-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 hover:border-blue-400 hover:text-blue-500 transition-all bg-slate-50/50">
          <CameraIcon size={20} />
          <span className="text-xs font-bold uppercase tracking-wider">Photo facture/pièce</span>
          <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
        </label>
        {preview && (
          <div className="relative w-16 h-16 bg-slate-100 rounded-2xl overflow-hidden border-2 border-white shadow-md">
            <img src={preview} className="w-full h-full object-cover" alt="Preview" />
            <button
              type="button"
              onClick={() => { setPhoto(null); setPreview(null); }}
              className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-bl-xl"
            >
              <XIcon size={10} />
            </button>
          </div>
        )}
      </div>

      <button
        type="submit"
        className="w-full py-4.5 bg-slate-900 text-white font-black rounded-[1.5rem] shadow-xl hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2"
      >
        ENREGISTRER L'ENTRETIEN
        <ChevronRight size={18} />
      </button>
    </form>
  );
};

export default MaintenanceForm;
