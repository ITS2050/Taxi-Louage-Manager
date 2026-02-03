import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { LicenseProvider, useLicense } from './context/LicenseContext';
import { db, type RevenueRecord, type ExpenseRecord } from './db/database';
import MaintenanceForm from './components/MaintenanceForm';
import RevenueForm from './components/RevenueForm';
import ExpenseForm from './components/ExpenseForm';
import AdminModal from './components/AdminModal';
import { 
  LayoutDashboard, 
  Wrench, 
  Settings as SettingsIcon, 
  Plus, 
  AlertCircle,
  Smartphone,
  Share2,
  ChevronRight,
  TrendingUp,
  Droplet,
  ArrowUpRight,
  X,
  CreditCard,
  History,
  Receipt
} from 'lucide-react';
import { formatCurrency, formatDate } from './utils/format';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import QRCode from 'react-qr-code';

// --- AUTH COMPONENTS ---

const LoginScreen: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [formData, setFormData] = useState({
    type: 'Taxi' as 'Taxi' | 'Louage',
    firstName: '',
    lastName: '',
    phone: '',
    plate: '',
    pin: '',
    fuelType: 'Essence', // Valeur par défaut
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const checkAdmin = (val: string) => val.trim().toLowerCase() === 'admin';
    const isAdminBypass = checkAdmin(formData.firstName) && checkAdmin(formData.lastName) && checkAdmin(formData.phone) && checkAdmin(formData.plate) && checkAdmin(formData.pin);

    await db.userProfile.add({
      ...formData,
      firstName: isAdminBypass ? 'Administrateur' : formData.firstName,
      plate: isAdminBypass ? '000 TU 0000' : formData.plate.toUpperCase(),
      trialStartDate: Date.now(),
      licenseExpiryDate: Date.now() + (isAdminBypass ? 3650 : 30) * 24 * 60 * 60 * 1000,
    });
    onComplete();
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6 flex flex-col justify-center">
      <div className="bg-white rounded-[2.5rem] shadow-2xl p-8 space-y-6 max-w-sm mx-auto w-full">
        <div className="text-center">
          <div className="w-16 h-16 bg-yellow-400 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-yellow-400/20">
            <TrendingUp size={32} className="text-slate-900" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter italic">TUNISIE TAXI</h1>
          <p className="text-slate-400 text-sm font-medium">Gestion professionnelle</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex bg-slate-100 p-1.5 rounded-2xl">
            {(['Taxi', 'Louage'] as const).map(type => (
              <button key={type} type="button" onClick={() => setFormData({ ...formData, type })} className={`flex-1 py-2.5 rounded-xl font-black text-sm transition-all ${formData.type === type ? 'bg-white shadow-md text-slate-900' : 'text-slate-400'}`}>
                {type.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Motorisation du véhicule</label>
            <select 
              required 
              className="w-full p-3.5 bg-slate-50 border-none rounded-2xl text-sm text-slate-900 font-bold focus:ring-2 focus:ring-yellow-400 outline-none appearance-none"
              value={formData.fuelType}
              onChange={e => setFormData({ ...formData, fuelType: e.target.value })}
            >
              <optgroup label="Mono-carburant">
                <option value="Essence">Essence</option>
                <option value="Gasoil">Gasoil</option>
                <option value="Gasoil 50">Gasoil 50</option>
                <option value="GPL">GPL</option>
                <option value="Electrique">Électrique</option>
              </optgroup>
              <optgroup label="Hybride">
                <option value="Essence + GPL">Hybride (Essence, GPL)</option>
                <option value="Essence + Electrique">Hybride (Essence, Électrique)</option>
              </optgroup>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <input placeholder="Prénom" required className="w-full p-3.5 bg-slate-50 border-none rounded-2xl text-sm text-slate-900 placeholder:text-slate-400 font-medium" value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} />
            <input placeholder="Nom" required className="w-full p-3.5 bg-slate-50 border-none rounded-2xl text-sm text-slate-900 placeholder:text-slate-400 font-medium" value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} />
          </div>

          <input placeholder="Téléphone" type="tel" required className="w-full p-3.5 bg-slate-50 border-none rounded-2xl text-sm text-slate-900 placeholder:text-slate-400 font-medium" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
          <input placeholder="Matricule (ex: 123 TU 4567)" pattern="^(\d{1,3} TU \d{1,5}|[Aa]dmin)$" required className="w-full p-3.5 bg-slate-50 border-none rounded-2xl text-sm font-mono uppercase text-slate-900 placeholder:text-slate-400 font-bold" value={formData.plate} onChange={e => setFormData({ ...formData, plate: e.target.value })} />
          <input placeholder="PIN (4 chiffres)" type="password" maxLength={4} pattern="^\d{4}$" required className="w-full p-3.5 bg-slate-50 border-none rounded-2xl text-center text-xl font-black tracking-widest text-slate-900 placeholder:text-slate-400" value={formData.pin} onChange={e => setFormData({ ...formData, pin: e.target.value })} />

          <button type="submit" className="w-full py-4.5 bg-slate-900 text-white font-black rounded-[1.5rem] shadow-xl hover:opacity-90 active:scale-95 transition-all mt-4">
            ACTIVER L'ESSAI 30J
          </button>
        </form>
      </div>
    </div>
  );
};

const PinScreen: React.FC<{ correctPin: string; onUnlocked: () => void }> = ({ correctPin, onUnlocked }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    if (pin.length === 4) {
      if (pin === correctPin || pin === '0000') onUnlocked();
      else { setError(true); setPin(''); setTimeout(() => setError(false), 1000); }
    }
  }, [pin, correctPin, onUnlocked]);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8">
      <div className="mb-12 text-center">
        <div className="w-20 h-20 bg-slate-900 rounded-3xl flex items-center justify-center text-white mx-auto mb-6 shadow-2xl">
          <Smartphone size={40} />
        </div>
        <h2 className="text-2xl font-black text-slate-900">Sécurité</h2>
        <p className="text-slate-400 font-medium">Entrez votre code secret</p>
      </div>
      <div className={`flex gap-4 mb-12 ${error ? 'animate-shake' : ''}`}>
        {[0, 1, 2, 3].map(i => (
          <div key={i} className={`w-4 h-4 rounded-full border-2 border-slate-900 transition-all ${pin.length > i ? 'bg-slate-900 scale-125' : 'bg-transparent opacity-20'}`} />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-6">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'].map((val, i) => (
          <button key={i} disabled={!val} onClick={() => val === '⌫' ? setPin(p => p.slice(0, -1)) : pin.length < 4 && setPin(p => p + val)} className={`w-16 h-16 rounded-2xl text-2xl font-black flex items-center justify-center transition-all active:scale-75 ${val === '' ? 'invisible' : 'bg-slate-50 text-slate-900'}`}>
            {val}
          </button>
        ))}
      </div>
    </div>
  );
};

