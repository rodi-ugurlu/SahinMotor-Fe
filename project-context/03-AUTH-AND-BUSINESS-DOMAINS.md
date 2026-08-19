# 03 — Kimlik Doğrulama ve İşletme Alanı

## Aktif giriş akışı

Aktif render zinciri:

```text
SahinLogin
  → AnimatedAuthPage
    → LoginForm
      → useAuth.login('sahin', credentials)
        → loginWithCredentials
          → /select-business
```

`/`, `/sahin/login` ve `/koman/login` aynı zincire girer. Route adı Koman olsa bile `AnimatedAuthPage` rolü sabit olarak `sahin` gönderir.

Geçerli demo bilgileri:

```text
E-posta: test@test.com
Şifre:   Test123!
```

Servis 800 ms gecikme simüle eder. Başarılı kullanıcı `{ id: '1', email, name: 'Test Müşteri', role: 'sahin' }` olur ve `/select-business` açılır. Hatalı girişte “E-posta adresi veya şifre hatalı.” mesajı hook state'ine yazılır.

## Gerçek güvenlik sınırı

Bu akış yalnızca UI prototipidir:

- Token/cookie/session oluşturulmaz.
- Kullanıcı global context'e veya kalıcı depoya yazılmaz.
- Sayfa yenilenince `useAuth` state'i kaybolur.
- `/select-business` ve `/:businessId/*` route'ları doğrudan açılabilir.
- Rol ve izinler route veya aksiyon seviyesinde doğrulanmaz.
- Logout yalnızca `/` adresine navigate eder.

## Şifre sıfırlama

`LoginForm` içindeki unutulan parola akışı `requestPasswordReset(email)` çağırır. Servis e-postayı kontrol etmeden 500 ms sonra genel bir bildirim metni döndürür. E-posta gönderimi veya parola değişikliği yoktur.

## Kaynakta bulunan fakat aktif olmayan kayıt akışları

`SahinRegisterForm`, `KomanRegisterForm`, `ExpertiseTagInput`, `registerSahin`, `registerKoman` ve hook wrapper'ları kaynakta bulunur. Ancak `AnimatedAuthPage` bugün yalnızca `LoginForm` render ettiği için kullanıcı bu formlara ulaşamaz.

Ek teknik uyumsuzluklar:

- Kayıt servisleri verilen hesabı kalıcı bir store'a eklemez.
- Hook, kayıt sonrası yeni bilgilerle otomatik login dener; login servisi yalnızca demo bilgilerini kabul ettiği için bu giriş başarısız olur.
- `SahinRegisterForm` uzmanlık etiketleri toplar; `SahinRegisterRequest` ve `registerSahin` servis parametreleri bu alanı içermez.
- `AuthView = 'login' | 'register'` tipi vardır ancak güncel sayfa view değiştirmez.

## Auth tipleri

- `AuthRole`: `'sahin' | 'koman'`
- Auth `UserRole`: `'sahin' | 'koman' | 'admin' | null`
- `User`: `id`, `email`, `name`, `role`
- `LoginCredentials`: `email`, `password`
- `TicketCategory`: Motor, Elektrik, Hidrolik, Pnömatik, GenelBakim, ECU

Bu auth rolleri, kullanıcı yönetimi modülündeki `SuperAdmin | Admin | Personel | Guest` rolleriyle ayrı tip sistemleridir.

## Lokasyon ve uzmanlık yardımcıları

`src/features/auth/lib/locations.ts`:

- 21 şehir ve her şehir için seçilmiş ilçe listesi içerir.
- `cities`, sözlüğün key listesidir.
- `districtsForCity`, `firstDistrictForCity` ve tekrarları temizleyen `normalizeDistrictList` export edilir.
- Liste Türkiye'nin eksiksiz idari veri seti değildir.

`src/features/auth/lib/serviceExpertise.ts`:

- 6 servis uzmanlık kategorisi içerir.
- 49 önerilen serbest uzmanlık etiketi içerir.
- Türkçe küçük harfe/arama metnine normalizasyon ve kategori etiketi çözümleme yardımcıları sağlar.

## İşletme seçimi

```text
/select-business
  → useBusinesses
    → businessService.getBusinesses
      → dealersService.getDealers
        → Dealer verisini Business görünümüne map et
```

İki başlangıç bayi kaydı vardır (`d1`, `d2`). Aynı runtime içinde bayi servisinde yapılan değişiklikler işletme seçimine yansır; refresh sonrası sıfırlanır.

Ekranın aktif davranışı:

- Header kullanıcı adı/avatarı sabit `Zeynel` / `Z` değeridir; auth user state'inden gelmez.
- Loading, error/retry, empty ve loaded durumları vardır.
- İşletme seçimi `/${business.id}/sales` adresine gider.
- Çıkış `/` adresine yönlendirir.
- `Business.description` type ve mapping'de vardır; kartın güncel görsel sunumunda temel kimlik ad/logo üzerinden kurulur.

## İşletme ve bayi ilişkisi

`Business`, `Dealer` modelinin salt seçim kartı görünümüdür:

```ts
interface Business {
  id: string;
  name: string;
  description: string;
  logoUrl?: string;
}
```

Route parametresi `businessId`, stok modülünde `dealerId` karşılığı olarak kullanılır. Bu eşitlik diğer tüm feature'larda aynı titizlikle uygulanmadığı için çoklu işletme izolasyonu tamamlanmış değildir.

## Profil ve parola modalları

- `ProfileModal`: ad soyad, e-posta ve tek görsel alır; görseli base64'e çevirir. Sonuç yalnızca `DashboardLayout` state'ini günceller.
- `PasswordModal`: yeni parola + tekrar alanı içerir; yalnızca minimum 10 karakter ve eşleşme kontrolü yapar. Layout callback'i parolayı kullanmadan modalı kapatır.
- Bu iki akış kullanıcı servisine veya auth servisine bağlı değildir.
