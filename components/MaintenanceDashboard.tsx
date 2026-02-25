import React, { useEffect, useState, useMemo } from 'react';
import { db, type MaintenanceTask } from '../db/database';
import { MAINTENANCE_SYSTEMS, MaintenanceSystem } from '../constants/maintenance';
import { AlertCircle, CheckCircle2, Clock, Wrench, LucideIcon } from 'lucide-react';

const MaintenanceDashboard = () => {
  const [tasks, setTasks] = useState<MaintenanceTask[]>([]);
  const [currentMileage, setCurrentMileage] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const allTasks = await db.maintenanceTasks.toArray();
      const lastRevenue = await db.revenue.orderBy('date').reverse().first();
      
      setTasks(allTasks);
      if (lastRevenue) {
        setCurrentMileage(lastRevenue.mileageEnd);
      }
      setLoading(false);
    };
    loadData();
  }, []);

  const systemStatus = useMemo(() => {
    return MAINTENANCE_SYSTEMS.map((system: MaintenanceSystem) => {
      const systemTasks = tasks.filter(t => t.systemId === system.id);
      
      let status: 'ok' | 'warning' | 'danger' = 'ok';
      let message = "Tout est en ordre";
      let worstDiff = Infinity;

      systemTasks.forEach(task => {
        const remaining = task.nextMaintenanceMileage - currentMileage;
        if (remaining <= 0) {
          status = 'danger';
          message = `Échéance dépassée: ${task.subSystem}`;
        } else if (remaining < 500 && status !== 'danger') {
          status = 'warning';
          message = `Bientôt: ${task.subSystem}`;
        }
        if (remaining < worstDiff) worstDiff = remaining;
      });

      return {
        ...system,
        status,
        message,
        tasks: systemTasks,
        worstDiff
      };
    });
  }, [tasks, currentMileage]);

  if (loading) return <div className="p-8 text-center text-slate-400 font-bold">Chargement du carnet...</div>;

  return (
    <div className="space-y-6 p-4">
      <div className="bg-slate-900 rounded-[2rem] p-6 text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Kilométrage Actuel</p>
          <h2 className="text-4xl font-black italic tracking-tighter">{currentMileage.toLocaleString()} <span className="text-xl not-italic text-slate-500">KM</span></h2>
          <div className="mt-4 flex gap-2">
            <div className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold flex items-center gap-1">
              <Wrench size={10} />
              {tasks.length} Tâches suivies
            </div>
          </div>
        </div>
        <div className="absolute -right-4 -bottom-4 opacity-10 transform rotate-12">
          <Wrench size={120} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {systemStatus.map((system) => {
          const Icon = system.icon;
          const statusColors: Record<'ok' | 'warning' | 'danger', string> = {
            ok: 'bg-emerald-50 text-emerald-600 border-emerald-100',
            warning: 'bg-amber-50 text-amber-600 border-amber-100',
            danger: 'bg-rose-50 text-rose-600 border-rose-100'
          };
          const StatusIcon: Record<'ok' | 'warning' | 'danger', LucideIcon> = {
            ok: CheckCircle2,
            warning: Clock,
            danger: AlertCircle
          };
          const CurrentStatusIcon = StatusIcon[system.status];

          return (
            <div key={system.id} className={`p-4 rounded-3xl border-2 transition-all bg-white ${system.status !== 'ok' ? 'border-opacity-100' : 'border-slate-50'}`}>
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${system.status === 'ok' ? 'bg-slate-100 text-slate-600' : statusColors[system.status]}`}>
                  <Icon size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="font-black text-slate-900 uppercase text-xs tracking-wider">{system.label}</h3>
                  <p className={`text-[10px] font-bold ${
                    system.status === 'ok' ? 'text-slate-400' : 
                    system.status === 'warning' ? 'text-amber-600' : 'text-rose-600'
                  }`}>
                    {system.message}
                  </p>
                </div>
                <div className={`px-3 py-1 rounded-full text-[10px] font-black flex items-center gap-1 ${statusColors[system.status]}`}>
                  <CurrentStatusIcon size={12} />
                  {system.status.toUpperCase()}
                </div>
              </div>

              {system.tasks.length > 0 && (
                <div className="mt-4 space-y-2">
                  {system.tasks.map((task: MaintenanceTask) => {
                    const remaining = task.nextMaintenanceMileage - currentMileage;
                    const progress = Math.max(0, Math.min(100, (1 - remaining / task.intervalKm) * 100));
                    
                    return (
                      <div key={task.id} className="bg-slate-50 rounded-xl p-3">
                        <div className="flex justify-between items-end mb-2">
                          <span className="text-[10px] font-bold text-slate-600 uppercase">{task.subSystem}</span>
                          <span className={`text-[10px] font-black ${remaining < 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                            {remaining < 0 ? `Retard: ${Math.abs(remaining)} km` : `${remaining} km restants`}
                          </span>
                        </div>
                        <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-500 ${remaining < 0 ? 'bg-rose-500' : remaining < 500 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MaintenanceDashboard;
