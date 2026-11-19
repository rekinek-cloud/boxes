## 1. Przypadki użycia

| # | Werdykt | Dowód |
|---:|---|---|
| 1 | spełnione | Test katalogu sprawdza język, polecane, grupy i obrazy; zapisany wynik podaje 183 wzory i 174 miniatury: [przypadki.spec.ts](</home/dev/apps/boxes/sorto/e2e/przypadki.spec.ts:11>), [katalog.json](</home/dev/apps/boxes/sorto/dowody/e2e/komputer/01-katalog/katalog.json:1>). |
| 2 | spełnione | Test pobiera SVG i sprawdza sześć części oraz ich wymiary z uwzględnieniem korekty: [przypadki.spec.ts](</home/dev/apps/boxes/sorto/e2e/przypadki.spec.ts:34>), [pomiar.json](</home/dev/apps/boxes/sorto/dowody/e2e/komputer/02-zamkniete/pomiar.json:1>). |
| 3 | spełnione | Test porównuje pliki z wymiarem zewnętrznym i wewnętrznym oraz sprawdza różnicę równą dwukrotnej grubości: [przypadki.spec.ts](</home/dev/apps/boxes/sorto/e2e/przypadki.spec.ts:52>), [pomiar.json](</home/dev/apps/boxes/sorto/dowody/e2e/komputer/03-zew-wew/pomiar.json:1>). |
| 4 | spełnione | Pomiar pobranych plików sprawdza głębokość wczepów przy grubości 4 mm i kontrolnie 3 mm: [przypadki.spec.ts](</home/dev/apps/boxes/sorto/e2e/przypadki.spec.ts:70>), [pomiar.json](</home/dev/apps/boxes/sorto/dowody/e2e/komputer/04-grubosc/pomiar.json:1>). |
| 5 | spełnione | Test sprawdza polski opis pola oraz nominalne wymiary przy korekcie 0 i przesunięcie konturów przy 0,1 mm: [przypadki.spec.ts](</home/dev/apps/boxes/sorto/e2e/przypadki.spec.ts:86>), [pomiar.json](</home/dev/apps/boxes/sorto/dowody/e2e/komputer/05-korekta/pomiar.json:1>). |
| 6 | spełnione | Test sprawdza polski opis użycia wzorca i pobrany plik z oznaczeniami szczeliny: [przypadki.spec.ts](</home/dev/apps/boxes/sorto/e2e/przypadki.spec.ts:106>), [pomiar.json](</home/dev/apps/boxes/sorto/dowody/e2e/komputer/06-kalibracja/pomiar.json:1>). |
| 7 | spełnione | Test pobiera wzór pudełka otwartego i weryfikuje pięć części wraz z wymiarami: [przypadki.spec.ts](</home/dev/apps/boxes/sorto/e2e/przypadki.spec.ts:123>), [pomiar.json](</home/dev/apps/boxes/sorto/dowody/e2e/komputer/07-otwarte/pomiar.json:1>). |
| 8 | spełnione | Test sprawdza dziesięć części i różnicę wymiarów ścianek wieka oraz dołu wynikającą z grubości i luzu: [przypadki.spec.ts](</home/dev/apps/boxes/sorto/e2e/przypadki.spec.ts:136>), [pomiar.json](</home/dev/apps/boxes/sorto/dowody/e2e/komputer/08-wieko/pomiar.json:1>). |
| 9 | spełnione | Test sprawdza trzy przegrody i liczbę szczelin odpowiadającą ich krzyżowaniu; pomiar zapisano w dowodach: [przypadki.spec.ts](</home/dev/apps/boxes/sorto/e2e/przypadki.spec.ts:156>), [pomiar.json](</home/dev/apps/boxes/sorto/dowody/e2e/komputer/09-organizer/pomiar.json:1>). |
| 10 | spełnione | Test potwierdza, że FlexBox3 nie jest polecany, sprawdza jego polską nazwę i opis oraz wymiary pobranego pliku: [przypadki.spec.ts](</home/dev/apps/boxes/sorto/e2e/przypadki.spec.ts:171>), [pomiar.json](</home/dev/apps/boxes/sorto/dowody/e2e/komputer/10-spoza-polecanych/pomiar.json:1>). |
| 11 | spełnione | Test pobiera SVG podglądu przed zmianą i po niej, sprawdza nowy parametr oraz większy wymiar rysunku: [przypadki.spec.ts](</home/dev/apps/boxes/sorto/e2e/przypadki.spec.ts:187>), zrzuty [przed](</home/dev/apps/boxes/sorto/dowody/e2e/komputer/11-podglad/01-podglad-przed.png>) i [po](</home/dev/apps/boxes/sorto/dowody/e2e/komputer/11-podglad/02-podglad-po.png>). |
| 12 | spełnione | Test otwiera pobrane SVG, DXF i PDF oraz porównuje wymiary ich ramek z tolerancją 0,5 mm: [przypadki.spec.ts](</home/dev/apps/boxes/sorto/e2e/przypadki.spec.ts:204>), [pomiar.json](</home/dev/apps/boxes/sorto/dowody/e2e/komputer/12-formaty/pomiar.json:1>). |
| 13 | spełnione | Test zapisuje adres, otwiera go w nowej karcie i sprawdza zachowanie czterech wartości formularza: [przypadki.spec.ts](</home/dev/apps/boxes/sorto/e2e/przypadki.spec.ts:222>), [adres.txt](</home/dev/apps/boxes/sorto/dowody/e2e/komputer/13-adres/adres.txt:1>). |
| 14 | spełnione | Test sprawdza komunikaty dla zera, liczby ujemnej i tekstu, zachowanie wpisanej wartości oraz odpowiedź poniżej 500: [przypadki.spec.ts](</home/dev/apps/boxes/sorto/e2e/przypadki.spec.ts:241>), zrzuty w [dowodach błędnych wartości](</home/dev/apps/boxes/sorto/dowody/e2e/komputer/14-bledne-wartosci/>). |
| 15 | spełnione | Test klika link do edytora, następnie „Więcej wzorów” i sprawdza powrót do katalogu: [przypadki.spec.ts](</home/dev/apps/boxes/sorto/e2e/przypadki.spec.ts:263>), [przebieg](</home/dev/apps/boxes/sorto/dowody/e2e-przebieg.txt:49>). |
| 16 | spełnione | Test zmienia konfigurację, restartuje kontener, sprawdza język, grubość, adres edytora i niezmieniony identyfikator obrazu: [admin.spec.ts](</home/dev/apps/boxes/sorto/e2e/admin.spec.ts:22>), [przebieg admina](</home/dev/apps/boxes/sorto/dowody/e2e-admin-przebieg.txt:1>). |
| 17 | spełnione | Test dopisuje HingeBox do konfiguracji i sprawdza jego pojawienie się w polecanych, po czym przywraca konfigurację: [admin.spec.ts](</home/dev/apps/boxes/sorto/e2e/admin.spec.ts:54>), zrzut [nowego polecanego](</home/dev/apps/boxes/sorto/dowody/e2e/komputer/17-admin-polecane/01-nowy-polecany.png>). |

