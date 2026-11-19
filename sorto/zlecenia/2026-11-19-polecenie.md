# Polecenie dla Claude Code: katalog wzorów Boxes.py pod boxes.dev.sorto.ai

## Cel

Drugi serwis obok edytora pudełek: gotowy, otwarty generator Boxes.py z pełnym katalogiem wzorów, uruchomiony pod adresem `boxes.dev.sorto.ai`. Nie piszemy geometrii i nie zmieniamy wzorów. Dokładamy tylko: wdrożenie, język polski, wartości domyślne z konfiguracji, listę polecanych wzorów i wzajemne linki z edytorem `pudelka.dev.sorto.ai`.

Wynik końcowy: człowiek wchodzi na adres, widzi wszystkie wzory Boxes.py po polsku, wybiera jeden, wpisuje wymiary i pobiera plik do cięcia. Z edytora pudełek trafia tu jednym kliknięciem i odwrotnie.

## Materiał wyjściowy

- Źródło: `https://github.com/florianfesti/boxes` (GPL v3+, Python 3).
- Fork: `rekinek-cloud/boxes`, publiczny. To wymóg licencji, nie wybór.
- Adres: `boxes.dev.sorto.ai`. Hetzner, Docker, Traefik, certyfikat, dostęp taki sam jak `pudelka.dev.sorto.ai`.
- Edytor `rekinek-cloud/pudelka` zostaje prywatny i osobny. Żaden plik z Boxes.py nie trafia do repo edytora, żaden plik edytora nie trafia do forka.

Wszystko, co niżej piszę o budowie Boxes.py, sprawdź w kodzie, nie w jego plikach .md. Jeśli kod mówi co innego niż to polecenie, wygrywa kod, a różnicę zgłoś w meldunku.

## Zasady

1. Zero wartości na sztywno. Każda nasza wartość (język domyślny, domyślna grubość materiału, domyślna korekta szczeliny, lista polecanych wzorów, dozwolone formaty, nazwa serwisu, adres i tekst linku do edytora) siedzi w jednym pliku konfiguracyjnym montowanym do kontenera. Zmiana nie wymaga przebudowy obrazu.
2. Nasze zmiany trzymaj jak najdalej od kodu oryginału (osobne pliki, osobna warstwa obrazu), żeby dało się pobierać nowe wersje z oryginału bez konfliktów. Sprawdź to praktycznie: pobierz bieżący stan oryginału do forka i potwierdź brak konfliktów.
3. Licencja: plik licencji i informacja o autorze zostają. W stopce każdej strony: link do kodu źródłowego naszego forka i do oryginalnego projektu.
4. Nie poprawiaj i nie przepisuj kodu Boxes.py. Nie dodawaj funkcji spoza polecenia. Pomysły do `POZNIEJ.md`.
5. Do sprawdzania logowania w GitHubie używaj `gh api user --jq .login`. Nie uruchamiaj `gh auth status`.

## Etapy

### Etap 1. Oryginał działa pod naszym adresem
- Obraz Docker z niezmienionego Boxes.py (jeśli repo ma własny Dockerfile i skrypt serwera, użyj ich).
- Wystawienie przez Traefik pod `boxes.dev.sorto.ai`.
- Miara: adres otwiera się, widać pełny katalog wzorów, pobranie SVG najprostszego pudełka działa. W meldunku: liczba wzorów w katalogu i data ostatniego commita w oryginale (`git log -1`).

### Etap 2. Polski, konfiguracja, polecane, linki
- Sprawdź stan polskiego tłumaczenia w repo. Uzupełnij mechanizmem tłumaczeń, którego repo już używa: nazwy i krótkie opisy wszystkich wzorów, nazwy grup, nazwy i opisy parametrów wspólnych (wymiary, grubość, korekta szczeliny, wczepy, format). Parametry szczególne pojedynczych wzorów mogą zostać po angielsku. W meldunku podaj, ile tekstów jest przetłumaczonych, a ile zostało.
- Język domyślny z konfiguracji, przełącznik języka zostaje.
- Katalog pokazuje wszystkie wzory. Nad nim sekcja „Polecane" z listą z konfiguracji. Na start: proste pudełko zamknięte, pudełko otwarte, pudełko z wiekiem, organizer z przegródkami, pudełko z zawiasem elastycznym, szuflady, wzorzec do kalibracji szczeliny. Dobierz do nich rzeczywiste nazwy wzorów z kodu.
- Link do edytora w nagłówku katalogu (tekst i adres z konfiguracji). W edytorze `pudelka` dodaj link „Więcej wzorów" prowadzący tutaj (tekst i adres z pliku ustawień edytora).
- Zdjęcia przykładowe wzorów: sprawdź w repo, na jakiej licencji są i czy pozwala na użycie w serwisie udostępnianym innym. Wynik podaj w meldunku. Niczego nie usuwaj bez mojej decyzji.
- Miara: przypadki 1 do 17 przechodzą.

