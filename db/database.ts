
import { Dexie, Table } from 'dexie';

export interface UserProfile {
  id?: number;
  type: 'Taxi' | 'Louage';
  firstName: string;
  lastName: string;
  phone: string;
  plate: string;
  pin: string;
  trialStartDate: number;
  licenseExpiryDate: number;
}

export interface RevenueRecord {
  id?: number;
  date: string;
  shift: 'Matin' | 'Soir' | 'Journée';
  grossAmount: number;
  fuelAmount: number; // Litres
  fuelCost: number; // DT
  fuelType: string[]; // ['Essence', 'GPL']
  otherExpenses: number;
  mileageStart: number;
  mileageEnd: number;
}

export interface MaintenanceRecord {
  id?: number;
  date: string;
  mileage: number;
  category: string;
  item: string;
  brand: string;
  price: number;
  photo?: Blob;
}

export interface ExpenseRecord {
  id?: number;
  type: 'Fixe' | 'Variable';
  category: 'Assurance' | 'Vignette' | 'Taxe' | 'Loyer' | 'Parking' | 'Lavage' | 'Autre';
  amount: number;
  frequency: 'Quotidien' | 'Hebdomadaire' | 'Mensuel' | 'Trimestriel' | 'Annuel';
  expiryDate?: string;
}

export class AppDatabase extends Dexie {
  userProfile!: Table<UserProfile>;
  revenue!: Table<RevenueRecord>;
  maintenance!: Table<MaintenanceRecord>;
  expenses!: Table<ExpenseRecord>;

  constructor() {
    super('TaxiLouageManagerDB');
    this.version(2).stores({
      userProfile: '++id',
      revenue: '++id, date',
      maintenance: '++id, date, mileage',
      expenses: '++id, category, type, expiryDate'
    });
  }
}

export const db = new AppDatabase();
