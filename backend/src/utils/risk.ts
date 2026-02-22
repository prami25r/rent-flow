export type RiskLevel = 'SAFE' | 'LOW' | 'MEDIUM' | 'HIGH';

export const calculateRiskLevel = (lateCount: number, currentDaysLate?: number): RiskLevel => {
  if (currentDaysLate && currentDaysLate >= 30) return 'HIGH';
  if (lateCount >= 5) return 'HIGH';
  if (lateCount >= 3) return 'MEDIUM';
  if (lateCount >= 1) return 'LOW';
  return 'SAFE';
};

