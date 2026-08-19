# 04 — Feature Modülleri ve Servisler

## Modül envanteri

| Feature | Route/erişim | Veri kaynağı | Ana davranış |
|---|---|---|---|
| auth | `/`, `/sahin/login`, `/koman/login` | `authService` | demo giriş ve sahte reset |
| business | `/select-business` | `dealersService` mapping'i | işletme seçimi |
| sales | `/:businessId/sales` ve index | bağımsız `salesService` | sepet, müşteri, önizleme, satış CRUD |
| stock | `/:businessId/stock` | `stockService` | ürün CRUD, filtreler, Mal Kabul |
| customers | `/:businessId/customers` | bağımsız `customersService` | müşteri CRUD |
| dealers | `/:businessId/dealers` | `dealersService` + users dizisi | bayi CRUD ve kullanıcı atama |
| users | `/:businessId/users` | `usersService` | kullanıcı CRUD/parola reset |
| transactions | `/:businessId/transactions` | dört servisin birleşimi | özet, grafik, aktivite, detay/CSV |
| dashboard | route yok | sabit `dashboardService` | KPI/recent sale/stock kartları |
| reports | route yok | sabit `reportsService` | dönemsel rapor tabloları |
| logs | route yok | sabit `logsService` | aktivite filtreleri/detayı |

## Satış

### Akış

`SalesPage` üç tam sayfa adım kullanır:

1. **cart:** boşken odaklı ürün/barkod araması; ilk ürünle sepet çalışma alanına geçiş
2. **customer:** mevcut satış-müşterisi seçimi veya bireysel/kurumsal bilgilerin forma girilmesi, ödeme yöntemi
3. **proforma:** kalemler, ara toplam, iskonto, %20 KDV ve genel toplam önizlemesi

Boş `cart` görünümündeki ikon–başlık–açıklama iskeleti `WorkflowSpotlight` kullanır. Input/kamera/öneri alanı `WorkflowProductSearch` ile Mal Kabul drawer'ında da kullanılır; ürün seçimi ve barkod modalı sales feature'ında kalır.

Ürün tekrar seçildiğinde yeni satır yerine miktar artar. Satırda miktar, yüzde iskonto ve silme kontrolü vardır. İskonto sabit tutar değil yüzdedir. Kamera ikonu gerçek kamera API'si açmaz; barkodun elle/tarayıcı ile girildiği görsel modalı açar.

Önizlemede “Yazdır / PDF” `window.print()` çağırır. Satışı tamamlama `bitti`, geri/iptal akışı `taslak` kayıt oluşturabilir. “Satışlarım” görünümü arama, durum ve tarih filtresi; detay drawer'ı, durum güncelleme ve silme sunar.

### Veri sınırları

- Ürünler, müşteriler ve satışlar `salesService` içinde bağımsız mock setleridir.
- `useSales` route `businessId` kullanmaz.
- Yeni satış `bayiId: 'd1'`, `personelId: 'u1'` ile kaydedilir.
- Satış tamamlanınca `stockService` stoğu azalmaz.
- Forma yazılan yeni müşteri `customersService` içine eklenmez.
- KDV oranı UI hesaplamasında sabit `%20`dir.

## Stok

### Stok listesi

`useStock`, `getProducts()` sonucunu route'taki `businessId` ile `Product.dealerId` üzerinden filtreler. Başlangıç kataloğundaki 12 ürün, benzersiz ürün ID'leriyle hem `d1` hem `d2` işletmesi için seed edilir; toplam 24 mock stok kaydı vardır.

Ekran şunları sunar:

- Ürün adı, marka, model veya barkod araması
- Tümü / Kritik Stok (`stock <= minStock`) / Normal filtreleri
- Ürün adı ve marka kolonlarında Türkçe A–Z / Z–A sıralaması
- Alış/satış fiyatı ve stok kolonlarında sayısal sıralama
- Ürün görseli hover önizlemesi
- Ürün ekleme, düzenleme ve silme
- **Mal Kabul** drawer akışı
- **Atık Ürün** drawer akışı

`ProductFormModal` barkod, ad, marka, model, beden, renk, alış fiyatı, satış fiyatı, stok, minimum stok ve opsiyonel resim yönetir. Barkod 6–32 rakam olmalı ve seçili form bağlamındaki mevcut barkodlarla çakışmamalıdır.

### Mal Kabul