## 2. Pozostałe kryteria

- **B — niespełnione.** Domyślna domena serwisu jest wpisana w Compose jako `boxes.dev.sorto.ai`, a adres serwisu należy według zasady 1 polecenia trzymać w `sorto/konfiguracja/boxes.json`; dowód: [docker-compose.yml](</home/dev/apps/boxes/sorto/docker-compose.yml:17>).
- **C — spełnione.** Różnica względem `upstream/master` obejmuje wyłącznie pliki `sorto/`; licencja nie została zmieniona, a zapis próby scalenia podaje zero konfliktów: [wynik próby scalenia](</home/dev/apps/boxes/sorto/dowody/aktualizacja-oryginalu.txt:1>).
- **D — nie da się sprawdzić z plików w całości.** Fork zawiera `LICENSE.txt` identyczny z oryginałem, a kod nakładki dodaje stopkę z linkiem do forka i oryginału na stronach HTML: [LICENSE.txt](</home/dev/apps/boxes/LICENSE.txt>), [serwer.py](</home/dev/apps/boxes/sorto/serwer.py:138>); publicznego statusu repozytorium nie można potwierdzić bez dostępu sieciowego.
- **E — spełnione.** W repozytorium Boxes zmiany aplikacji są w `sorto/`; przegląd kodu repozytorium Pudełka nie wykazał plików ani fragmentów kodu Boxes.py, są tam jedynie adresy używane do wzajemnej nawigacji: [README Pudełek](</home/dev/apps/pudelka/README.md:1>).

## 3. Musi być poprawione

1. Przenieść domenę Boxes z wartości domyślnej Compose do `sorto/konfiguracja/boxes.json` i skonfigurować router Traefika tak, by korzystał z tej wartości bez dodatkowej stałej domeny.

## 4. Na później

- Test katalogu sprawdza progi `>150` wzorów i miniatur, a nie dokładne wartości 183 i 174 z zapisanego pomiaru.
- Publicznego statusu forka nie da się potwierdzić bez sprawdzenia GitHuba, które było poza zakresem tej kontroli.

**Uwaga o zakresie:** nie uruchamiałem testów ani poleceń sieciowych; ocenę opieram na kodzie testów i istniejących przebiegach oraz dowodach.
