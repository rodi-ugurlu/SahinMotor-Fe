# 06 — Geliştirme ve Konvansiyonlar

## Kurulum ve komutlar

```bash
npm install
npm run dev
npm run build
npm run lint
npm run preview
```

- `dev`: Vite geliştirme sunucusu
- `build`: önce `tsc -b`, sonra `vite build`
- `lint`: tüm repository için ESLint
- `preview`: üretilmiş `dist` paketini yerel sunar

Test script'i yoktur. Yeni bağımlılık eklenirse `package.json` ve `package-lock.json` birlikte güncellenmelidir. Kod `@ant-design/icons` paketini doğrudan import eder; bugün paket `antd` üzerinden transitif kurulur, doğrudan dependency olarak tanımlı değildir.

## TypeScript ve build ayarları

- Uygulama ESM'dir (`"type": "module"`).
- `tsconfig.app.json`: ES2023 target, bundler module resolution, JSX `react-jsx`, `noEmit`.
- `strict`, unused local/parameter ve fallthrough kontrolleri etkindir.
- Vite config yalnızca React plugin'ini ekler; alias, proxy veya env mapping yoktur.
- `src/main.tsx` geliştirmede effect'leri iki kez görünür kılabilen `React.StrictMode` kullanır.

## Kod organizasyonu

Yeni işlevi mümkünse ilgili feature içinde tutun:

```text
src/features/<feature>/
├── components/   # feature'a özel tekrar kullanılabilir UI
├── hooks/        # async state, filtreler ve action wrapper'ları
├── pages/        # route veya tam ekran kompozisyonu
├── services/     # veri sınırı; bugün mock, gelecekte API adaptörü olabilir
└── types/        # feature'ın TypeScript sözleşmesi
```

Her modülde bütün klasörler zorunlu değildir. Örneğin transactions, diğer servisleri orkestre eder. Ortak yardımcılar `src/shared`, layout dışı genel modallar `src/components` altındadır.

## State ve servis konvansiyonu

- UI görünürlüğü ve form state'i component içinde tutulur.
- Veri listesi, filtre ve async durum custom hook'ta tutulur.
- Servisler Promise döndürür ve hata halinde `Error` reject eder.
- Hook servis hatasını kullanıcıya `message.error` veya error state ile taşır.
- CRUD sonrası local hook state'i servis sonucuyla güncellenir.
- `loading`, `loaded`, `error`; liste modüllerinin çoğunda ayrıca `empty` kullanılır.

Mock servis geliştirirken gerçek sınırı koruyun: bütün girdileri doğrulayıp sonra modül dizisini değiştirin. Mal Kabul'deki geçici kopya + tek commit deseni toplu işlemler için referanstır.

## İşletme kapsamı kuralı

Yeni işletmeye ait veriler için route'taki `businessId` açıkça servis kontratına taşınmalı ve modelde `dealerId`/uygun sahiplik alanıyla doğrulanmalıdır. UI filtresi tek başına güvenlik veya veri bütünlüğü sınırı değildir.

Bugün yalnızca stok akışı bunu tam uygular. Sales'teki sabit `d1`, transactions fallback'leri ve diğer global listeler mevcut borçtur; yeni kod bu davranışı varsayılan örnek almamalıdır.

## Form doğrulama matrisi

| Alan/akış | Canlı kural |
|---|---|
| Ortak güçlü parola | min 10, büyük, küçük, rakam, özel karakter; yalnızca erişilebilir olmayan auth kayıt formlarında kullanılır |
| Kullanıcı oluştur/reset | min 10 + tekrar eşleşmesi; ortak güçlü validator kullanılmaz |
| Header parola modalı | yalnızca min 10 + tekrar eşleşmesi; kaydetmez |
| Login | zorunlu e-posta formatı + parola; servis demo kombinasyonunu kontrol eder |
| Telefon helper'ı | 10 rakama kadar `(xxx) xxx xx xx`; her form bunu kullanmaz |
| Bireysel müşteri | TC tam 11 rakam |
| Kurumsal müşteri | VKN tam 10 rakam |
| Ürün barkodu | 6–32 rakam ve form bağlamında tekrar kontrolü |
| Ürün fiyat/stok | Ant Design number alanları; negatif/min kuralları modalda uygulanır |
| Mal Kabul miktarı | min 1, integer UI; serviste pozitif safe integer |
| Mal Kabul sahipliği | mevcut ürün seçili `dealerId` ile eşleşmeli |
| Atık Ürün | kayıtlı ürün, zorunlu neden, min 1 safe integer miktar; miktar mevcut stoğu aşamaz |
| Atık Ürün sahipliği | bütün ürünler seçili `dealerId` ile eşleşmeli; servis toplu ve atomik uygular |

