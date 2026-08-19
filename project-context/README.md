# Şahin Motor Frontend — Project Context

Bu dizin, `sahinmotor-fe` kod tabanının güncel teknik ve işlevsel haritasıdır. Son canlı kod denetimi: **19 Ağustos 2026**.

> Bu belgeler tasarım hedefini değil, bugün çalışan kaynak kodu anlatır. Kod ile belge çelişirse `src/`, `package.json` ve yapılandırma dosyaları kaynak kabul edilmelidir.

## Okuma sırası

1. [Proje Özeti](01-PROJECT-OVERVIEW.md) — ürün kapsamı, teknoloji ve gerçek sistem sınırları
2. [Mimari ve Routing](02-ARCHITECTURE-AND-ROUTING.md) — klasör yapısı, route ağacı, layout ve ortak altyapı
3. [Kimlik Doğrulama ve İşletme Alanı](03-AUTH-AND-BUSINESS-DOMAINS.md) — giriş, kayıt kodları, işletme seçimi ve profil davranışı
4. [Feature Modülleri ve Servisler](04-FEATURE-MODULES-AND-SERVICES.md) — 11 feature alanının canlı akışları
5. [Veri Modelleri ve Tipler](05-DATA-MODELS-AND-TYPES.md) — TypeScript sözleşmeleri, sahiplik ve veri ilişkileri
6. [Geliştirme ve Konvansiyonlar](06-DEVELOPMENT-AND-CONVENTIONS.md) — komutlar, doğrulama, test durumu ve çalışma kuralları

## Hızlı gerçeklik kontrolü

- Uygulama React/Vite tabanlı, tarayıcıda çalışan bir SPA'dır.
- Backend, HTTP istemcisi, gerçek oturum, route guard ve kalıcı veri deposu yoktur.
- Servisler `setTimeout` kullanan modül içi mock diziler döndürür; sayfa yenilemesi veriyi başlangıç haline getirir.
- Ekranlar aynı alan adlarını kullansa da stok, satış, müşteri, rapor ve log verileri tek bir ortak store değildir.
- Router'a bağlı ekranlar: satış, stok, müşteri, bayi, kullanıcı ve işlemler.
- `dashboard`, `reports` ve `logs` modülleri kaynakta vardır fakat route veya menüye bağlı değildir.
- Mal Kabul, stok sayfası üzerinde açılan drawer içinde listeyi onaya kadar geçici tutar ve son onayda toplu/atomik uygular.
- Atık Ürün, kayıtlı ürünleri nedenleriyle geçici bir drawer listesinde toplar ve onayda stoktan toplu/atomik düşer.
- Otomatik test altyapısı yoktur. `npm run build` ana derleme kontrolüdür; lint tabanında bilinen mevcut hatalar bulunabilir.

## Güncelleme ilkesi

Bir davranış değiştirildiğinde yalnızca ilgili bölüm değil, bağlantılı route, hook, servis, tip ve sınırlama notları da birlikte güncellenmelidir. Özellikle `businessId`/`dealerId` sahipliği, mock veri izolasyonu ve gerçekte route'a bağlı olmayan ekranlar varsayımla belgelenmemelidir.
