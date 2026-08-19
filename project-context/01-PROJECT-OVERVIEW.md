# 01 — Proje Özeti

## Ürün nedir?

Şahin Motor Frontend; satış, stok, müşteri, bayi, kullanıcı ve işlem görünümü sunan bir yönetim paneli prototipidir. Uygulama gerçek bir API'ye bağlı değildir; tüm iş verileri tarayıcı belleğinde çalışan mock servislerden gelir.

Mevcut ürün kapsamı:

- Demo kimlik bilgileriyle giriş
- Bayi/işletme seçimi
- Sepet → müşteri → proforma/önizleme → satış tamamlama akışı
- Stok ürünlerini listeleme, filtreleme ve CRUD işlemleri
- Toplu ve kontrollü **Mal Kabul** ve **Atık Ürün** stok hareketleri
- Bireysel/kurumsal müşteri CRUD işlemleri
- Bayi CRUD ve kullanıcı atama işlemleri
- Kullanıcı CRUD ve parola sıfırlama
- Satış, stok ve aktivite verilerini bir araya getiren işlemler görünümü

Kaynakta bulunup bugün navigasyona dahil olmayan alanlar: dashboard, bağımsız raporlar ve bağımsız log ekranları. Kayıt formları da kaynakta vardır fakat güncel auth sayfası yalnızca giriş formunu render eder.

## Teknoloji yığını

| Katman | Canlı sürüm / seçim |
|---|---|
| UI runtime | React `19.2.8`, React DOM `19.2.8` |
| Dil | TypeScript `~6.0.2` |
| Build | Vite `8.2.0`, `@vitejs/plugin-react` `6.0.4` |
| Routing | React Router DOM `7.18.2` |
| UI kütüphanesi | Ant Design `6.5.3`, Türkçe locale |
| İkonlar | `@ant-design/icons` kodda doğrudan import edilir; paket şu an `antd` üzerinden transitif gelir |
| Lint | ESLint `10.8.0`, TypeScript ESLint, React Hooks ve React Refresh kuralları |
| Paket yöneticisi | npm (`package-lock.json`) |

`package.json` sürümü `0.0.2`, paket tipi ESM'dir. React Compiler etkin değildir. State yönetimi için Redux/Zustand/Context tabanlı global store yoktur.

## Çalışma modeli

Ana veri akışı çoğu feature'da şöyledir:

```text
Page / Component → custom hook → mock service → modül içi dizi
```

- Servis gecikmeleri yaklaşık 200–800 ms arasında `setTimeout` ile simüle edilir.
- CRUD yapan servisler veriyi yalnızca ilgili ES modülünün belleğinde değiştirir.
- Tarayıcı yenilendiğinde veya geliştirme sunucusu yeniden yüklendiğinde mock veri sıfırlanır.
- Ağ isteği, API base URL, token saklama veya `.env` tüketimi yoktur.
- Feature hook'ları loading/loaded/error; bazıları ayrıca empty durumunu yönetir.

## İşletme sahipliği

Route yapısının merkezi `/:businessId` parametresidir. Ancak kapsam uygulama genelinde eşit uygulanmaz:

- **Stok:** `Product.dealerId` üzerinden seçili işletmeye gerçekten filtrelenir; yeni ürün, Mal Kabul ve Atık Ürün işlemleri seçili `businessId` ile uygulanır.
- **Layout ve işletme adı:** bayi servisi içinden `businessId` ile çözülür.
- **Satış:** route parametresine göre filtrelenmez; yeni satışlarda `bayiId: 'd1'` ve `personelId: 'u1'` sabittir.
- **Müşteri, bayi, kullanıcı, dashboard, rapor ve log:** seçili işletmeye göre servis seviyesinde kapsamlanmaz.
- **İşlemler:** stok ve satış için işletme filtresi dener; eşleşme yoksa tüm veriye geri döner. Rapor ve log verileri işletme kapsamlı değildir.

Bu nedenle `businessId` bugün eksiksiz bir tenant izolasyonu veya güvenlik sınırı değildir.

## Veri bütünlüğü sınırları

Feature servisleri birbirinden bağımsız mock veri setleri taşır:

- Satış ürünleri, stok ürünleriyle aynı koleksiyon değildir; satış tamamlanınca stok azalmaz.
- Satış ekranındaki müşteri seçimi, satış servisine ait müşteri listesini kullanır; müşteri CRUD servisiyle otomatik senkron değildir.
- Satış sırasında girilen yeni müşteri bilgisi müşteri servisine kaydedilmez.
- Rapor, dashboard ve log verileri canlı CRUD işlemlerinden türetilmez.
- Bildirim store'u vardır fakat kod tabanında `addNotification` çağıran üretici yoktur.

## Kimlik doğrulama ve yetkilendirme gerçeği

- Tek geçerli demo kombinasyonu `test@test.com` / `Test123!` değeridir.
- `/`, `/sahin/login` ve `/koman/login` aynı `SahinLogin` bileşenine gider.
- Güncel auth sayfası rolü her zaman `sahin` olarak login servisine yollar.
- Kullanıcı bellekte tutulur; refresh sonrası oturum korunmaz.
- Korumalı route, token, izin kontrolü veya rol bazlı erişim uygulaması yoktur.
- Kullanıcı rollerinin UI'da görünmesi yetkilendirme uygulandığı anlamına gelmez.

## Bugünkü kalite sınırı

- TypeScript derlemesi ve Vite production build ana çalışabilirlik kontrolüdür.
- Unit, integration veya end-to-end test dosyası ve test script'i yoktur.
- 19 Ağustos 2026 denetiminde `npm run lint`, mevcut kaynaklarda 9 hata vermektedir: effect içi senkron state çağrıları, unused parametreler ve bir Fast Refresh export ihlali. Değişiklikler dar kapsamlı lint/build ile ayrıca doğrulanmalıdır.
- Profil, parola güncelleme, log dışa aktarma ve bazı rapor aksiyonları kalıcı/gerçek bir backend işlemi değildir.
