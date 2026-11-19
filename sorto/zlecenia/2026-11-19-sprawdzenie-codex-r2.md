## 1. Przypadki użycia

| # | Werdykt | Dowód |
|---:|---|---|
| 1 | spełnione | Test sprawdza polski katalog, polecane i grupy, a zapisany pomiar zawiera 183 wzory i 174 miniatury: [test](</home/dev/apps/boxes/sorto/e2e/przypadki.spec.ts:11>), [katalog.json](</home/dev/apps/boxes/sorto/dowody/e2e/komputer/01-katalog/katalog.json:1>). |
| 2 | spełnione | Test pobiera SVG i mierzy sześć części oraz wymiary z uwzględnieniem korekty: [test](</home/dev/apps/boxes/sorto/e2e/przypadki.spec.ts:34>), [pomiar](</home/dev/apps/boxes/sorto/dowody/e2e/komputer/02-zamkniete/pomiar.json:1>). |
| 3 | spełnione | Test porównuje pliki dla wymiarów zewnętrznych i wewnętrznych, sprawdzając różnicę równą dwukrotnej grubości: [test](</home/dev/apps/boxes/sorto/e2e/przypadki.spec.ts:52>), [pomiar](</home/dev/apps/boxes/sorto/dowody/e2e/komputer/03-zew-wew/pomiar.json:1>). |
| 4 | spełnione | Test mierzy głębokość wczepów dla grubości 4 mm i kontrolnie 3 mm: [test](</home/dev/apps/boxes/sorto/e2e/przypadki.spec.ts:70>), [pomiar](</home/dev/apps/boxes/sorto/dowody/e2e/komputer/04-grubosc/pomiar.json:1>). |
| 5 | spełnione | Test sprawdza polski opis korekty oraz wymiary przy 0 i 0,1 mm: [test](</home/dev/apps/boxes/sorto/e2e/przypadki.spec.ts:86>), [pomiar](</home/dev/apps/boxes/sorto/dowody/e2e/komputer/05-korekta/pomiar.json:1>). |
| 6 | spełnione | Test sprawdza opis użycia wzorca i oznaczenia na pobranym pliku: [test](</home/dev/apps/boxes/sorto/e2e/przypadki.spec.ts:106>), [pomiar](</home/dev/apps/boxes/sorto/dowody/e2e/komputer/06-kalibracja/pomiar.json:1>). |
| 7 | spełnione | Test weryfikuje pięć części oraz ich wymiary w pobranym pliku: [test](</home/dev/apps/boxes/sorto/e2e/przypadki.spec.ts:123>), [pomiar](</home/dev/apps/boxes/sorto/dowody/e2e/komputer/07-otwarte/pomiar.json:1>). |
| 8 | spełnione | Test mierzy dziesięć części i sprawdza różnicę wymiarów ścianek wieka względem dołu: [test](</home/dev/apps/boxes/sorto/e2e/przypadki.spec.ts:136>), [pomiar](</home/dev/apps/boxes/sorto/dowody/e2e/komputer/08-wieko/pomiar.json:1>). |
| 9 | spełnione | Test sprawdza trzy przegrody i ich szczeliny do krzyżowania: [test](</home/dev/apps/boxes/sorto/e2e/przypadki.spec.ts:156>), [pomiar](</home/dev/apps/boxes/sorto/dowody/e2e/komputer/09-organizer/pomiar.json:1>). |
| 10 | spełnione | Test potwierdza, że FlexBox3 nie jest polecany, sprawdza polską nazwę i opis oraz mierzy pobrany plik: [test](</home/dev/apps/boxes/sorto/e2e/przypadki.spec.ts:171>), [pomiar](</home/dev/apps/boxes/sorto/dowody/e2e/komputer/10-spoza-polecanych/pomiar.json:1>). |
| 11 | spełnione | Test pobiera podgląd przed i po zmianie parametru oraz porównuje wymiary rysunku: [test](</home/dev/apps/boxes/sorto/e2e/przypadki.spec.ts:187>), [zrzuty](</home/dev/apps/boxes/sorto/dowody/e2e/komputer/11-podglad/>). |
| 12 | spełnione | Test otwiera SVG, DXF i PDF i porównuje wymiary ramek z tolerancją 0,5 mm: [test](</home/dev/apps/boxes/sorto/e2e/przypadki.spec.ts:204>), [pomiar](</home/dev/apps/boxes/sorto/dowody/e2e/komputer/12-formaty/pomiar.json:1>). |
| 13 | spełnione | Test otwiera zapisany adres w nowej karcie i sprawdza cztery wartości formularza: [test](</home/dev/apps/boxes/sorto/e2e/przypadki.spec.ts:222>), [adres](</home/dev/apps/boxes/sorto/dowody/e2e/komputer/13-adres/adres.txt:1>). |
| 14 | spełnione | Test sprawdza komunikaty dla zera, liczby ujemnej i tekstu, zachowanie wpisu oraz odpowiedź poniżej 500: [test](</home/dev/apps/boxes/sorto/e2e/przypadki.spec.ts:241>), [zrzuty](</home/dev/apps/boxes/sorto/dowody/e2e/komputer/14-bledne-wartosci/>). |
| 15 | spełnione | Test klika do edytora i z powrotem do katalogu; w ustawieniach edytora adres katalogu jest konfigurowalny: [test](</home/dev/apps/boxes/sorto/e2e/przypadki.spec.ts:263>), [ustawienia edytora](</home/dev/apps/pudelka/public/ustawienia.json:4>). |
| 16 | spełnione | Test zmienia ustawienia, restartuje kontener i sprawdza język, grubość, adres oraz identyfikator obrazu: [test](</home/dev/apps/boxes/sorto/e2e/admin.spec.ts:22>), [przebieg admina](</home/dev/apps/boxes/sorto/dowody/e2e-admin-przebieg.txt:1>). |
| 17 | spełnione | Test dopisuje HingeBox do konfiguracji, sprawdza polecane i przywraca ustawienia: [test](</home/dev/apps/boxes/sorto/e2e/admin.spec.ts:54>), [zrzut](</home/dev/apps/boxes/sorto/dowody/e2e/komputer/17-admin-polecane/01-nowy-polecany.png>). |

