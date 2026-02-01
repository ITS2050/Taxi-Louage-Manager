import React, { useState } from 'react';
import { db } from '../db/database';
import { Settings as SettingsIcon, Droplets as DropletsIcon, Disc as DiscIcon, Compass as CompassIcon, Lightbulb as LightbulbIcon, Plus as PlusIcon, Camera as CameraIcon, X as XIcon } from 'lucide-react';

const CATEGORIES = [
  { id: 'Moteur', label: 'Moteur', icon: SettingsIcon },
  { id: 'Refroidissement', label: 'Refroidissement', icon: DropletsIcon },
  { id: 'Freinage', label: 'Freinage', icon: DiscIcon },
  { id: 'Direction', label: 'Direction', icon: CompassIcon },
  { id: 'Eclairage', label: 'Éclairage', icon: LightbulbIcon },
  { id: 'Autre', label: 'Autre', icon: PlusIcon },
];

const MaintenanceForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    mileage: '',
    category: 'Moteur',
    item: '',
    brand: '',
    price: '',
  });
  const [photo, setPhoto] = useState<Blob | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await db.maintenance.add({
      ...formData,
      mileage: Number(formData.mileage),
      price: Number(formData.price),
      photo: photo || undefined,
    });
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white rounded-xl shadow-sm">
      <h3 className="text-lg font-bold text-slate-800">Nouvel Entretien</h3>
      
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Date</label>
          <input
            type="date"
            required
            className="w-full p-2 border rounded-lg text-slate-900"
            value={formData.date}
            onChange={e => setFormData({ ...formData, date: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Kilométrage</label>
          <input
            type="number"
            placeholder="Km"
            required
            className="w-full p-2 border rounded-lg text-slate-900"
            value={formData.mileage}
            onChange={e => setFormData({ ...formData, mileage: e.target.value })}
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-500 mb-2">Catégorie</label>
        <div className="grid grid-cols-3 gap-2">
          {CATEGORIES.map(cat => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setFormData({ ...formData, category: cat.id })}
                className={`flex flex-col items-center p-2 rounded-lg border transition-all ${
                  formData.category === cat.id ? 'bg-blue-50 border-blue-500 text-blue-600' : 'bg-slate-50 border-transparent text-slate-500'
                }`}
              >
                <Icon size={20} />
                <span className="text-[10px] mt-1">{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">Pièce / Service</label>
        <input
          type="text"
          placeholder="Ex: Vidange 10k, Plaquettes..."
          required
          className="w-full p-2 border rounded-lg text-slate-900"
          value={formData.item}
          onChange={e => setFormData({ ...formData, item: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Marque</label>
          <input
            type="text"
            placeholder="Ex: Castrol, Bosch..."
            className="w-full p-2 border rounded-lg text-slate-900"
            value={formData.brand}
            onChange={e => setFormData({ ...formData, brand: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Prix (DT)</label>
          <input
            type="number"
            step="0.001"
            placeholder="0.000"
            required
            className="w-full p-2 border rounded-lg text-slate-900"
            value={formData.price}
            onChange={e => setFormData({ ...formData, price: e.target.value })}
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <label className="flex-1 cursor-pointer flex items-center justify-center gap-2 p-3 border-2 border-dashed border-slate-300 rounded-lg text-slate-500 hover:border-blue-400 hover:text-blue-500 transition-colors">
          <CameraIcon size={20} />
          <span className="text-sm">Ajouter une photo</span>
          <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
        </label>
        {preview && (
          <div className="relative w-16 h-16 bg-slate-100 rounded-lg overflow-hidden border">
            <img src={preview} className="w-full h-full object-cover" alt="Preview" />
            <button
              type="button"
              onClick={() => { setPhoto(null); setPreview(null); }}
              className="absolute top-0 right-0 p-0.5 bg-red-500 text-white rounded-bl-lg"
            >
              <XIcon size={12} />
            </button>
          </div>
        )}
      </div>

      <button
        type="submit"
        className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg active:scale-95 transition-transform"
      >
        Enregistrer l'Entretien
      </button>
    </form>
  );
};

export default MaintenanceForm;