### Etap 3. Sprawdzenie i oddanie
- Przejdź sam wszystkie przypadki jako użytkownik, przez ekran (Playwright), na komputerze i na telefonie 375 px, od wejścia na adres do pobranego pliku. Zrzut każdego kroku. Pobrane pliki otwórz i zmierz programowo.
- Potem Codex (niżej).
- Miara: tabela 17 przypadków z oceną da się / z trudem / nie da się i dowodem.

## Przypadki użycia

Anna ma laser i sklejkę 3 mm. Nie zna angielskiego żargonu.

1. Anna wchodzi na `boxes.dev.sorto.ai` i widzi po polsku sekcję „Polecane" oraz pełny katalog wzorów z obrazkami, podzielony na grupy.
2. Anna wybiera proste pudełko zamknięte, wpisuje 200 x 100 x 80 mm, grubość 3 mm, pobiera SVG. Plik ma 6 ścianek o wpisanych wymiarach.
3. Anna przełącza wymiar zewnętrzny i wewnętrzny. Dostaje dwa różne pliki, różnica wynika z grubości ścianek.
4. Anna zmienia grubość na 4 mm. Głębokość wczepów w pliku wynosi 4 mm.
5. Anna wpisuje korektę szczeliny 0,1 mm (w Boxes.py parametr „burn": połowa szerokości cięcia). Kontury zmieniają się o tę wartość, przy 0 są nominalne. Opis przy polu mówi po polsku, że to połowa szerokości cięcia, czyli inaczej niż w edytorze pudełek, gdzie wpisuje się pełną szerokość.
6. Anna pobiera wzorzec do kalibracji szczeliny i z opisu rozumie, jak go użyć.
7. Anna robi pudełko otwarte. Plik ma 5 ścianek.
8. Anna robi pudełko z wiekiem. Wieko jest osobną częścią i pasuje wymiarem.
9. Anna robi organizer 3 x 2 przegródki. Plik zawiera przegrody z wycięciami na krzyżowanie.
10. Anna otwiera wzór spoza polecanych (pudełko z zawiasem elastycznym), zmienia wymiary i pobiera plik. Nazwa i opis wzoru są po polsku.
11. Anna widzi podgląd przed pobraniem i po zmianie parametru podgląd się zmienia.
12. Anna pobiera ten sam projekt jako SVG, DXF i PDF. Każdy plik otwiera się i ma te same wymiary.
13. Anna zapisuje adres strony z wpisanymi parametrami, otwiera w nowej karcie i widzi te same wartości.
14. Anna wpisuje zero, liczbę ujemną i tekst zamiast liczby. Dostaje zrozumiały komunikat, nie stronę błędu serwera.
15. Anna klika link do edytora i trafia na `pudelka.dev.sorto.ai`. W edytorze klika „Więcej wzorów" i wraca do katalogu.

Administrator:
16. Zmienia w pliku konfiguracyjnym domyślną grubość na 4 mm, język na angielski i adres linku do edytora, restartuje kontener. Strona pokazuje nowe wartości bez przebudowy obrazu.
17. Dopisuje do listy polecanych jeden wzór. Pojawia się w sekcji „Polecane".

## Sprawdzenie przez Codex (z ogranicznikiem)

- Po etapie 3 oddaj Codexowi: to polecenie, różnicę kodu względem oryginału i tabelę przypadków.
- Codex ocenia wyłącznie: czy każdy przypadek naprawdę przechodzi, czy są wartości na sztywno, czy nasze zmiany są odseparowane od kodu oryginału, czy spełniona jest licencja (publiczny fork, plik licencji, linki w stopce), czy między repo `boxes` i `pudelka` nie przepłynął żaden kod.
- Uwagi o stylu, refaktoryzacji i nowych funkcjach nie są wykonywane. Trafiają do `POZNIEJ.md`.
- Najwyżej dwie rundy poprawek. Po drugiej kończysz, a sprawy otwarte wypisujesz w meldunku z powodem.

## Meldunek końcowy

- Adres strony, adres publicznego forka, liczba wzorów, data ostatniego commita oryginału.
- Tabela 17 przypadków z oceną i dowodem.
- Lista naszych zmian względem oryginału (pliki) i wynik próby pobrania nowej wersji oryginału.
- Stan tłumaczenia w liczbach.
- Licencja zdjęć przykładowych.
- Zawartość pliku konfiguracyjnego.
- Co powiedział Codex i co z tym zrobiłeś.
- Zawartość `POZNIEJ.md`.
- Różnice między tym poleceniem a tym, co znalazłeś w kodzie.

Nie oddawaj mi niczego do sprawdzenia, dopóki sam nie przeszedłeś tego przez ekran, od wejścia na adres do pobranego pliku.
