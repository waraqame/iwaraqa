export interface AdminUser {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  isVerified: boolean;
  isAdmin: boolean;
  credits: number;
  createdAt: Date;
  lastLoginAt?: Date;
  status: 'active' | 'suspended' | 'deleted';
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalCredits: number;
  creditsUsed: number;
  revenue: number;
  growthRate: number;
}

export interface APIKeyData {
  id: number;
  key: string;
  name: string;
  createdAt: Date;
  lastUsedAt?: Date;
  status: 'active' | 'revoked';
  usageCount: number;
}

export interface UsageStats {
  date: string;
  users: number;
  credits: number;
  apiCalls: number;
  revenue: number;
}