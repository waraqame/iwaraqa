export interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  isVerified: boolean;
  isAdmin: boolean;
  credits: number;
  createdAt: Date;
}