
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { db, UserProfile } from '../db/database';
import { getLicenseCode } from '../utils/format';

interface LicenseContextType {
  user: UserProfile | null;
  isLoading: boolean;
  daysRemaining: number;
  isTrialExpired: boolean;
  showWarning: boolean;
  canEnterCode: boolean;
  activateLicense: (code: string) => Promise<boolean>;
  refreshUser: () => Promise<void>;
}

const LicenseContext = createContext<LicenseContextType | undefined>(undefined);

export const LicenseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    setIsLoading(true);
    try {
      const profile = await db.userProfile.toCollection().first();
      if (profile) {
        setUser(profile);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error("Erreur DB:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const now = Date.now();
  const expiry = user?.licenseExpiryDate || 0;
  const daysRemaining = Math.max(0, Math.ceil((expiry - now) / (1000 * 60 * 60 * 24)));
  const isTrialExpired = daysRemaining <= 0 && user !== null;
  const showWarning = daysRemaining <= 5 && user !== null;
  const canEnterCode = (daysRemaining <= 5 || isTrialExpired) && user !== null;

  const activateLicense = async (code: string): Promise<boolean> => {
    if (!user) return false;
    
    // On vérifie les 4 durées possibles
    const code30 = getLicenseCode(user.plate, 30);
    const code90 = getLicenseCode(user.plate, 90);
    const code180 = getLicenseCode(user.plate, 180);
    const code365 = getLicenseCode(user.plate, 365);

    let extraTime = 0;
    if (code === code30) extraTime = 30;
    else if (code === code90) extraTime = 90;
    else if (code === code180) extraTime = 180;
    else if (code === code365) extraTime = 365;

    if (extraTime > 0) {
      const newExpiry = Math.max(now, user.licenseExpiryDate) + (extraTime * 24 * 60 * 60 * 1000);
      await db.userProfile.update(user.id!, { licenseExpiryDate: newExpiry });
      await refreshUser();
      return true;
    }
    return false;
  };

  return (
    <LicenseContext.Provider value={{
      user,
      isLoading,
      daysRemaining,
      isTrialExpired,
      showWarning,
      canEnterCode,
      activateLicense,
      refreshUser
    }}>
      {children}
    </LicenseContext.Provider>
  );
};

export const useLicense = () => {
  const context = useContext(LicenseContext);
  if (context === undefined) {
    throw new Error('useLicense must be used within a LicenseProvider');
  }
  return context;
};