`StockPage`, `stockEntryOpen` true olduğunda stok tablosunun üzerinde `StockEntryDrawer` açar. URL ve stok sayfası bağlamı değişmez.

Drawer, satış başlangıcıyla ortak `WorkflowProductSearch` input/kamera/öneri alanını kullanır. Query, eşleşme ve yeni ürün davranışı Mal Kabul feature'ında kalır. Drawer listesindeki satırlarda alış veya satış fiyatı gösterilmez.

Akış:

1. Drawer açıldığında arama alanı ve boş kabul listesi gösterilir.
2. Barkod, ad, marka, model, beden ve renk üzerinden en fazla 5 öneri sunulur.
3. Tam barkod/ad veya tek eşleşme Enter ile eklenir; çoklu eşleşmede kullanıcı listeden seçer.
4. Aynı mevcut ürün/barkod tekrar eklenirse satır açılmaz, giriş miktarı artar.
5. Sadece `6–32` rakamdan oluşan bulunamayan sorgu yeni ürün akışını açabilir.
6. Yeni ürün modalında stok alanı gizlidir; giriş adedi ayrı tutulur. Oluşan satır “Yeni ürün” etiketi taşır ve bilgileri tekrar düzenlenebilir.
7. Drawer tablosunda ürün kimliği, barkod, mevcut stok, giriş miktarı ve yeni stok gösterilir; alış/satış fiyatları bu akışta yer almaz.
8. Drawer footer'ı ürün çeşidi ve toplam adedi gösterir; yeni ürün sayısı son onay modalında ayrıca belirtilir.
9. Stoğa işleme ve hazırlanmış listeden çıkış onay modallarıyla korunur.
10. Son onaya kadar hiçbir stok mutasyonu yapılmaz.

`applyStockEntries(entries, dealerId)` bütün girdileri geçici `next` dizisinde doğrular. Geçersiz miktar, eksik yeni ürün, geçersiz/tekrar barkod, tekrar mevcut ürün, bulunamayan ürün veya yanlış bayi sahipliği varsa global `products` dizisi hiç değiştirilmez. Tüm satırlar geçerse mevcut stoklar artırılır, yeni ürünler seçili bayiye atanır ve tek seferde commit edilir.

Kapsam dışı: tedarikçi, irsaliye/fatura, alış belgesi, geçmiş kabul kaydı, CSV içe aktarma ve onay rolleri.

### Atık Ürün

`StockPage`, Mal Kabul ile aynı drawer/search/table/footer görsel altyapısını kullanan `WasteProductDrawer` bileşenini **Mal Kabul** ile **Yeni Ürün** butonları arasındaki **Atık Ürün** aksiyonundan açar. Bu akış yalnız kayıtlı ürünleri kabul eder; yeni ürün oluşturmaz ve alış/satış fiyatı göstermez.

Akış:

1. Ürün barkod, ad, marka, model, beden veya renk ile aranıp geçici atık listesine eklenir.
2. Aynı ürün yeniden okutulursa tek satırdaki atık miktarı, mevcut stoğu aşmayacak şekilde artırılır.
3. Her satırda ürün kimliği, mevcut stok, pozitif tam sayı atık miktarı, zorunlu atık nedeni ve işlem sonrası kalan stok gösterilir.
4. Neden seçenekleri: son kullanma tarihi, hasar/kırılma, dökülme/sızıntı, kirlenme/kullanılamaz ve diğer.
5. Stoksuz ürün listeye alınmaz; atık miktarı mevcut stoktan büyükse veya neden seçilmemişse **Stoktan Düş** devre dışıdır.
6. Drawer footer'ı ürün çeşidi ve toplam adedi gösterir. Onay veya hazırlanmış listeden çıkış ayrıca doğrulanır.
7. Son onaya kadar ürün stoğu değişmez.

`applyWasteEntries(entries, dealerId)` tüm satırları geçici ürün dizisinde doğrular. Geçersiz/tekrar ürün, yanlış işletme, eksik neden, güvenli tam sayı olmayan miktar veya yetersiz stok varsa hiçbir ürün ve atık kaydı değiştirilmez. Bütün satırlar geçerse stoklar tek seferde azaltılır ve neden içeren `WasteRecord` kayıtları modül belleğine eklenir. `getWasteRecords()` bu kayıtları okuyabilir; sayfa yenilemesi diğer mock veriler gibi kayıtları sıfırlar ve bugün ayrı bir atık geçmişi ekranı yoktur.

