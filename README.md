# Aplikacja do Zarządzania Awizacjami - Punkt Skupu Zbóż

Aplikacja desktopowa do zarządzania awizacjami pojazdów w punktach skupu zbóż, zbudowana w technologii Electron + React.

## Funkcjonalności

- **Dashboard** - Przegląd awizacji w formie kalendarza i tabeli
- **Zarządzanie awizacjami** - Dodawanie, edycja i usuwanie awizacji
- **Słownik zbóż** - Zarządzanie rodzajami zbóż
- **Kontrahenci** - Zarządzanie bazą kontrahentów
- **Raporty** - Generowanie raportów i statystyk
- **Ustawienia** - Kopia zapasowa i eksport danych

## Technologie

- **Aplikacja desktopowa**: Electron + React
- **Interfejs użytkownika**: Material-UI, React Icons
- **Baza danych**: SQLite (lokalna)
- **Styling**: Material-UI Theme

## Instalacja

### Wymagania
- Node.js 16+ 
- npm lub yarn

### Instalacja zależności
```bash
npm install
```

## Uruchomienie

### Główny sposób uruchamiania
```bash
npm start
```

### Szybkie uruchomienie (alternatywa)
```bash
# Windows
start.bat

# Linux/macOS
chmod +x start.sh
./start.sh
```

### Ręczne uruchomienie
```bash
# Budowanie aplikacji React
npm run build

# Uruchomienie aplikacji Electron
npm run electron
```

### Budowanie dystrybucji
```bash
# Windows
npm run dist

# Linux
npm run dist

# macOS
npm run dist
```

## Struktura projektu

```
AwizaxjaApp/
├── electron/           # Kod Electron
│   ├── main.js        # Główny proces
│   └── preload.js     # Preload script
├── src/               # Kod React
│   ├── components/    # Komponenty React
│   ├── App.js         # Główny komponent
│   └── index.js       # Punkt wejścia
├── public/            # Pliki publiczne
├── schema.sql         # Schemat bazy danych
├── start.bat          # Skrypt uruchamiania Windows
├── start.sh           # Skrypt uruchamiania Linux/macOS
└── package.json       # Konfiguracja projektu
```

## Baza danych

Aplikacja używa SQLite z automatyczną inicjalizacją. Baza danych jest przechowywana w katalogu użytkownika aplikacji.

### Tabele:
- `grains` - Rodzaje zbóż
- `contractors` - Kontrahenci
- `appointments` - Awizacje
- `weights` - Ważenia
- `settings` - Ustawienia aplikacji

## Funkcje aplikacji

### Dashboard
- Kalendarz awizacji
- Tabela z filtrowaniem
- Statystyki w czasie rzeczywistym

### Zarządzanie awizacjami
- Formularz dodawania/edycji
- Walidacja danych
- Statusy awizacji (oczekująca, w trakcie, zakończona, anulowana)

### Słownik zbóż
- CRUD operacje na zbożach
- Jednostki miary (t, kg, g)

### Kontrahenci
- Pełne zarządzanie kontrahentami
- Typy: rolnik, firma, transport
- Dane kontaktowe i adresowe

### Raporty
- Statystyki ogólne
- Filtrowanie po datach
- Eksport danych (planowane)

### Ustawienia
- Kopia zapasowa bazy danych
- Eksport danych (planowane)
- Informacje o aplikacji

## Rozwój

### Dodawanie nowych funkcji
1. Utwórz komponent w `src/components/`
2. Dodaj routing w `src/App.js`
3. Dodaj nawigację w `src/components/Navigation.js`
4. Zaktualizuj schemat bazy danych jeśli potrzebne

### Style
- Używaj Material-UI dla komponentów
- Bootstrap dla layoutu
- Własne style w `src/App.css`

## Budowanie

### Windows
```bash
npm run dist
```
Pliki dystrybucji w `dist/` folderze.

### Linux
```bash
npm run dist
```
AppImage w `dist/` folderze.

### macOS
```bash
npm run dist
```
DMG w `dist/`