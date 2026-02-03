
import { Dexie, type Table } from 'dexie';

export interface UserProfile {
  id?: number;
  type: 'Taxi' | 'Louage';
  firstName: string;
  lastName: string;
  phone: string;
  plate: string;
  pin: string;
  fuelType: string;
  trialStartDate: number;
  licenseExpiryDate: number;
}

export interface RevenueRecord {
  id?: number;
  date: string;
  shift: 'Matin' | 'Soir' | 'Journée';
  grossAmount: number;
  fuelAmount: number;
  fuelCost: number;
  fuelType: string[];
  driverShare: number; // Nouveau: Part prélevée par/pour le chauffeur
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
    
    // Fix: Explicitly cast 'this' to 'Dexie' to ensure the TypeScript compiler correctly 
    // identifies the 'version' method from the Dexie base class, resolving the error where 
    // 'version' was not recognized on the AppDatabase type.
    (this as Dexie).version(4).stores({
      userProfile: '++id',
      revenue: '++id, date',
      maintenance: '++id, date, mileage',
      expenses: '++id, category, type, expiryDate'
    });
  }
}

export const db = new AppDatabase();
