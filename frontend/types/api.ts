export type Landlord = {
  id: string;
  email: string;
  name: string;
};

export type AuthResponse = {
  landlord: Landlord;
  token: string;
};

export type RiskLevel = 'SAFE' | 'LOW' | 'MEDIUM' | 'HIGH';

export type Tenant = {
  id: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  phone?: string | null;
  unit: string;
  monthlyRent: number;
  riskLevel: RiskLevel;
  lateCount: number;
  createdAt: string;
  updatedAt: string;
};

export type Paginated<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
};

export type LateFeeConfig = {
  type: 'FLAT' | 'PERCENTAGE';
  amount: number;
  gracePeriodDays: number;
};

export type PaymentStatus = 'PENDING' | 'PARTIAL' | 'PAID' | 'FAILED';

export type Payment = {
  id: string;
  tenantId: string;
  dueDate: string;
  paidDate?: string | null;
  amountDue: number;
  amountPaid: number;
  status: PaymentStatus;
  lateFeesTotal: number;
};

export type EscalationStep = {
  dayOffset: number;
  action: string;
  applyFee: boolean;
  feeAmount?: number;
  feePercent?: number;
};

export type EscalationWorkflow = {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  steps: EscalationStep[];
};

export type AnalyticsSummary = {
  avgDaysLate: number;
  recoveryRate: number;
  totalLateFees: number;
  risk: Record<RiskLevel, number>;
  totalTenants: number;
  overdueCount: number;
  overdueSamples: Array<{
    id: string;
    tenantId: string;
    dueDate: string;
    amountDue: number;
    status: PaymentStatus;
    tenant: { id: string; firstName: string; lastName: string; unit: string };
  }>;
};
