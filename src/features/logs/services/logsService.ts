import type { LogEntry } from '../types/logs';
import { USERS } from '../types/logs';

const MOCK_LOGS: LogEntry[] = [
  {
    id: 'log-001', date: '06.08.2026 16:45:22',
    user: USERS[0], type: 'sales', module: 'Satış',
    description: 'Yeni fatura oluşturuldu',
    detail: 'PRO-2026-001 nolu fatura Ahmet Yılmaz için oluşturuldu. Toplam: ₺1.080',
    ip: '192.168.1.100',
    changes: [
      { field: 'Fatura No', oldValue: '-', newValue: 'PRO-2026-001' },
      { field: 'Müşteri', oldValue: '-', newValue: 'Ahmet Yılmaz' },
      { field: 'Tutar', oldValue: '-', newValue: '₺1.080' },
    ],
  },
  {
    id: 'log-002', date: '06.08.2026 15:30:10',
    user: USERS[1], type: 'stock', module: 'Stok Yönetimi',
    description: 'Motul 10W40 stok güncellendi',
    detail: 'Motul 10W40 Motor Yağı stok adedi değiştirildi',
    ip: '192.168.1.101',
    changes: [
      { field: 'Stok Adedi', oldValue: '5', newValue: '2' },
      { field: 'Min. Stok', oldValue: '3', newValue: '5' },
    ],
  },
  {
    id: 'log-003', date: '06.08.2026 14:20:05',
    user: USERS[0], type: 'stock', module: 'Stok Yönetimi',
    description: 'Yeni ürün eklendi',
    detail: 'LS2 FF320 Kask ürünü stoğa eklendi',
    ip: '192.168.1.100',
    changes: [
      { field: 'Ürün', oldValue: '-', newValue: 'LS2 FF320 Kask' },
      { field: 'Stok', oldValue: '-', newValue: '10' },
      { field: 'Fiyat', oldValue: '-', newValue: '₺3.200' },
    ],
  },
  {
    id: 'log-004', date: '06.08.2026 12:15:33',
    user: USERS[2], type: 'sales', module: 'Satış',
    description: 'Proforma fatura oluşturuldu',
    detail: 'PRO-2026-003 nolu proforma Ayşe Demir için oluşturuldu',
    ip: '192.168.1.102',
    changes: [
      { field: 'Fatura No', oldValue: '-', newValue: 'PRO-2026-003' },
      { field: 'Tür', oldValue: '-', newValue: 'Proforma' },
    ],
  },
  {
    id: 'log-005', date: '06.08.2026 11:00:00',
    user: USERS[3], type: 'login', module: 'Auth',
    description: 'Sisteme giriş yapıldı',
    detail: 'Maliyeci hesabı ile giriş yapıldı',
    ip: '192.168.1.200',
  },
  {
    id: 'log-006', date: '06.08.2026 10:45:18',
    user: USERS[1], type: 'sales', module: 'Satış',
    description: 'Proforma faturaya çevrildi',
    detail: 'PRO-2026-003 nolu proforma faturaya çevrildi',
    ip: '192.168.1.101',
    changes: [
      { field: 'Durum', oldValue: 'Bekliyor', newValue: 'Tamamlandı' },
      { field: 'Tür', oldValue: 'Proforma', newValue: 'Fatura' },
    ],
  },
  {
    id: 'log-007', date: '06.08.2026 09:30:42',
    user: USERS[0], type: 'stock', module: 'Stok Yönetimi',
    description: 'Fren Hidroliği DOT4 stok güncellendi',
    detail: 'Kritik stok seviyesi uyarısı',
    ip: '192.168.1.100',
    changes: [
      { field: 'Stok Adedi', oldValue: '3', newValue: '1' },
    ],
  },
  {
    id: 'log-008', date: '05.08.2026 18:20:15',
    user: USERS[2], type: 'sales', module: 'Satış',
    description: 'Satış iptal edildi',
    detail: 'PRO-2026-005 nolu proforma iptal edildi',
    ip: '192.168.1.102',
    changes: [
      { field: 'Durum', oldValue: 'Bekliyor', newValue: 'İptal' },
    ],
  },
  {
    id: 'log-009', date: '05.08.2026 17:10:30',
    user: USERS[0], type: 'logout', module: 'Auth',
    description: 'Sistemden çıkış yapıldı',
    detail: 'Zeynel oturumu sonlandırdı',
    ip: '192.168.1.100',
  },
  {
    id: 'log-010', date: '05.08.2026 16:00:00',
    user: USERS[1], type: 'stock', module: 'Stok Yönetimi',
    description: 'Ürün silindi',
    detail: 'Debriyaj Teli ürünü stoktan kaldırıldı',
    ip: '192.168.1.101',
    changes: [
      { field: 'Ürün', oldValue: 'Debriyaj Teli', newValue: 'Silindi' },
    ],
  },
  {
    id: 'log-011', date: '05.08.2026 14:25:10',
    user: USERS[0], type: 'login', module: 'Auth',
    description: 'Sisteme giriş yapıldı',
    detail: 'Zeynel hesabı ile giriş yapıldı',
    ip: '192.168.1.100',
  },
  {
    id: 'log-012', date: '05.08.2026 11:30:00',
    user: USERS[2], type: 'sales', module: 'Satış',
    description: 'Yeni fatura oluşturuldu',
    detail: 'PRO-2026-004 nolu fatura Ali Öztürk için oluşturuldu. Toplam: ₺433',
    ip: '192.168.1.102',
    changes: [
      { field: 'Fatura No', oldValue: '-', newValue: 'PRO-2026-004' },
      { field: 'Müşteri', oldValue: '-', newValue: 'Ali Öztürk' },
      { field: 'Tutar', oldValue: '-', newValue: '₺433' },
    ],
  },
  {
    id: 'log-013', date: '04.08.2026 16:40:00',
    user: USERS[1], type: 'stock', module: 'Stok Yönetimi',
    description: 'Hava Filtresi stok güncellendi',
    detail: 'Hava Filtresi Universal stok adedi artırıldı',
    ip: '192.168.1.101',
    changes: [
      { field: 'Stok Adedi', oldValue: '2', newValue: '4' },
    ],
  },
  {
    id: 'log-014', date: '04.08.2026 10:15:00',
    user: USERS[0], type: 'login', module: 'Auth',
    description: 'Sisteme giriş yapıldı',
    detail: 'Zeynel hesabı ile giriş yapıldı',
    ip: '192.168.1.100',
  },
  {
    id: 'log-015', date: '03.08.2026 15:00:00',
    user: USERS[3], type: 'login', module: 'Auth',
    description: 'Sisteme giriş yapıldı',
    detail: 'Maliyeci hesabı ile giriş yapıldı',
    ip: '192.168.1.200',
  },
];

export async function getLogs(): Promise<LogEntry[]> {
  return new Promise((resolve) => {
    setTimeout(() => resolve([...MOCK_LOGS]), 400);
  });
}

export async function exportLogs(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), 500);
  });
}
