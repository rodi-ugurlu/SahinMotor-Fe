import type { Customer } from '../types/customers';

const MOCK_CUSTOMERS: Customer[] = [
  {
    id: 'c1', fullName: 'Ahmet Yılmaz', tc: '12345678901', vkn: '1234567890',
    taxOffice: 'Kadıköy', billingAddress: 'Caferağa Mah. Moda Cad. No:12 Kadıköy/İstanbul',
    phone: '0532 123 45 67', email: 'ahmet@mail.com', createdAt: '15.01.2026',
  },
  {
    id: 'c2', fullName: 'Mehmet Kaya', tc: '23456789012', vkn: '2345678901',
    taxOffice: 'Beşiktaş', billingAddress: 'Sinanpaşa Mah. Barbaros Bulvarı No:45 Beşiktaş/İstanbul',
    phone: '0533 987 65 43', email: 'mehmet@mail.com', createdAt: '22.02.2026',
  },
  {
    id: 'c3', fullName: 'Ayşe Demir', tc: '34567890123', vkn: '3456789012',
    taxOffice: 'Çankaya', billingAddress: 'Kızılay Mah. Atatürk Bulvarı No:88 Çankaya/Ankara',
    phone: '0555 456 78 90', email: 'ayse@mail.com', createdAt: '10.03.2026',
  },
  {
    id: 'c4', fullName: 'Ali Öztürk', tc: '45678901234', vkn: '4567890123',
    taxOffice: 'Osmangazi', billingAddress: 'Altıparmak Mah. Cumhuriyet Cad. No:33 Osmangazi/Bursa',
    phone: '0542 111 22 33', email: 'ali@mail.com', createdAt: '05.04.2026',
  },
  {
    id: 'c5', fullName: 'Can Yıldız', tc: '56789012345', vkn: '5678901234',
    taxOffice: 'Konak', billingAddress: 'Alsancak Mah. Kıbrıs Şehitleri Cad. No:77 Konak/İzmir',
    phone: '0530 444 55 66', email: 'can@mail.com', createdAt: '18.05.2026',
  },
  {
    id: 'c6', fullName: 'Zeynep Şahin', tc: '67890123456', vkn: '6789012345',
    taxOffice: 'Melikgazi', billingAddress: 'Hunat Mah. Sivas Cad. No:22 Melikgazi/Kayseri',
    phone: '0541 333 22 11', email: 'zeynep@mail.com', createdAt: '30.06.2026',
  },
];

let customers = [...MOCK_CUSTOMERS];

export async function getCustomers(): Promise<Customer[]> {
  return new Promise((resolve) => setTimeout(() => resolve([...customers]), 400));
}

export async function addCustomer(data: Omit<Customer, 'id' | 'createdAt'>): Promise<Customer> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const customer: Customer = {
        ...data,
        id: `c-${Date.now()}`,
        createdAt: new Date().toLocaleDateString('tr-TR'),
      };
      customers = [customer, ...customers];
      resolve(customer);
    }, 300);
  });
}

export async function updateCustomer(id: string, data: Partial<Omit<Customer, 'id' | 'createdAt'>>): Promise<Customer> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = customers.findIndex((c) => c.id === id);
      if (index === -1) return reject(new Error('Müşteri bulunamadı'));
      customers[index] = { ...customers[index], ...data };
      resolve(customers[index]);
    }, 300);
  });
}

export async function deleteCustomer(id: string): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      customers = customers.filter((c) => c.id !== id);
      resolve();
    }, 300);
  });
}
