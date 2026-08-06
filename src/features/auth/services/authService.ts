import type { AuthRole, LoginCredentials, User } from '../types/auth';

export async function loginWithCredentials(
  role: AuthRole,
  credentials: LoginCredentials
): Promise<User> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (credentials.email === 'test@test.com' && credentials.password === 'Test123!') {
        resolve({
          id: '1',
          email: credentials.email,
          name: role === 'sahin' ? 'Test Müşteri' : 'Test Bayi',
          role,
        });
        return;
      }
      reject(new Error('E-posta adresi veya şifre hatalı.'));
    }, 800);
  });
}

export async function registerSahin(data: {
  firstName: string;
  lastName: string;
  companyName: string;
  city: string;
  district: string;
  email: string;
  phone: string;
  password: string;
}): Promise<{ id: string; email: string; name: string }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: 'new-sahin-id',
        email: data.email,
        name: `${data.firstName} ${data.lastName}`,
      });
    }, 800);
  });
}

export async function registerKoman(data: {
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  city: string;
  district: string;
  password: string;
}): Promise<{ id: string; email: string; name: string }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: 'new-koman-id',
        email: data.email,
        name: data.companyName,
      });
    }, 800);
  });
}

export async function requestPasswordReset(email: string): Promise<string> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(`${email} adresine şifre sıfırlama bağlantısı gönderildi.`);
    }, 800);
  });
}
