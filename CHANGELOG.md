## VERSION 0.0.1

- project template added

## VERSION 0.0.2

- The error message for incorrect email or password entry was configured to be displayed under the "kullanıcı girişi" title, just like the others.

- Business descriptions on the "işletmenizi seçin" screen were removed.

- The minimum password length validation message was updated to "10 karakter".

- The ",kodu" part was deleted from the sales page.

- The "kodu" text in the placeholder was updated to "barkod".

- The "ürün kodu" display under products on the new sale screen was replaced with "barkod" since there is no "ürün kodu" field.

- The issue where entered text was covered by the percent symbol in the "iskonto" column was fixed.

- Product quantity, subtotal, and grand total fields were removed from the customer details page; "tc", "vkn", "fatura adresi", and "vergi dairesi" fields were added, and customer type selection was enabled.

- "vergi no" and "vergi dairesi" were excluded for the "bireysel" customer type.

- The "tckn" field was removed and the "ad soyad" field was changed to "Firma Adı" for the "kurumsal" customer type.

- "bireysel" and "kurumsal" customer types were defined, and filtering by customer type was implemented on the customers page.

- Date-based filtering with simple inputs (without a calendar picker) was implemented on the "satışlarım" page to allow viewing sales by specific date or date range.

- Sorting by brand and alphabetical sorting (A–Z / Z–A) by product name were added to the stock page.

- Barcode search was enabled on the stock page, and the placeholder was changed to "ürün adı veya barkod ile ara".

- The activity filter on the reports page was changed to filter by users instead of roles.

- The word "fatura" was revised to "satış" in completed sales (e.g., displaying "3 satış" instead of "3 fatura") because invoices are not issued for some sales.

- The text "Mevcut depo toplam satis degeri" was revised to "mevcut stok değeri".

- The text "Haftalık Trend Analizi" was changed to "Haftalık ciro grafiği", and to "Aylık ciro grafiği" for the monthly option.
