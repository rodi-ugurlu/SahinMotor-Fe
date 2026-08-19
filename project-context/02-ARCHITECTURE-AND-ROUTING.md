# 02 — Mimari ve Routing

## Kaynak ağacı

```text
src/
├── App.tsx                         # Ant Design tr_TR ve AppRouter
├── main.tsx                        # StrictMode ile mount
├── index.css                       # global reset ve tema tabanı
├── components/
│   ├── PasswordModal.tsx
│   ├── ProfileModal.tsx
│   ├── WorkflowProductSearch.tsx
│   ├── WorkflowProductSearch.css
│   ├── WorkflowSpotlight.tsx
│   └── WorkflowSpotlight.css
├── layouts/
│   ├── DashboardLayout.tsx
│   └── DashboardLayout.css
├── router/AppRouter.tsx
├── pages/NotFoundPage.tsx
├── shared/
│   ├── events.ts                   # küçük senkron event registry
│   ├── image.ts                    # FileReader → base64
│   ├── notifications.ts            # useSyncExternalStore tabanlı bellek store'u
│   └── validation.ts               # telefon formatı ve güçlü parola kuralı
└── features/
    ├── auth/          ├── business/      ├── customers/
    ├── dashboard/     ├── dealers/       ├── logs/
    ├── reports/       ├── sales/         ├── stock/
    ├── transactions/  └── users/
```

Toplam **11 feature dizini** vardır. Çoğu `types → service → hook → page/components` ayrımını izler. `transactions` kendi servis ve types dosyasına sahip değildir; diğer feature servis ve tiplerini birleştirir.

Projede `src/app/`, API istemcisi, store dizini, test dizini veya route guard bulunmaz.

## Başlangıç zinciri

```text
src/main.tsx
  → React.StrictMode
    → src/App.tsx
      → ConfigProvider(locale=tr_TR)
        → AppRouter
```

`App.tsx` Ant Design yerelleştirmesini uygular. Uygulama `createBrowserRouter` kullanır; sunucuda doğrudan alt route açılacaksa SPA fallback yapılandırması gerekir.

## Route matrisi

| URL | Render edilen ekran | Layout | Durum |
|---|---|---|---|
| `/` | `SahinLogin` | yok | aktif |
| `/sahin/login` | `SahinLogin` | yok | aktif |
| `/koman/login` | `SahinLogin` | yok | aktif; Koman'a özel davranmaz |
| `/select-business` | `BusinessSelectionPage` | yok | aktif, guard yok |
| `/:businessId` | `SalesPage` | `DashboardLayout` | index route; redirect değil |
| `/:businessId/sales` | `SalesPage` | `DashboardLayout` | aktif |
| `/:businessId/stock` | `StockPage` | `DashboardLayout` | aktif |
| `/:businessId/customers` | `CustomersPage` | `DashboardLayout` | aktif |
| `/:businessId/dealers` | `DealersPage` | `DashboardLayout` | aktif |
| `/:businessId/users` | `UsersPage` | `DashboardLayout` | aktif |
| `/:businessId/transactions` | `TransactionsPage` | `DashboardLayout` | aktif |
| diğer tüm yollar | `NotFoundPage` | konuma göre | aktif |

`DashboardPage`, `ReportsPage` ve `LogsPage` derlenir fakat router tarafından import edilmez ve sidebar'da görünmez.

## DashboardLayout

Layout iki parçalı Ant Design `Layout` kullanır:

- Sidebar genişliği 240 px, daraltılmış genişliği 64 px; `lg` breakpoint tanımlıdır.
- Menü sırası: Satış, Stok, Müşteri, Bayi, Kullanıcı, İşlemler.
- Seçili menü anahtarı `location.pathname.includes()` ile hesaplanır; eşleşme yoksa `sales` seçilir.
- Menü tıklaması `/${businessId}/${key}` adresine gider.
- Bayi adı/logosu `getDealers()` ile `businessId` üzerinden yüklenir.
- `dealerUpdated` eventi geldiğinde bayi bilgisi yeniden okunur.
- “İşletme Değiştir” `/select-business`, çıkış `/` adresine yönlendirir; oturum temizleyen servis yoktur.
- Header'da bildirim popover'ı ve profil dropdown'ı bulunur.

