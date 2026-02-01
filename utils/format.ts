
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('fr-TN', {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  }).format(value) + ' DT';
};

export const formatDate = (date: string | Date): string => {
  return new Intl.DateTimeFormat('fr-TN', {
    dateStyle: 'medium',
  }).format(new Date(date));
};

export const getLicenseCode = (plate: string, durationDays: 30 | 90): string => {
  const salt = "TUNISIE_TAXI_LOUAGE_SECRET_2025";
  const input = plate.replace(/\s+/g, '').toUpperCase() + salt + durationDays;
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  const code = Math.abs(hash).toString().padStart(8, '0').substring(0, 8);
  return code;
};
