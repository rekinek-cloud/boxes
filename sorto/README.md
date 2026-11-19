# Warstwa Sorto dla Boxes.py (boxes.dev.sorto.ai)

To jest publiczny fork [florianfesti/boxes](https://github.com/florianfesti/boxes) (GPL v3 lub nowsza).
Kod Boxes.py jest **niezmieniony**. Wszystkie nasze pliki są w tym katalogu `sorto/`:

| Plik | Co robi |
|---|---|
| `Dockerfile` | warstwa `oryginal` = Boxes.py zbudowany jak w `scripts/Dockerfile` oryginału, ale z kodu tego repo; warstwa `sorto` = nasze pliki |
| `Dockerfile.dockerignore` | czego nie wysyłać do budowania |
| `docker-compose.yml` | kontener za Traefikiem pod `boxes.dev.sorto.ai`, montuje `konfiguracja/` |
| `serwer.py` | nakładka WSGI na `scripts/boxesserver`: konfiguracja, język domyślny, wartości domyślne, dozwolone formaty, sprawdzanie liczb, nagłówek z linkiem do edytora, „Polecane”, stopka z licencją |
| `konfiguracja/boxes.json` | **jedyny plik konfiguracyjny**; zmiana działa bez przebudowy obrazu |
| `po/pl.po` | polskie tłumaczenie w mechanizmie oryginału (gettext, domena `boxes.py`) |
| `static/sorto.css` | style naszych dodatków i układ na telefonie |
| `e2e/` | przejścia przypadków użycia przez ekran (Playwright) i pomiar pobranych plików (`mierz.py`) |
| `dowody/` | zrzuty ekranu, pobrane pliki i pomiary z przejść |

## Uruchomienie

```sh
sorto/uruchom.sh        # = docker compose -f sorto/docker-compose.yml up -d --build z adresem z konfiguracji
```

Adres serwisu (`adresSerwisu`) jest w pliku konfiguracyjnym; jego zmiana wymaga ponownego `sorto/uruchom.sh` (nowe etykiety Traefika), ale nie przebudowy kodu.

## Konfiguracja (`konfiguracja/boxes.json`)

- `adresSerwisu` — domena, pod którą Traefik wystawia serwis.
- `jezykDomyslny` — język, gdy adres nie podaje `language=` (przełącznik języka oryginału zostaje); `jezykZapasowy` — teksty naszych dodatków dla języka bez własnych tekstów.
- `wartosciDomyslne` — wartości parametrów podstawiane, gdy adres ich nie podaje (np. `thickness`, `burn`, `format`).
- `dozwoloneFormaty` — formaty widoczne na liście i przyjmowane przy pobieraniu.
- `polecane` — nazwy klas wzorów w sekcji „Polecane”, w tej kolejności.
- `edytor.adres` — adres linku do edytora pudełek; tekst linku jest w `teksty.<język>.linkEdytora`.
- `kodZrodlowy` — linki w stopce (fork, oryginał, licencja).
- `parametryDodatnie`, `parametryNieujemne` — które parametry muszą być > 0, a które ≥ 0.
- `podgladBledu` — wygląd komunikatu w podglądzie, gdy wartości są błędne.
- `teksty` — wszystkie nasze napisy (nazwa serwisu, „Polecane”, komunikaty, stopka) po polsku i angielsku.

Serwer czyta plik od nowa po każdej zmianie. Restart kontenera (`docker restart boxes-app-1`) też wystarczy.

## Tłumaczenie

Plik `po/pl.po` ma wszystkie teksty z aktualnego `boxes.py.pot`. Przetłumaczone są: nazwy i krótkie opisy
wszystkich wzorów, nazwy grup, nagłówki ustawień, parametry wspólne (wymiary, grubość, korekta szczeliny, wczepy, format),
rodzaje krawędzi, napisy interfejsu i opis wzorca kalibracji szczeliny. Parametry szczególne pojedynczych wzorów
i długie opisy zostały po angielsku. Statystyka: `msgfmt --statistics -o /dev/null sorto/po/pl.po`.

Po pobraniu nowej wersji oryginału: wygeneruj nowy `po/boxes.py.pot` (jak w `setup.py`) i zaktualizuj
tłumaczenie poleceniem `msgmerge -U sorto/po/pl.po po/boxes.py.pot`.

## Pobieranie nowej wersji oryginału

```sh
git remote add upstream https://github.com/florianfesti/boxes   # raz
git fetch upstream && git merge upstream/master
docker compose -f sorto/docker-compose.yml up -d --build
```

Nasze zmiany są tylko w `sorto/`, więc scalanie nie daje konfliktów.

## Sprawdzanie przez ekran

```sh
cd sorto/e2e && npm install && npm run przygotuj
npm run e2e          # przypadki 1–15, komputer 1440 px i telefon 375 px
npm run e2e:admin    # przypadki 16–17 (zmieniają konfigurację i restartują kontener; zawsze ją przywracają)
```
