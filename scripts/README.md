# Python Scripts untuk Kids B-Care

Koleksi script Python untuk analisis data nutrisi, export data, tracking makanan, dan pemrosesan gambar.

## 📋 Daftar Script

### 1. nutrition_analyzer.py
Menganalisis data nutrisi dari file JSON dan memberikan insights.

**Fitur:**
- Analisis distribusi makronutrien
- Frekuensi jenis makanan
- Rata-rata harian
- Top 10 makanan yang paling sering dikonsumsi

**Penggunaan:**
```bash
python nutrition_analyzer.py meals_data.json
```

### 2. data_export.py
Mengkonversi data nutrisi ke berbagai format (CSV, JSON summary).

**Fitur:**
- Export ke CSV (summary)
- Export ke CSV detail (per item makanan)
- Export summary JSON dengan statistik

**Penggunaan:**
```bash
# Export ke CSV
python data_export.py meals.json --csv summary.csv

# Export detailed CSV
python data_export.py meals.json --detailed-csv detailed.csv

# Export summary JSON
python data_export.py meals.json --summary-json summary.json

# Export semua format sekaligus
python data_export.py meals.json --all exported_data
```

### 3. meal_tracker.py
CLI untuk tracking makanan dari command line.

**Fitur:**
- Tambah makanan manual
- Lihat riwayat makanan
- Summary harian
- Hapus makanan terakhir
- Mode interaktif

**Penggunaan:**
```bash
# Tambah makanan
python meal_tracker.py add lunch 650 35 60 25 "Chicken with rice"

# Lihat riwayat 7 hari terakhir
python meal_tracker.py list 7

# Summary hari ini
python meal_tracker.py today

# Mode interaktif
python meal_tracker.py interactive

# Hapus makanan terakhir
python meal_tracker.py delete-last
```

### 4. nutrition_report.py
Generate laporan nutrisi mingguan yang komprehensif.

**Fitur:**
- Laporan overview
- Breakdown harian
- Total dan rata-rata mingguan
- Distribusi makronutrien dengan bar chart ASCII
- Distribusi jenis makanan
- Top 10 makanan
- Rekomendasi personal

**Penggunaan:**
```bash
# Print ke console
python nutrition_report.py meals.json

# Save ke file
python nutrition_report.py meals.json weekly_report.txt
```

### 5. image_preprocessor.py
Preprocessing gambar makanan sebelum dikirim ke API analisis.

**Fitur:**
- Resize gambar dengan maintain aspect ratio
- Optimasi kualitas dan ukuran file
- Konversi format
- Konversi ke base64
- Batch processing

**Penggunaan:**
```bash
# Process satu gambar
python image_preprocessor.py process food.jpg optimized.jpg

# Convert ke base64
python image_preprocessor.py base64 food.jpg food_b64.txt

# Batch process
python image_preprocessor.py batch ./raw_images ./optimized_images

# Dengan opsi custom
python image_preprocessor.py process food.jpg --max-size 1280x1280 --quality 90
```

## 🛠️ Instalasi

### Install Dependencies

```bash
pip install -r requirements.txt
```

atau install manual:

```bash
pip install Pillow
```

### Membuat Script Executable (Linux/Mac)

```bash
chmod +x scripts/*.py
```

## 📊 Contoh Workflow

### 1. Analisis Data Nutrisi
```bash
# Export data dari localStorage browser ke JSON
# (bisa pakai browser console atau export manual)

# Analisis data
python scripts/nutrition_analyzer.py meals_data.json

# Generate laporan
python scripts/nutrition_report.py meals_data.json weekly_report.txt

# Export ke berbagai format
python scripts/data_export.py meals_data.json --all exports/data
```

### 2. Tracking Manual
```bash
# Tambah breakfast
python scripts/meal_tracker.py add breakfast 450 25 50 12 "Oatmeal with fruits"

# Tambah lunch
python scripts/meal_tracker.py add lunch 680 40 65 22 "Grilled chicken salad"

# Lihat summary hari ini
python scripts/meal_tracker.py today

# Lihat riwayat minggu ini
python scripts/meal_tracker.py list 7
```

### 3. Preprocessing Gambar
```bash
# Optimize satu gambar
python scripts/image_preprocessor.py process photo.jpg optimized.jpg

# Batch optimize semua gambar
python scripts/image_preprocessor.py batch ./food_photos ./optimized_photos

# Generate base64 untuk API
python scripts/image_preprocessor.py base64 food.jpg food_base64.txt
```

## 📁 Format Data

### Format JSON untuk Meals
```json
[
  {
    "id": "unique-id",
    "mealType": "breakfast",
    "name": "Oatmeal with eggs",
    "notes": "Morning meal",
    "consumedAt": "2025-10-06T07:30:00",
    "createdAt": "2025-10-06T07:30:00",
    "analysisData": {
      "totals": {
        "calories_kcal": 500,
        "macros": {
          "protein_g": 30,
          "carbs_g": 50,
          "fat_g": 15,
          "fiber_g": 8,
          "sugar_g": 5
        },
        "micros": {...},
        "allergens": [],
        "serving_total_g": 350
      },
      "composition": [...],
      "image_meta": {...}
    }
  }
]
```

## 🔧 Tips & Tricks

1. **Export data dari browser localStorage:**
   ```javascript
   // Di browser console
   const meals = localStorage.getItem('nutrition:meals');
   const blob = new Blob([meals], {type: 'application/json'});
   const url = URL.createObjectURL(blob);
   const a = document.createElement('a');
   a.href = url;
   a.download = 'meals_data.json';
   a.click();
   ```

2. **Automated weekly report:**
   ```bash
   # Buat cron job untuk generate laporan mingguan
   # crontab -e
   0 9 * * 1 cd /path/to/project && python scripts/nutrition_report.py meals.json reports/weekly_$(date +\%Y\%m\%d).txt
   ```

3. **Batch preprocessing untuk upload:**
   ```bash
   # Optimize semua foto sebelum upload
   python scripts/image_preprocessor.py batch ./today_meals ./optimized --max-size 1920x1920 --quality 85
   ```

## 📝 Catatan

- Script ini dirancang untuk bekerja dengan data format Kids B-Care
- Semua script standalone dan tidak memerlukan Node.js
- Image preprocessor memerlukan library Pillow
- Data disimpan dalam format JSON standar untuk portabilitas

## 🤝 Kontribusi

Silakan buat issue atau pull request untuk improvement atau bug fixes.

## 📄 Lisensi

MIT License
