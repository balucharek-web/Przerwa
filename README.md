# Czas Przerwy — Aplikacja PWA (Progressive Web App)

Nowoczesna aplikacja webowa **PWA** do precyzyjnego monitorowania czasu przerw w pracy, wyposażona w dzienny limit (domyślnie 30 minut), automatyczny alarm ostrzegawczy na 3 minuty przed końcem przerwy, syntetyzator dźwięku Web Audio API, wibracje oraz pełną historię miesięczną z możliwością eksportu do CSV.

## 🚀 Główne funkcje

- ⏱ **Dynamiczny licznik i tarcza postępu**: Prezentacja pozostałego i wykorzystanego czasu na estetycznym wskaźniku kołowym ze zmianą kolorów (zielony ➔ żółty warning ➔ czerwony alert).
- 🚨 **Alarm 3 minuty**: Automatyczny sygnał dwutonowy (880 Hz / 1174 Hz) oraz sekwencja wibracji w telefonie po osiągnięciu 3 minut do wyczerpania limitu dziennego.
- 🛑 **Wykrycie przekroczenia limitu**: Ostrzeżenie i powiadomienie, gdy czas przerwy przekroczy wyznaczony limit.
- 📱 **Zgodność z PWA**:
  - Działa w trybie pełnoekranowym (standalone) jak natywna aplikacja bez pasków przeglądarki.
  - Możliwość instalacji 1 kliknięciem na Androidzie/Chromium oraz z instrukcją krok po kroku na iOS (Safari).
  - Pełne wsparcie offline (Service Worker cache).
- 🔄 **Godzina resetu doby (cyklu)**: Domyślnie ustawiona na 06:00 (idealna dla zmian nocnych i dziennych) z możliwością dostosowania w ustawieniach.
- 📅 **Historia miesięczna**: Zestawienie dni, łącznego czasu, średniej dziennej, podgląd poszczególnych sesji oraz eksport danych do pliku CSV.
- ➕ **Szybkie i ręczne dodawanie**: Przyciski +5 min, +15 min oraz modal do ręcznego wpisania minionej przerwy z notatką.

## 🛠 Uruchomienie lokalne

```bash
# Instalacja zależności
npm install

# Uruchomienie serwera deweloperskiego
npm run dev

# Zbudowanie wersji produkcyjnej PWA
npm run build
```

## 🌐 Hosting na GitHub Pages

Katalog `/docs` zawiera gotową, w pełni skompilowaną stronę PWA. Aby włączyć GitHub Pages:
1. Przejdź do **Settings** ➔ **Pages** w repozytorium GitHub.
2. W sekcji **Build and deployment** wybierz źródło: `Deploy from a branch`.
3. Wybierz gałąź `main` i folder `/docs` (lub `/root`).
4. Kliknij **Save**. Strona będzie dostępna pod adresem: `https://balucharek-web.github.io/Przerwa/`.
