import Dexie, { Table } from 'dexie';

export interface UserProfile {
  id?: number;
  firstName: string;
  lastName: string;
  plate: string;
  type: string;
  pin: string;
  licenseKey?: string;
  trialStartDate: string;
}

export interface RevenueRecord {
  id?: number;
  date: string;
  mileageStart: number;
  mileageEnd: number;
  totalRevenue: number;
  fuelAmount: number;
  expenses: number;
  notes?: string;
}

export interface MaintenanceRecord {
  id?: number;
  date: string;
  mileage: number;
  systemId: string;
  subSystem: string;
  brand: string;
  price: number;
  photo?: Blob;
  notes?: string;
}

export interface MaintenanceTask {
  id?: number;
  systemId: string;
  subSystem: string;
  intervalKm: number;
  lastMaintenanceMileage: number;
  nextMaintenanceMileage: number;
  isActive: boolean;
}

export interface ExpenseRecord {
  id?: number;
  category: string;
  type: string;
  amount: number;
  expiryDate?: string;
  frequency: 'Quotidien' | 'Hebdomadaire' | 'Mensuel' | 'Trimestriel' | 'Annuel';
}

export class AppDatabase extends Dexie {
  userProfile!: Table<UserProfile>;
  revenue!: Table<RevenueRecord>;
  maintenance!: Table<MaintenanceRecord>;
  maintenanceTasks!: Table<MaintenanceTask>;
  expenses!: Table<ExpenseRecord>;

  constructor() {
    super('TaxiLouageManagerDB');
    
    (this as Dexie).version(5).stores({
      userProfile: '++id',
      revenue: '++id, date',
      maintenance: '++id, date, mileage, systemId',
      maintenanceTasks: '++id, systemId, subSystem',
      expenses: '++id, category, type, expiryDate'
    });
  }
}

export const db = new AppDatabase();
