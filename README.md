# AwizaxjaApp – Grain Logistics

Aplikacja desktopowa (Electron + React + SQLite) do zarządzania punktem skupu zbóż.

## Moduły

| Moduł | Opis |
|-------|------|
| **Awizacje** | Kalendarz awizacji, kontrahenci, przewoźnicy, zboża, raporty |
| **Skup** | Przyjęcia, dostawy, cenniki, kontrakty, dokumenty, reguły jakości |
| **Magazyn** | Magazyny, stany, partie, ruchy, przesunięcia, inwentaryzacja |
| **Jakość** | Badania laboratoryjne, certyfikaty, procesy HACCP/GMP |
| **Sprzedaż** | Klienci, zamówienia, faktury |

## Wymagania

- Node.js 16+
- npm

## Uruchomienie

```bash
npm install
npm start          # build React + Electron (produkcja lokalna)
npm run dev        # hot-reload React + Electron (development)
start.bat          # Windows: build + electron
```

## Budowanie instalatora

```bash
npm run dist
```

Pliki w folderze `dist/`.

## Baza danych

- SQLite: `%APPDATA%/grain-logistics-app/grain_logistics.db` (Windows)
- Schemat: `schema.sql`
- Backup / restore / export JSON: **Ustawienia** na ekranie startowym

## Architektura

```
electron/          – proces główny, IPC, SQLite
  dbConstants.js   – lista dozwolonych tabel
  dbHelpers.js     – migracje, transakcje, mapowanie słowników
src/modules/       – moduły UI (awizacje, skup, magazyn, jakość, sprzedaż)
schema.sql         – pełny schemat bazy
```

## Testy

```bash
npm run test:db
```

## Integracja Skup ↔ Magazyn

Przy zapisie przyjęcia skupu system automatycznie mapuje zboże ze słownika `skup_grains` na `grains` (po nazwie) i tworzy ruch magazynowy w jednej transakcji SQLite.
