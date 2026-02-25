import { 
  Settings, 
  Thermometer, 
  Disc, 
  CircleDot, 
  ArrowDownUp, 
  Zap, 
  Battery, 
  Wind,
  LucideIcon 
} from 'lucide-react';

export interface SubSystem {
  id: string;
  label: string;
  defaultInterval: number;
}

export interface MaintenanceSystem {
  id: string;
  label: string;
  icon: LucideIcon;
  subSystems: SubSystem[];
}

export const MAINTENANCE_SYSTEMS: MaintenanceSystem[] = [
  {
    id: 'motorisation',
    label: 'Motorisation',
    icon: Settings,
    subSystems: [
      { id: 'vidange', label: 'Vidange Huile', defaultInterval: 10000 },
      { id: 'filtre_huile', label: 'Filtre à Huile', defaultInterval: 10000 },
      { id: 'filtre_air', label: 'Filtre à Air', defaultInterval: 20000 },
      { id: 'filtre_carburant', label: 'Filtre Carburant', defaultInterval: 30000 },
      { id: 'courroie', label: 'Courroie Distribution', defaultInterval: 80000 },
      { id: 'bougies', label: 'Bougies', defaultInterval: 40000 },
    ]
  },
  {
    id: 'refroidissement',
    label: 'Refroidissement',
    icon: Thermometer,
    subSystems: [
      { id: 'liquide_refroidissement', label: 'Liquide Refroidissement', defaultInterval: 40000 },
      { id: 'pompe_eau', label: 'Pompe à Eau', defaultInterval: 80000 },
      { id: 'radiateur', label: 'Radiateur', defaultInterval: 100000 },
    ]
  },
  {
    id: 'freinage',
    label: 'Freinage',
    icon: Disc,
    subSystems: [
      { id: 'plaquettes_av', label: 'Plaquettes AV', defaultInterval: 30000 },
      { id: 'plaquettes_ar', label: 'Plaquettes AR', defaultInterval: 40000 },
      { id: 'disques', label: 'Disques de Frein', defaultInterval: 80000 },
      { id: 'liquide_frein', label: 'Liquide de Frein', defaultInterval: 40000 },
    ]
  },
  {
    id: 'pneumatique',
    label: 'Pneumatique',
    icon: CircleDot,
    subSystems: [
      { id: 'pneus_av', label: 'Pneus AV', defaultInterval: 40000 },
      { id: 'pneus_ar', label: 'Pneus AR', defaultInterval: 40000 },
      { id: 'parallelisme', label: 'Parallélisme', defaultInterval: 20000 },
    ]
  },
  {
    id: 'suspension',
    label: 'Suspension',
    icon: ArrowDownUp,
    subSystems: [
      { id: 'amortisseurs_av', label: 'Amortisseurs AV', defaultInterval: 80000 },
      { id: 'amortisseurs_ar', label: 'Amortisseurs AR', defaultInterval: 80000 },
      { id: 'silentblocs', label: 'Silentblocs', defaultInterval: 60000 },
    ]
  },
  {
    id: 'transmission',
    label: 'Transmission',
    icon: Zap,
    subSystems: [
      { id: 'embrayage', label: 'Kit Embrayage', defaultInterval: 100000 },
      { id: 'huile_boite', label: 'Huile de Boîte', defaultInterval: 60000 },
    ]
  },
  {
    id: 'electricite',
    label: 'Électricité',
    icon: Battery,
    subSystems: [
      { id: 'batterie', label: 'Batterie', defaultInterval: 48000 },
      { id: 'alternateur', label: 'Alternateur', defaultInterval: 120000 },
    ]
  },
  {
    id: 'climatisation',
    label: 'Climatisation',
    icon: Wind,
    subSystems: [
      { id: 'filtre_habitacle', label: 'Filtre Habitacle', defaultInterval: 20000 },
      { id: 'recharge_gaz', label: 'Recharge Gaz', defaultInterval: 40000 },
    ]
  }
];
