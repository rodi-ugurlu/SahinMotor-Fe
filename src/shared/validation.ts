export function formatPhoneNumber(value: string): string {
  const numbers = value.replace(/\D/g, '');
  let target = numbers;
  if (target.startsWith('0')) target = target.substring(1);
  target = target.substring(0, 10);
  if (target.length === 0) return '';
  if (target.length <= 3) return `(${target}`;
  if (target.length <= 6) return `(${target.substring(0, 3)}) ${target.substring(3)}`;
  if (target.length <= 8) return `(${target.substring(0, 3)}) ${target.substring(3, 6)} ${target.substring(6)}`;
  return `(${target.substring(0, 3)}) ${target.substring(3, 6)} ${target.substring(6, 8)} ${target.substring(8)}`;
}

export function validatePasswordRule(_: unknown, value: string): Promise<void> {
  if (!value) return Promise.resolve();
  if (value.length < 10) return Promise.reject(new Error('Şifre en az 10 karakter olmalıdır'));
  if (!/[A-Z]/.test(value)) return Promise.reject(new Error('Şifre en az bir büyük harf içermelidir'));
  if (!/[a-z]/.test(value)) return Promise.reject(new Error('Şifre en az bir küçük harf içermelidir'));
  if (!/\d/.test(value)) return Promise.reject(new Error('Şifre en az bir rakam içermelidir'));
  if (!/[^A-Za-z0-9]/.test(value)) return Promise.reject(new Error('Şifre en az bir özel karakter içermelidir'));
  return Promise.resolve();
}