## 2. Pozostałe kryteria

- **B — spełnione.** `adresSerwisu` jest w JSON, skrypt uruchomieniowy przekazuje go Compose jako `ADRES_SERWISU`, a Compose wymaga tej zmiennej bez wartości domyślnej: [konfiguracja](</home/dev/apps/boxes/sorto/konfiguracja/boxes.json:2>), [uruchom.sh](</home/dev/apps/boxes/sorto/uruchom.sh:4>), [Compose](</home/dev/apps/boxes/sorto/docker-compose.yml:19>).
- **C — spełnione.** Git pokazuje 119 zmienionych plików, wszystkie w `sorto/`; plik licencji ma ten sam SHA-256 co upstream, a zapis próby scalenia raportuje zero konfliktów: [próba aktualizacji](</home/dev/apps/boxes/sorto/dowody/aktualizacja-oryginalu.txt:1>).
- **D — spełnione.** Dowód podaje publiczny fork `rekinek-cloud/boxes`, rodzica `florianfesti/boxes` i GPL-3.0; `LICENSE.txt` jest identyczny z upstream, a nakładka dodaje linki do obu repozytoriów w stopce stron HTML: [status forka](</home/dev/apps/boxes/sorto/dowody/fork-publiczny.txt:1>), [stopka](</home/dev/apps/boxes/sorto/serwer.py:138>).
- **E — spełnione.** W repozytorium Pudełka znalezione odwołanie do Boxes ogranicza się do adresu w ustawieniach i komentarza; nie znaleziono przeniesionego kodu Boxes.py: [ustawienia](</home/dev/apps/pudelka/public/ustawienia.json:4>).

## 3. Musi być poprawione

brak

## 4. Na później

- Test katalogu sprawdza progi ponad 150 wzorów i miniatur, a nie dokładne liczby 183 i 174; dokładne liczby pozostają w pomiarze dowodowym.
- W aktualizacji oryginału przedstawiono symulację scalenia 60 commitów, a nie rzeczywiste scalenie nowszego stanu do gałęzi roboczej.
- Raport z rundy 1 ma historyczny wynik B jako niespełniony i wskazuje poprzednią ścieżkę konfiguracji; aktualna poprawka jest oceniona powyżej.
- `POZNIEJ.md` zawiera dalsze tłumaczenia, zgłoszenie tłumaczenia do upstream, czcionki nagłówków i gotowe ustawienia dla polecanych.
