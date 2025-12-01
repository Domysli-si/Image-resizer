# Batch Image Resizer

**Autor:** Samuel Majer
**Škola:** Střední průmyslová škola elektrotechnická, Praha 2, Ječná 30
**Předmět:** Programování (PV) 
**Datum:** 2025

---

## 📋 Popis projektu

Batch Image Resizer je webová aplikace pro hromadné zpracování obrázků s využitím paralelního zpracování pomocí Web Workers. Aplikace umožňuje nahrát více obrázků najednou a automaticky je změnit na tři různé velikosti (thumbnail, medium, large).

**Klíčové vlastnosti:**
- ✅ Paralelní zpracování pomocí 3 Web Workers
- ✅ Fronta úloh s koordinací (producent-konsument pattern)
- ✅ Resource limiting (max 2 obrázky současně)
- ✅ Konfigurovatelné velikosti a režimy
- ✅ Real-time progress tracking
- ✅ Download jednotlivých souborů nebo ZIP archiv
- ✅ Persistence nastavení v localStorage

---

## 🎯 Splnění zadání

### Paralelizace
Aplikace využívá **3 Web Workers**, které paralelně zpracovávají různé obrázky. Každý worker je schopen zpracovat celý obrázek (všechny 3 velikosti).

### Koordinace a komunikace
- **ImageQueue** - fronta úloh implementující producent-konsument pattern
- **WorkerManager** - koordinuje workery a distribuuje práci
- Komunikace přes message passing (Main Thread ↔ Workers)

### Synchronizace a konflikty
- **Resource limiting** - max 2 obrázky zpracovávají současně (ochrana paměti)
- **Mutex pattern** - kontrola přístupu k frontě pomocí Set(`processing`)
- **Deadlock prevention** - workers se nikdy nevzájemně neblokují
- **Error handling** - při pádu workera se úloha vrátí do fronty

---

## 🚀 Instalace a spuštění

### Požadavky
- Node.js (verze 16+)
- npm nebo yarn
- Moderní webový prohlížeč (Chrome, Firefox, Edge, Safari)

### Instalace

```bash
# 1. Klonuj repozitář
git clone [URL repozitáře]
cd batch-image-resizer

# 2. Nainstaluj závislosti
npm install

# 3. Spusť vývojový server
npm run dev

# 4. Otevři prohlížeč na http://localhost:5173
```

### Build pro produkci

```bash
npm run build
```

Výsledné soubory budou v adresáři `dist/`.

---

## 📁 Struktura projektu

```
batch-image-resizer/
├── src/
│   ├── components/          # React komponenty
│   │   ├── ImageUploader.jsx
│   │   ├── ImageList.jsx
│   │   ├── ImageItem.jsx
│   │   ├── ConfigPanel.jsx
│   │   ├── WorkerMonitor.jsx
│   │   └── ResultsPanel.jsx
│   │
│   ├── core/                # Business logika
│   │   ├── WorkerManager.js
│   │   ├── ImageQueue.js
│   │   ├── StorageManager.js
│   │   └── constants.js
│   │
│   ├── workers/             # Web Workers
│   │   └── image-worker.js
│   │
│   ├── utils/               # Pomocné funkce
│   │   ├── imageUtils.js
│   │   └── fileUtils.js
│   │
│   ├── App.jsx              # Hlavní komponenta
│   ├── App.css              # Styling
│   └── main.jsx             # Entry point
│
├── public/
├── index.html
├── package.json
└── README.md
```

---

## 🔧 Konfigurace

### Výchozí velikosti obrázků

```javascript
thumbnail: 150x150px (cover mode)
medium:    800x600px (contain mode)
large:     1920x1080px (contain mode)
```

Lze změnit v UI v sekci "Configuration".

### Limity

- **Max obrázků najednou:** 10
- **Max velikost souboru:** 5MB
- **Podporované formáty:** JPEG, PNG, WebP
- **Max současně zpracovávaných:** 2 (resource limiting)

### Módy změny velikosti

- **Cover:** Vyplní celou plochu, může ořezat okraje
- **Contain:** Zachová celý obrázek, může přidat letterbox

---

## 🏗️ Architektura

### Hlavní komponenty

#### 1. WorkerManager
Orchestruje celý proces zpracování:
- Správa pool workers (3 workers)
- Distribuce práce z fronty
- Zpracování zpráv od workers
- Resource limiting (max 2 concurrent)