Profil state'i layout içinde `Zeynel Şahin / zeynel@sahinmotor.com` ile başlar. Profil resmi base64'e çevrilir ve yalnızca component state'inde tutulur. Parola modalının callback'i parolayı kaydetmez.

## Ortak altyapı

### Event registry

`src/shared/events.ts`, event adı → listener set'i tutan basit senkron bir publish/subscribe katmanıdır. Canlı kullanım yalnızca `dealerUpdated` olayıdır; bayi CRUD/atama işlemleri sonrası layout bayi bilgisini yeniler.

### Bildirim store'u

`src/shared/notifications.ts`:

- `useSyncExternalStore` ile okunur.
- En fazla 20 bildirimi bellekte tutar.
- `addNotification`, `clearNotifications` ve subscribe/snapshot işlevlerini sağlar.
- Kod tabanında `addNotification(...)` çağrısı olmadığı için popover normalde boştur.
- Kalıcı depolama yoktur.

### Görsel yardımcı

`getBase64(file)`, `FileReader.readAsDataURL` kullanır. Ürün, bayi ve profil görselleri backend'e yüklenmez; data URL olarak bellekte tutulur.

### Validation yardımcıları

- `formatPhoneNumber`: rakam dışını temizler, baştaki `0`ı kaldırır, 10 rakama kadar `(5xx) xxx xx xx` biçimi üretir.
- `validatePasswordRule`: en az 10 karakter, büyük harf, küçük harf, rakam ve özel karakter ister.

Bu güçlü parola doğrulayıcısı her parola yüzeyinde kullanılmaz; detaylar geliştirme belgesindedir.

### Ortak workflow parçaları

`WorkflowSpotlight`, Satış sayfasının boş başlangıç görünümündeki ikon, başlık, açıklama, 760 px içerik alanı, opsiyonel aksiyon slotu ve responsive tipografiyi tek CSS kaynağında tutar.

`WorkflowProductSearch`, Satış başlangıcı ile Mal Kabul ve Atık Ürün drawer'larında aynı gerçek `Input`, sabit “Ürün adı veya barkod ile arayın...” placeholder'ı, arama ikonu, kamera aksiyonu, Enter davranışı ve öneri kabuğunu kullanmasını sağlar. Parent genişliği kullanıldığı yüzey tarafından belirlenir. Query ve ürün seçme state'i feature'da kalır; Satış kamerası barkod overlay'ini açar, stok drawer'larındaki kamera aksiyonu fiziksel barkod girişi için input'a odaklanır.

## Feature bağımlılıkları

```text
businessService ─────→ dealersService
dealersService ──────→ usersService içindeki exported users dizisi
DashboardLayout ─────→ dealersService + events + notifications
Transactions hook ───→ reportsService + logsService + stockService + salesService
Sales hook ──────────→ salesService içindeki bağımsız ürün/müşteri/satış verisi
Stock hook ──────────→ stockService + route businessId
```

Bu bağımlılıklar tek bir merkezi store oluşturmaz. Özellikle `salesService` ürünleri ile `stockService` ürünleri farklı koleksiyonlardır.

## State ve hata yönetimi

- Sayfa state'i hook içinde `useState` ile tutulur.
- Veri yükleme çoğunlukla `useEffect` içinden hook'un `fetch` callback'ini çağırır.
- Servis hataları hook'ta state veya Ant Design `message` ile gösterilir.
- Modal ve drawer görünürlüğü sayfa veya bileşen local state'idir.
- Error boundary, cache, request cancellation veya optimistic rollback altyapısı yoktur.