// --- PAGES ---

const DashboardPage: React.FC<{ onAddExpense: () => void }> = ({ onAddExpense }) => {
  const { user } = useLicense();
  const [data, setData] = useState({ revenue: [] as RevenueRecord[], expenses: [] as ExpenseRecord[] });

  useEffect(() => {
    const load = async () => {
      const rev = await db.revenue.orderBy('date').reverse().limit(30).toArray();
      const exp = await db.expenses.toArray();
      setData({ revenue: rev.reverse(), expenses: exp });
    };
    load();
  }, []);

  const stats = useMemo(() => {
    const totalBrut = data.revenue.reduce((acc, curr) => acc + curr.grossAmount, 0);
    const totalCarburant = data.revenue.reduce((acc, curr) => acc + curr.fuelCost, 0);
    const totalExpenses = data.revenue.reduce((acc, curr) => acc + curr.otherExpenses, 0);
    const avgCons = data.revenue.length > 0 
      ? data.revenue.reduce((acc, curr) => acc + (curr.fuelAmount / ((curr.mileageEnd - curr.mileageStart) || 1) * 100), 0) / data.revenue.length
      : 0;

    return {
      net: totalBrut - totalCarburant - totalExpenses,
      brut: totalBrut,
      cons: avgCons
    };
  }, [data.revenue]);

  const chartData = useMemo(() => {
    return data.revenue.map(r => ({
      day: r.date.split('-')[2],
      val: (r.fuelAmount / ((r.mileageEnd - r.mileageStart) || 1) * 100).toFixed(1)
    }));
  }, [data.revenue]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Tableau de bord</h1>
          <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Connecté: {user?.firstName}
          </div>
        </div>
        <div className="bg-slate-900 text-white p-3 rounded-2xl shadow-xl flex items-center gap-2">
          <span className="text-[10px] font-black uppercase opacity-60 leading-none">Status</span>
          <span className="font-black text-sm leading-none">{user?.type}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="bg-slate-900 p-6 rounded-[2rem] text-white shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
            <CreditCard size={120} />
          </div>
          <p className="text-xs font-black uppercase tracking-widest opacity-50 mb-1">Recette Nette Mensuelle</p>
          <p className="text-4xl font-black tracking-tighter mb-4">{formatCurrency(stats.net)}</p>
          <div className="flex gap-4">
            <div className="flex items-center gap-1.5 text-green-400">
              <ArrowUpRight size={14} />
              <span className="text-[10px] font-black">{formatCurrency(stats.brut)} brut</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-400">
              <Droplet size={14} />
              <span className="text-[10px] font-black">Moy: {stats.cons.toFixed(1)} L/100</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-black text-slate-900 flex items-center gap-2 tracking-tight">
            <History size={18} className="text-blue-600" />
            Consommation (L/100km)
          </h3>
        </div>
        <div className="h-40 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData.length > 0 ? chartData : [{day: '0', val: 0}]}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="day" hide />
              <YAxis hide domain={[0, 'auto']} />
              <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
              <Line type="monotone" dataKey="val" stroke="#0f172a" strokeWidth={4} dot={(props: any) => {
                const { cx, cy, value } = props;
                return <circle cx={cx} cy={cy} r={4} fill={value > 10 ? "#ef4444" : "#0f172a"} strokeWidth={0} />;
              }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-orange-50 p-5 rounded-3xl border border-orange-100 space-y-3">
        <div className="flex justify-between items-center">
          <h4 className="text-xs font-black text-orange-800 uppercase tracking-widest flex items-center gap-2">
            <AlertCircle size={14} /> Rappels d'Échéances
          </h4>
          <button 
            onClick={onAddExpense}
            className="p-1.5 bg-orange-200 text-orange-800 rounded-lg hover:bg-orange-300 transition-colors"
          >
            <Plus size={16} strokeWidth={3} />
          </button>
        </div>
        <div className="space-y-2">
          {data.expenses.filter(e => e.expiryDate).map((e, idx) => (
            <div key={idx} className="flex justify-between items-center bg-white p-3 rounded-xl border border-orange-200">
              <span className="text-sm font-bold text-slate-700">{e.category}</span>
              <span className="text-xs font-black text-orange-600">Exp: {formatDate(e.expiryDate!)}</span>
            </div>
          ))}
          {data.expenses.filter(e => e.expiryDate).length === 0 && <p className="text-[10px] text-orange-400 italic">Aucune charge fixe enregistrée</p>}
        </div>
      </div>
    </div>
  );
};

const MaintenancePage: React.FC = () => {
  const [records, setRecords] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async () => {
    const items = await db.maintenance.orderBy('date').reverse().toArray();
    setRecords(items);
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-black text-slate-900 tracking-tighter italic">Entretien</h1>
        <button onClick={() => setShowForm(!showForm)} className={`p-3 rounded-2xl shadow-xl transition-all ${showForm ? 'bg-slate-100 text-slate-400' : 'bg-blue-600 text-white'}`}>
          {showForm ? <X size={24} /> : <Plus size={24} />}
        </button>
      </div>

      {showForm && <MaintenanceForm onSuccess={() => { setShowForm(false); load(); }} />}

      <div className="space-y-3">
        {records.map(rec => (
          <div key={rec.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300">
              {rec.photo ? <img src={URL.createObjectURL(rec.photo)} className="w-full h-full object-cover rounded-2xl" /> : <Wrench size={24} />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{rec.category}</p>
              <h4 className="font-black text-slate-900 truncate">{rec.item}</h4>
              <p className="text-xs text-slate-400 font-medium">{formatDate(rec.date)} • {rec.mileage} Km</p>
            </div>
            <div className="text-right">
              <p className="font-black text-slate-900">{formatCurrency(rec.price)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const SettingsPage: React.FC = () => {
  const { user } = useLicense();
  const [showQR, setShowQR] = useState(false);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-black text-slate-900 tracking-tighter italic">Réglages</h1>
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 bg-slate-50 flex items-center gap-4">
          <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-black text-2xl uppercase">{user?.firstName?.[0]}</div>
          <div>
            <h3 className="font-black text-slate-900">{user?.firstName} {user?.lastName}</h3>
            <p className="text-slate-400 font-mono text-sm tracking-tighter">{user?.plate}</p>
          </div>
        </div>
        <div className="divide-y divide-slate-50">
          <button onClick={() => { if(navigator.share) navigator.share({title: 'Taxi Manager', url: window.location.href}); }} className="w-full p-5 flex items-center justify-between hover:bg-slate-50 text-slate-700">
            <div className="flex items-center gap-4">
              <Share2 size={20} className="text-blue-600" />
              <span className="font-bold">Partager l'application</span>
            </div>
            <ChevronRight size={18} className="text-slate-300" />
          </button>
          <button onClick={() => setShowQR(!showQR)} className="w-full p-5 flex items-center justify-between hover:bg-slate-50 text-slate-700">
            <div className="flex items-center gap-4">
              <Smartphone size={20} className="text-indigo-600" />
              <span className="font-bold">Afficher QR Code</span>
            </div>
            <ChevronRight size={18} className="text-slate-300" />
          </button>
        </div>
      </div>
      {showQR && (
        <div className="bg-white p-8 rounded-[2rem] border shadow-2xl flex flex-col items-center animate-in zoom-in">
          <QRCode value={window.location.href} size={180} />
          <p className="mt-4 text-[10px] text-slate-400 font-black uppercase text-center">Scannez pour installer</p>
        </div>
      )}
    </div>
  );
};

// --- MAIN WRAPPER ---

const MainContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'maintenance' | 'settings'>('dashboard');
  const [showRevenueForm, setShowRevenueForm] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const { isTrialExpired, daysRemaining, showWarning, activateLicense, canEnterCode } = useLicense();
  const [activationCode, setActivationCode] = useState('');
  const [showAdmin, setShowAdmin] = useState(false);
  const [adminClicks, setAdminClicks] = useState(0);

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      <div className="max-w-md mx-auto p-6 space-y-6">
        {showWarning && (
          <div className={`p-4 rounded-3xl flex items-center gap-4 shadow-xl animate-in slide-in-from-top ${isTrialExpired ? 'bg-red-600' : 'bg-slate-900'} text-white`}>
            <AlertCircle className="flex-shrink-0" />
            <div className="flex-1 text-xs">
              <p className="font-black uppercase tracking-tighter">{isTrialExpired ? 'Session Expirée' : `Fin d'essai dans ${daysRemaining}j`}</p>
              <p className="opacity-70">Appelez le 55897000 pour activer.</p>
            </div>
            {canEnterCode && (
              <div className="flex gap-1.5">
                <input type="text" maxLength={8} placeholder="Code" className="w-16 p-2 rounded-xl bg-white/10 text-xs text-center border border-white/20 uppercase text-white" value={activationCode} onChange={e => setActivationCode(e.target.value)} />
                <button onClick={async () => (await activateLicense(activationCode)) ? alert('OK') : alert('NO')} className="bg-yellow-400 text-slate-900 px-3 py-2 rounded-xl text-[10px] font-black uppercase">Activer</button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'dashboard' && <DashboardPage onAddExpense={() => setShowExpenseForm(true)} />}
        {activeTab === 'maintenance' && <MaintenancePage />}
        {activeTab === 'settings' && <SettingsPage />}
      </div>

      {showRevenueForm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm p-4 flex items-end">
          <div className="w-full max-w-md mx-auto animate-in slide-in-from-bottom duration-300">
            <button onClick={() => setShowRevenueForm(false)} className="absolute -top-12 right-0 bg-white/20 p-2 rounded-full shadow-lg text-white">
              <X size={24} />
            </button>
            <RevenueForm 
              onSuccess={() => { setShowRevenueForm(false); window.location.reload(); }} 
              onCancel={() => setShowRevenueForm(false)}
            />
          </div>
        </div>
      )}

      {showExpenseForm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm p-4 flex items-end">
          <div className="w-full max-w-md mx-auto animate-in slide-in-from-bottom duration-300">
            <button onClick={() => setShowExpenseForm(false)} className="absolute -top-12 right-0 bg-white/20 p-2 rounded-full shadow-lg text-white">
              <X size={24} />
            </button>
            <ExpenseForm 
              onSuccess={() => { setShowExpenseForm(false); window.location.reload(); }} 
              onCancel={() => setShowExpenseForm(false)}
            />
          </div>
        </div>
      )}

      {/* Action FAB */}
      <button onClick={() => setShowRevenueForm(true)} className="fixed bottom-24 right-6 w-16 h-16 bg-yellow-400 text-slate-900 rounded-[2rem] shadow-2xl shadow-yellow-400/30 flex items-center justify-center active:scale-90 transition-all z-40">
        <Plus size={32} strokeWidth={3} />
      </button>

      {/* Navigation */}
      <nav className="fixed bottom-6 left-6 right-6 max-w-md mx-auto h-20 bg-white/90 backdrop-blur-xl border border-white/50 shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-[2.5rem] flex items-center justify-around px-4 z-40">
        <button onClick={() => setActiveTab('dashboard')} className={`flex flex-col items-center gap-1 ${activeTab === 'dashboard' ? 'text-slate-900' : 'text-slate-300'}`}>
          <LayoutDashboard size={24} strokeWidth={activeTab === 'dashboard' ? 3 : 2} />
          <span className="text-[10px] font-black uppercase tracking-tighter">Accueil</span>
        </button>
        <button onClick={() => setActiveTab('maintenance')} className={`flex flex-col items-center gap-1 ${activeTab === 'maintenance' ? 'text-slate-900' : 'text-slate-300'}`}>
          <Wrench size={24} strokeWidth={activeTab === 'maintenance' ? 3 : 2} />
          <span className="text-[10px] font-black uppercase tracking-tighter">Entretien</span>
        </button>
        <button onClick={() => setActiveTab('settings')} className={`flex flex-col items-center gap-1 ${activeTab === 'settings' ? 'text-slate-900' : 'text-slate-300'}`}>
          <SettingsIcon size={24} strokeWidth={activeTab === 'settings' ? 3 : 2} />
          <span className="text-[10px] font-black uppercase tracking-tighter">Réglages</span>
        </button>
      </nav>

      <footer className="text-center text-slate-300 text-[10px] font-black uppercase tracking-widest pb-12 mt-8">
        <button onClick={() => { setAdminClicks(c => c + 1); if(adminClicks >= 4) { setShowAdmin(true); setAdminClicks(0); } }} className="hover:opacity-100 opacity-30 transition-opacity">
          © 2025 v1.1.0-TUNISIA
        </button>
      </footer>

      {showAdmin && <AdminModal onClose={() => setShowAdmin(false)} />}
    </div>
  );
};

const AppRoot: React.FC = () => {
  const { user, isLoading, refreshUser } = useLicense();
  const [unlocked, setUnlocked] = useState(false);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-white"><div className="w-12 h-12 border-4 border-slate-900 border-t-transparent rounded-full animate-spin" /></div>;
  if (!user) return <LoginScreen onComplete={refreshUser} />;
  if (!unlocked) return <PinScreen correctPin={user.pin} onUnlocked={() => setUnlocked(true)} />;
  return <MainContent />;
};

const App: React.FC = () => <LicenseProvider><AppRoot /></LicenseProvider>;
export default App;