#### 2. ImageQueue
Fronta úloh implementující FIFO:
- Přidávání úloh (`enqueue`)
- Odebírání úloh (`dequeue`)
- Sledování zpracovávaných úloh (`processing` Set)
- Requeue při chybě

#### 3. image-worker.js
Web Worker pro resize:
- Načtení obrázku
- Změna velikosti pomocí Canvas API
- Generování JPEG s kvalitou 85%
- Progress reporting

### Tok dat

```
User Upload
    ↓
Validace
    ↓
ImageQueue.enqueue()
    ↓
WorkerManager.distributeWork()
    ↓
[Check resource limit]
    ↓
Worker.postMessage(RESIZE_IMAGE)
    ↓
[Worker zpracovává]
    ↓
Worker.postMessage(PROGRESS/COMPLETED)
    ↓
UI Update
    ↓
Download Results
```

---

## 🧪 Testování

### Manuální test scénáře

1. **Basic functionality**
   - Nahraj 3 obrázky
   - Ověř že se všechny zpracují
   - Stáhni výsledky

2. **Resource limiting**
   - Nahraj 5 obrázků
   - Sleduj Worker Monitor
   - Ověř že max 2 běží současně

3. **Progress tracking**
   - Nahraj velký obrázek
   - Sleduj progress bar
   - Ověř že se aktualizuje průběžně

4. **Configuration**
   - Změň velikosti
   - Nahraj obrázek
   - Ověř že má správné rozměry

5. **Error handling**
   - Pokus nahrát neplatný soubor
   - Pokus nahrát > 10 obrázků
   - Ověř chybové hlášky

6. **Persistence**
   - Změň nastavení
   - Refresh stránky
   - Ověř že nastavení zůstalo

---

## 🔬 Implementované vzory a techniky

### Design Patterns
- **Producer-Consumer:** ImageQueue + WorkerManager
- **Observer:** Callbacks pro progress/complete/error
- **Singleton:** WorkerManager (jeden instance)
- **Factory:** Vytváření image objektů

### Synchronizační mechanismy
- **Mutex:** Set pro sledování `processing` úloh
- **Semaphore-like:** Resource limiting (max 2 concurrent)
- **Message Passing:** Komunikace Main ↔ Workers

### Prevence problémů
- **Deadlock prevention:** Workers se nikdy nevzájemně nečekají
- **Starvation prevention:** FIFO fronta zajišťuje férové zpracování
- **Resource exhaustion:** Limit 2 concurrent chrání paměť

---

## 📊 Použité technologie

- **React 18.3** - UI framework
- **Vite 5.4** - Build tool
- **Web Workers API** - Paralelizace
- **Canvas API** - Změna velikosti obrázků
- **JSZip 3.10** - Vytváření ZIP archivů
- **FileSaver 2.0** - Stahování souborů
- **localStorage API** - Persistence nastavení

---

## 📝 Známé limitace

1. **Velikost paměti:** Velké obrázky (>10MB) mohou způsobit pomalé zpracování
2. **Prohlížeč:** Vyžaduje moderní prohlížeč s podporou Web Workers
3. **Offline:** Aplikace vyžaduje build, nelze spustit přímo z HTML

---

## 🐛 Řešení problémů

### Aplikace se nespustí
```bash
# Smaž node_modules a reinstaluj
rm -rf node_modules
npm install
```

### Workers nefungují
- Zkontroluj že používáš `npm run dev`, ne `file://`
- Otevři Developer Tools a zkontroluj Console

### Obrázky se nezpracovávají
- Zkontroluj formát (pouze JPEG, PNG, WebP)
- Zkontroluj velikost (max 5MB)

---

## 📄 Licence

Tento projekt je vytvořen jako školní projekt a je volně dostupný pro vzdělávací účely.

---

## 👤 Autor

**Samuel Majer**
- GitHub: Domysli-si
- Škola: Střední průmyslová škola elektrotechnická, Praha 2, Ječná 30

**Vytvořeno:** 2025
**Předmět:** Programování (PV)  
**Typ:** Školní projekt - Paralelizace

---

## 🙏 Poděkování

Projekt využívá open-source knihovny:
- JSZip - https://stuk.github.io/jszip/
- FileSaver.js - https://github.com/eligrey/FileSaver.js/

---

*Tento projekt demonstruje použití Web Workers pro paralelní zpracování dat v reálné aplikaci.*
