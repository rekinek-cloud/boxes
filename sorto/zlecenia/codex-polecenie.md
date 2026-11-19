Jesteś niezależnym odbiorcą zlecenia. Repozytorium: bieżący katalog = publiczny fork Boxes.py (rekinek-cloud/boxes) z naszą warstwą w katalogu sorto/.
Polecenie z kryteriami: sorto/zlecenia/2026-11-19-polecenie.md. Meldunek wykonawcy i tabela 17 przypadków: sorto/zlecenia/2026-11-19.md.
Różnica kodu względem oryginału: `git diff upstream/master master` (gałąź upstream/master = florianfesti/boxes; wolno uruchamiać polecenia git tylko do odczytu).
Dowody: sorto/dowody/ (zrzuty, pobrane pliki i pomiary w sorto/dowody/e2e/<komputer|telefon>/<nr>/, przebiegi sorto/dowody/e2e-przebieg.txt i e2e-admin-przebieg.txt, próba scalenia z oryginałem sorto/dowody/aktualizacja-oryginalu.txt).
Repozytorium edytora pudełek (do sprawdzenia, czy nie przepłynął kod): /home/dev/apps/pudelka (tylko odczyt).

Pracujesz tylko do odczytu. Nie otwieraj plików .env ani kopii zapasowych. Nie uruchamiaj poleceń sieciowych.

Oceniasz WYŁĄCZNIE pięć rzeczy (tak każe polecenie):
A. Czy każdy z 17 przypadków użycia naprawdę przechodzi — na podstawie kodu (sorto/serwer.py, sorto/po/pl.po, konfiguracji), testów (sorto/e2e/) i dowodów: czy test faktycznie sprawdza to, co mówi przypadek, i czy dowód istnieje i pasuje.
B. Czy w naszej warstwie są wartości na sztywno, które według zasady 1 polecenia powinny być w pliku konfiguracyjnym sorto/konfiguracja/boxes.json.
C. Czy nasze zmiany są odseparowane od kodu oryginału (żaden plik oryginału nie jest zmieniony, osobna warstwa obrazu, scalanie z oryginałem bez konfliktów).
D. Czy spełniona jest licencja: publiczny fork, plik licencji i informacja o autorze zostają, w stopce każdej strony link do kodu naszego forka i do oryginału.
E. Czy między repo boxes (ten katalog) a pudelka (/home/dev/apps/pudelka) nie przepłynął żaden kod (wzajemne linki-adresy są dozwolone).

Uwag o stylu, refaktoryzacji i nowych funkcjach NIE zgłaszaj jako blokad — wypisz je osobno na końcu w sekcji „Na później”.

Format odpowiedzi (po polsku):
1. Tabela: przypadek 1–17 → werdykt (spełnione / niespełnione / nie da się sprawdzić z plików) + jedno zdanie dowodu (ścieżka pliku).
2. B, C, D, E → werdykt + dowód.
3. „Musi być poprawione”: zamknięta, numerowana lista blokad; przy każdej jedno zdanie, jak poprawić. Jeśli brak — napisz „brak”.
4. „Na później”: reszta uwag.
