
import Dexie, { type Table } from 'dexie';

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
    // Définition du schéma de la base de données avec la méthode version() héritée de Dexie
    this.version(3).stores({ // Incrément de version pour le nouveau champ
      userProfile: '++id',
      revenue: '++id, date',
      maintenance: '++id, date, mileage',
      expenses: '++id, category, type, expiryDate'
    });
  }
}

export const db = new AppDatabase();
