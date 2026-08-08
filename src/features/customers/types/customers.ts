export interface Customer {
  id: string;
  fullName: string;
  tc: string;
  vkn: string;
  taxOffice: string;
  billingAddress: string;
  phone: string;
  email: string;
  createdAt: string;
}

export type CustomerFormValues = Omit<Customer, 'id' | 'createdAt'>;
