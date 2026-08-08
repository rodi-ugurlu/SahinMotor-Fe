export interface DealerUser {
  id: string;
  name: string;
  role: string;
  email: string;
}

export interface Dealer {
  id: string;
  name: string;
  description: string;
  logoUrl?: string;
  assignedUserIds: string[];
  createdAt: string;
}

export type DealerFormValues = {
  name: string;
  description: string;
  logoUrl?: string;
};
