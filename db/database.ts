import { Dexie, type Table } from 'dexie';

export interface UserProfile {
  id?: number;
  type: 'Taxi' | 'Louage';
  firstName: string;
  lastName: string;
  phone: string;
  plate: string;
  pin: string;
  fuelType: string; // Nouveau champ pour le type de moteur/carburant
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
    
    // Fix: Defining the schema inside the constructor is the recommended pattern for Dexie with TypeScript.
    // This ensures that the version() method from the base Dexie class is correctly prioritized 
    // and available for configuration during instance initialization.
    this.version(3).stores({
      userProfile: '++id',
      revenue: '++id, date',
      maintenance: '++id, date, mileage',
      expenses: '++id, category, type, expiryDate'
    });
  }
}

export const db = new AppDatabase();