Yalnızca form doğrulamasına güvenmeyin. Veri bütünlüğünü etkileyen kurallar servis sınırında da uygulanmalıdır.

## UI/CSS konvansiyonları

- Ant Design temel bileşenleri kullanılır; sayfalar kendi `.css` dosyasını import eder.
- Sınıflar ağırlıkla BEM benzeri `feature-page__element--modifier` biçimindedir.
- Uygulama renk paletleri `src/index.css` içindeki global `--color-*` design token'larından tüketilir; feature CSS'inde aynı anlam için yeni sabit hex üretilmez.
- Semantik ana renkler: marka/hata `--color-brand-500: #E32727`, başarı `--color-success-500: #22C55E`, bilgi `--color-info-500: #3B82F6`, uyarı `--color-warning-500: #F59E0B`, kurumsal mor `--color-purple-500: #8B5CF6`.
- Ton ölçeğinde `50/100` arka plan, `300` sınır, `500` ana vurgu ve `600/700` yüksek kontrastlı metin/hover için kullanılır; nötr yüzey ve metinler `--color-neutral-*` ailesindendir.
- Metinler Türkçedir; para `₺` ve çoğunlukla `toLocaleString('tr-TR')` ile gösterilir.
- Responsive davranış CSS media query'leri, Ant Table horizontal scroll ve gerektiğinde ayrı mobil kartlarla çözülür.
- İkon-only butonlarda `Tooltip`, `title` veya `aria-label` kullanılmalıdır.
- Full-page işlem akışında kullanıcı verisi varsa geri/temizle aksiyonları onay istemelidir.

## Yeni feature veya değişiklik kontrol listesi

1. İlgili context belgesini ve canlı route/service/type zincirini okuyun.
2. Veri hangi işletmeye ve hangi servise ait, açıkça belirleyin.
3. Aynı isimli fakat farklı feature'a ait tip/veri setlerini yanlışlıkla birleştirmeyin.
4. Loading, error, empty, başarılı ve tekrar deneme durumlarını ele alın.
5. Form doğrulamasını ve kritik kuralların servis doğrulamasını ekleyin.
6. Toplu işlemlerde kısmi mutation bırakmayın.
7. Dar kapsamlı ESLint çalıştırın; sonra `npm run build` ile TypeScript/Vite bütününü kontrol edin.
8. `npm run lint` sonucundaki yeni hata ile mevcut baseline hatalarını ayrı raporlayın.
9. Mobil düzen, yatay taşma, klavye/Enter akışı ve ikon buton erişilebilirliğini kontrol edin.
10. Değişen davranışın route, modül, model ve sınırlama belgelerini birlikte güncelleyin.

## Bilinen teknik borçlar

- Backend/API, auth persistence ve route guard yok.
- Otomatik test altyapısı yok.
- Feature mock veri setleri birbiriyle senkron değil.
- İşletme kapsamı stok dışında tutarsız.
- Dashboard, Reports ve Logs route'a bağlı değil.
- Kayıt formu kodları erişilebilir değil; kayıt sonrası login sözleşmesi çalışmıyor.
- Bildirim store'unun üreticisi yok.
- Transactions başlangıç DatePreset değeri type union'ıyla uyumsuz.
- Profil/parola değişiklikleri kalıcı değil.
- Log export butonu dosya üretmiyor; sales/transactions yazdırma `window.print()` tabanlı.
- 19 Ağustos 2026 doğrulamasında tam lint baseline'ı 9 hatadır: `ProfileModal`, customers/dealers/sales/transactions/users hook'larındaki effect kuralı; `LoginForm` Fast Refresh ve auth/layout unused parametreleri.
- Production build geçer; ana JS chunk yaklaşık 1.52 MB olduğu için Vite 500 kB chunk-size uyarısı verir.

## Dokümantasyon kuralı

`project-context` gelecek planını değil mevcut davranışı anlatır. Henüz route'a bağlı olmayan ekranlar “aktif”, mock callback'ler “kalıcı”, görsel kamera alanı “kamera entegrasyonu” veya role alanları “yetkilendirme” olarak yazılmamalıdır. Yeni bir backend geldiğinde her servis için endpoint, auth, hata ve sahiplik sözleşmesi ayrıca belgelenmelidir.