## Müşteriler

- 6 başlangıç kaydı vardır; veri seçili işletmeye göre filtrelenmez.
- Arama: isim, telefon, TC ve VKN.
- Filtre: tümü, bireysel, kurumsal.
- Bireysel form: ad soyad, 11 haneli TC, telefon, opsiyonel e-posta, fatura adresi.
- Kurumsal form: firma adı, 10 haneli VKN, vergi dairesi, telefon, opsiyonel e-posta, fatura adresi.
- Detay drawer'ındaki alışveriş geçmişi yalnızca “yakında” placeholder'ıdır.

## Bayiler

- 2 başlangıç bayisi vardır.
- Ad, açıklama ve opsiyonel base64 logo ile CRUD yapılır.
- Detay drawer'ında kullanıcı atama/çıkarma yapılır.
- Kullanıcı seçenekleri `usersService` içindeki exported `users` dizisinden gelir; atama bayi `assignedUserIds` alanını değiştirir.
- Mutasyon sonrası `dealerUpdated` event'i yayınlanır; layout ve işletme listesi aynı runtime içinde yeni veriyi okuyabilir.
- Route'taki işletme kimliği, bayi yönetim listesini filtrelemez.

## Kullanıcılar

- 5 başlangıç kullanıcı kaydı ve plaintext mock parola alanı vardır.
- SuperAdmin kayıtları hook tarafından listeden çıkarılır.
- Arama ad/e-posta; filtre rol ve bayi üzerindendir.
- UI'nın rol seçenekleri `Admin`, `Personel`, `Guest`; `SuperAdmin` type'ta olsa da oluşturma/düzenleme seçeneği değildir.
- Yeni kullanıcı ve parola sıfırlama yalnızca minimum 10 karakter ve parola eşleşmesi kontrolü yapar; ortak güçlü parola validator'ını kullanmaz.
- E-posta benzersizliği veya gerçek yetki uygulaması yoktur.
- Route'taki işletme kimliği listeyi filtrelemez.

## İşlemler

`useTransactions`, rapor, log, stok ve satış servislerini birlikte okur. Ekran:

- Ciro, satış sayısı, ortalama sepet ve stok değeri özetleri
- Dönem seçimi (`today`, `weekly`, `monthly`, `quarterly`)
- Grafik ve kategori/ödeme özetleri
- Satış ve stok aktivitelerini birleştiren tablo
- Arama, kullanıcı filtresi ve Satış / Mal Kabul / Stok / Atık Ürün aktivite filtresi
- Tarayıcıda data URI oluşturan gerçek CSV indirme
- Satış detayı için yazdırma

Bilinen sözleşme kusuru: `DatePreset` union'ı `today | weekly | monthly | quarterly` iken başlangıç state'i cast ile `'daily'` yapılmıştır.

İşletme filtresinde eşleşen satış/stok yoksa tüm veriye fallback yapılır. Toplam stok değeri `salePrice * stock` ile hesaplanır. Log ve rapor verileri işletme kapsamlı değildir; bu ekran finansal kaynak-of-truth değildir.

Aktivite filtresi mevcut log sözleşmesinin `sales | stock` ayrımını ekran kategorilerine çevirir. `stock` loglarında açıklama veya detay içinde “mal kabul”/“stok girişi” geçenler Mal Kabul, “atık” geçenler Atık Ürün, kalanlar Stok İşlemleri sayılır. Bugünkü sabit mock loglarda Mal Kabul veya Atık kaydı bulunmadığı için bu iki filtre boş sonuç verebilir.

## Route'a bağlı olmayan modüller

### Dashboard

Sabit servis verisiyle günlük ciro, satış, kritik stok, aktif kullanıcı; son satışlar ve stok seviyeleri gösterir. `businessId` veya canlı servis mutasyonlarına bağlı değildir.

### Reports

`daily | weekly | monthly` periyoduna göre özet ve tablo/grafik verisi gösterir. Veriler sabittir ve satış CRUD işlemlerinden türetilmez.

### Logs

15 sabit log kaydı üzerinde tip, kullanıcı, tarih ve metin filtresi sağlar; login/logout kayıtları hook tarafından sonuçlardan çıkarılır. Detay drawer'ı değişiklikleri gösterir. Sayfadaki dışa aktarma butonu yalnızca “henüz eklenmedi” mesajı verir; servisteki `exportLogs` da dosya üretmez.
