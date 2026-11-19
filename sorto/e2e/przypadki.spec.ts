// Przypadki użycia 1–15 (Anna) przez ekran: od wejścia na adres do pobranego i zmierzonego pliku.
import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { czesci, Przejscie, wymiary, zmierz } from './pomoc';

const KONFIGURACJA = JSON.parse(readFileSync(path.resolve(__dirname, '../konfiguracja/boxes.json'), 'utf8'));
const EDYTOR = process.env.EDYTOR ?? 'https://pudelka.dev.sorto.ai';
const blisko = (a: number, b: number, tol = 0.02) => Math.abs(a - b) <= tol;

test('01 katalog po polsku: Polecane i pełny katalog z obrazkami w grupach', async ({ page }, info) => {
  const p = new Przejscie(page, info, '01-katalog');
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'pl');
  const polecane = page.getByTestId('polecane');
  await expect(polecane.locator('h2').first()).toHaveText('Polecane');
  await p.krok('polecane', '[data-test="polecane"]');
  for (const nazwa of KONFIGURACJA.polecane) await expect(page.getByTestId(`polecany-${nazwa}`)).toBeVisible();
  await expect(page.getByTestId('polecany-ClosedBox')).toContainText('Pudełko zamknięte');
  const grupy = await page.locator('.container h2').allTextContents();
  for (const g of ['Pudełka', 'Pudełka z zawiasem elastycznym', 'Kasetki i wkładki do szuflad', 'Części i próbki']) expect(grupy).toContain(g);
  const wzory = page.locator('span.gallery, span.gallery_missing');
  const liczba = await wzory.count();
  expect(liczba).toBeGreaterThan(150);
  const zObrazkiem = await page.locator('span.gallery img').count();
  expect(zObrazkiem).toBeGreaterThan(150);
  p.zapisz('katalog.json', JSON.stringify({ wzory: liczba, zObrazkiem, grupy }, null, 1));
  await p.krok('grupy-katalogu', 'span.gallery >> nth=0');
  await page.locator('#search_id_FlexBox').scrollIntoViewIfNeeded();
  await expect.poll(() => page.locator('#search_id_FlexBox img').evaluate((i: HTMLImageElement) => i.naturalWidth)).toBeGreaterThan(0);
  await p.krok('obrazki-wzorow', '#search_id_FlexBox');
});

test('02 pudełko zamknięte 200x100x80, 3 mm: plik ma 6 ścianek o wpisanych wymiarach', async ({ page }, info) => {
  const p = new Przejscie(page, info, '02-zamkniete');
  await page.goto('/');
  await page.getByTestId('polecany-ClosedBox').click();
  await expect(page.locator('h2').first()).toHaveText('Pudełko zamknięte');
  await p.wpisz('x', 200); await p.wpisz('y', 100); await p.wpisz('h', 80); await p.wpisz('thickness', 3);
  await p.krok('wymiary');
  const plik = await p.pobierz('zamkniete-200x100x80.svg');
  const [m] = zmierz(plik);
  const cz = czesci(m);
  expect(cz).toHaveLength(6);
  const burn = Number(await p.wartosc('burn'));
  // obrys każdej części = wymiar nominalny + 2 × korekta szczeliny
  expect(wymiary(cz, 2 * burn)).toEqual([[200, 100], [200, 100], [200, 80], [200, 80], [100, 80], [100, 80]]);
  p.zapisz('pomiar.json', JSON.stringify({ burn, czesci: cz.map((c) => [c.szer, c.wys, c.napisy]) }, null, 1));
  await p.krok('pobrano');
});

test('03 wymiar zewnętrzny i wewnętrzny dają różne pliki, różnica = grubość ścianek', async ({ page }, info) => {
  const p = new Przejscie(page, info, '03-zew-wew');
  await page.goto('/ClosedBox');
  await p.wpisz('x', 200); await p.wpisz('y', 100); await p.wpisz('h', 80);
  await p.zaznacz('outside', true);
  await p.krok('zewnetrzne', '#outside');
  const zew = czesci(zmierz(await p.pobierz('zewnetrzne.svg'))[0]);
  await p.zaznacz('outside', false);
  await p.krok('wewnetrzne', '#outside');
  const wew = czesci(zmierz(await p.pobierz('wewnetrzne.svg'))[0]);
  const t = Number(await p.wartosc('thickness'));
  const a = wymiary(zew), b = wymiary(wew);
  expect(b).not.toEqual(a);
  // wymiary wewnętrzne 200x100x80 => każda ścianka większa o 2 × grubość
  b.forEach((w, i) => { expect(blisko(w[0] - a[i][0], 2 * t)).toBe(true); expect(blisko(w[1] - a[i][1], 2 * t)).toBe(true); });
  p.zapisz('pomiar.json', JSON.stringify({ grubosc: t, zewnetrzne: a, wewnetrzne: b }, null, 1));
});

test('04 grubość 4 mm: głębokość wczepów w pliku = 4 mm', async ({ page }, info) => {
  const p = new Przejscie(page, info, '04-grubosc');
  await page.goto('/ClosedBox');
  await p.wpisz('x', 200); await p.wpisz('y', 100); await p.wpisz('h', 80);
  await p.wpisz('thickness', 4);
  await p.krok('grubosc-4', '#thickness');
  const cz = czesci(zmierz(await p.pobierz('grubosc-4.svg'))[0]);
  const glebokosci = cz.map((c) => Math.min(...[...c.uskokiLewo, ...c.uskokiGora, ...c.uskokiPrawo, ...c.uskokiDol]));
  for (const g of glebokosci) expect(blisko(g, 4)).toBe(true);
  await p.wpisz('thickness', 3);
  const cz3 = czesci(zmierz(await p.pobierz('grubosc-3.svg'))[0]);
  const glebokosci3 = cz3.map((c) => Math.min(...[...c.uskokiLewo, ...c.uskokiGora, ...c.uskokiPrawo, ...c.uskokiDol]));
  for (const g of glebokosci3) expect(blisko(g, 3)).toBe(true);
  p.zapisz('pomiar.json', JSON.stringify({ glebokosciPrzy4mm: glebokosci, glebokosciPrzy3mm: glebokosci3 }, null, 1));
});

test('05 korekta szczeliny 0,1 mm przesuwa kontury o 0,1 mm; przy 0 wymiary nominalne; opis po polsku', async ({ page }, info) => {
  const p = new Przejscie(page, info, '05-korekta');
  await page.goto('/ClosedBox');
  await p.wpisz('x', 200); await p.wpisz('y', 100); await p.wpisz('h', 80);
  await p.pole('burn');
  const opis = page.locator('[id="burn_description"]');
  await expect(opis).toContainText('POŁOWA szerokości cięcia');
  await expect(opis).toContainText('w edytorze pudełek wpisuje się PEŁNĄ szerokość');
  await p.wpisz('burn', 0);
  await p.krok('korekta-0', '#burn');
  const zero = czesci(zmierz(await p.pobierz('korekta-0.svg'))[0]);
  await p.wpisz('burn', 0.1);
  await p.krok('korekta-0.1', '#burn');
  const jeden = czesci(zmierz(await p.pobierz('korekta-0.1.svg'))[0]);
  expect(wymiary(zero)).toEqual([[200, 100], [200, 100], [200, 80], [200, 80], [100, 80], [100, 80]]);
  // każdy brzeg odsunięty o 0,1 mm => obrys większy o 0,2 mm
  wymiary(jeden).forEach((w, i) => { expect(blisko(w[0] - wymiary(zero)[i][0], 0.2)).toBe(true); expect(blisko(w[1] - wymiary(zero)[i][1], 0.2)).toBe(true); });
  p.zapisz('pomiar.json', JSON.stringify({ korekta0: wymiary(zero), korekta01: wymiary(jeden) }, null, 1));
});

test('06 wzorzec do kalibracji szczeliny: plik i opis, jak go użyć', async ({ page }, info) => {
  const p = new Przejscie(page, info, '06-kalibracja');
  await page.goto('/');
  await page.getByTestId('polecany-BurnTest').click();
  await expect(page.locator('h2').first()).toHaveText('Wzorzec do kalibracji szczeliny');
  const opis = page.locator('.description');
  await expect(opis).toContainText('Jak użyć');
  await expect(opis).toContainText('POŁOWA szerokości cięcia');
  await p.krok('opis', '.description');
  const [m] = zmierz(await p.pobierz('wzorzec-kalibracji.svg'));
  const cz = czesci(m);
  expect(cz.length).toBeGreaterThan(0);
  const napisy = cz.flatMap((c) => c.napisy);
  expect(napisy.some((n) => /0\.1\d*mm/.test(n))).toBe(true);
  p.zapisz('pomiar.json', JSON.stringify({ czesci: cz.length, napisy }, null, 1));
});

test('07 pudełko otwarte: 5 ścianek', async ({ page }, info) => {
  const p = new Przejscie(page, info, '07-otwarte');
  await page.goto('/');
  await page.getByTestId('polecany-ABox').click();
  await p.wpisz('x', 150); await p.wpisz('y', 100); await p.wpisz('h', 60);
  await p.krok('wymiary');
  const cz = czesci(zmierz(await p.pobierz('otwarte.svg'))[0]);
  expect(cz).toHaveLength(5);
  const burn = Number(await p.wartosc('burn'));
  expect(wymiary(cz, 2 * burn)).toEqual([[150, 100], [150, 60], [150, 60], [100, 60], [100, 60]]);
  p.zapisz('pomiar.json', JSON.stringify(wymiary(cz, 2 * burn)));
});

test('08 pudełko z wiekiem: wieko jest osobną częścią i pasuje wymiarem', async ({ page }, info) => {
  const p = new Przejscie(page, info, '08-wieko');
  await page.goto('/');
  await page.getByTestId('polecany-TwoPiece').click();
  await expect(page.locator('h2').first()).toHaveText('Pudełko z nasuwanym wiekiem');
  await p.wpisz('x', 120); await p.wpisz('y', 80); await p.wpisz('h', 60);
  await p.krok('wymiary');
  const cz = czesci(zmierz(await p.pobierz('wieko.svg'))[0]);
  const t = Number(await p.wartosc('thickness'));
  const luz = Number(await p.wartosc('play')) * t;
  // Boxes.py TwoPiece: dwie skorupy — wewnętrzna (dół) i zewnętrzna (wieko nasuwane na dół), każda z 4 ścianek + dno
  expect(cz).toHaveLength(10);
  const sciany = cz.filter((c) => c.wys < 70).map((c) => c.szer).sort((a, b) => a - b);
  // ścianki wieka są dłuższe od ścianek dołu dokładnie o 2 × (grubość + luz): wieko obejmuje dół z luzem po bokach
  const roznica = 2 * (t + luz);
  const pary = sciany.filter((s) => sciany.some((u) => blisko(u - s, roznica)));
  expect(pary.length).toBe(4);
  p.zapisz('pomiar.json', JSON.stringify({ grubosc: t, luzNaStrone: luz, scianki: sciany, oczekiwanaRoznica: roznica }, null, 1));
});

test('09 organizer 3x2: przegrody z wycięciami na krzyżowanie', async ({ page }, info) => {
  const p = new Przejscie(page, info, '09-organizer');
  await page.goto('/');
  await page.getByTestId('polecany-TypeTray').click();
  await expect(page.locator('h2').first()).toHaveText('Organizer z przegródkami');
  await p.wpisz('sx', '50*3'); await p.wpisz('sy', '50*2'); await p.wpisz('h', 60);
  await p.krok('przegrodki');
  const cz = czesci(zmierz(await p.pobierz('organizer.svg'))[0]);
  const wewnetrzne = cz.filter((c) => c.napisy.some((n) => n.startsWith('inner')));
  expect(wewnetrzne).toHaveLength(3); // 1 przegroda wzdłuż + 2 w poprzek = 3 x 2 przegródki
  const szczeliny = wewnetrzne.map((c) => c.szczeliny.length / 2);
  expect(szczeliny.sort()).toEqual([1, 1, 2]);
  p.zapisz('pomiar.json', JSON.stringify(wewnetrzne.map((c) => ({ napis: c.napisy, szer: c.szer, wys: c.wys, szczeliny: c.szczeliny })), null, 1));
});

test('10 wzór spoza polecanych (zawias elastyczny): nazwa i opis po polsku, własne wymiary', async ({ page }, info) => {
  const p = new Przejscie(page, info, '10-spoza-polecanych');
  await page.goto('/');
  expect(KONFIGURACJA.polecane).not.toContain('FlexBox3');
  await page.locator('#search_id_FlexBox3 a').click();
  await expect(page.locator('h2').first()).toHaveText('Pudełko z elastycznym wiekiem');
  await expect(page.locator('h2 + p').first()).toHaveText('Pudełko z zawiasem elastycznym');
  await p.wpisz('x', 140); await p.wpisz('y', 90);
  await p.krok('wymiary');
  const cz = czesci(zmierz(await p.pobierz('zawias-elastyczny.svg'))[0]);
  expect(cz.length).toBeGreaterThan(3);
  const burn = Number(await p.wartosc('burn'));
  expect(wymiary(cz, 2 * burn).some(([a, b]) => blisko(a, 140) && blisko(b, 90))).toBe(true); // dno 140 x 90 (w pliku obrócone)
  p.zapisz('pomiar.json', JSON.stringify(cz.map((c) => [c.szer, c.wys])));
});

test('11 podgląd przed pobraniem zmienia się po zmianie parametru', async ({ page }, info) => {
  const p = new Przejscie(page, info, '11-podglad');
  await page.goto('/ClosedBox');
  const a = await p.podglad();
  await p.krok('podglad-przed', '#preview');
  await p.wpisz('x', 250);
  await expect(page.locator('#preview_img')).not.toHaveAttribute('src', a);
  const b = await p.podglad();
  expect(b).toContain('x=250');
  await p.krok('podglad-po', '#preview');
  const svgA = await (await page.request.get(a)).text();
  const svgB = await (await page.request.get(b)).text();
  p.zapisz('podglad-przed.svg', svgA); p.zapisz('podglad-po.svg', svgB);
  const [ma, mb] = zmierz(`${p.katalog}/podglad-przed.svg`, `${p.katalog}/podglad-po.svg`);
  expect(Math.max(...czesci(mb).map((c) => c.szer))).toBeGreaterThan(Math.max(...czesci(ma).map((c) => c.szer)));
});

test('12 ten sam projekt jako SVG, DXF i PDF: te same wymiary', async ({ page }, info) => {
  const p = new Przejscie(page, info, '12-formaty');
  await page.goto('/ClosedBox');
  await p.wpisz('x', 200); await p.wpisz('y', 100); await p.wpisz('h', 80);
  const pliki: string[] = [];
  for (const f of ['svg', 'dxf', 'pdf']) {
    await p.wybierz('format', f);
    await p.krok(`format-${f}`, '#format');
    pliki.push(await p.pobierz(`projekt.${f}`));
  }
  const [svg, dxf, pdf] = zmierz(...pliki);
  p.zapisz('pomiar.json', JSON.stringify({ svg: svg.ramka, dxf: dxf.ramka, pdf: pdf.ramka, elementyDxf: dxf.elementy }, null, 1));
  for (const inny of [dxf, pdf]) {
    expect(Math.abs(inny.ramka.szer - svg.ramka.szer)).toBeLessThan(0.5);
    expect(Math.abs(inny.ramka.wys - svg.ramka.wys)).toBeLessThan(0.5);
  }
});

test('13 adres z parametrami otwarty w nowej karcie pokazuje te same wartości', async ({ page, context }, info) => {
  const p = new Przejscie(page, info, '13-adres');
  await page.goto('/ClosedBox');
  await p.wpisz('x', 123); await p.wpisz('y', 77); await p.wpisz('h', 55); await p.wpisz('thickness', 4);
  await page.locator('button[name="render"][value="0"]').click();
  await expect(page).toHaveURL(/x=123/);
  const adres = page.url();
  p.zapisz('adres.txt', adres);
  await p.krok('zapisany-adres');
  const karta = await context.newPage();
  await karta.goto(adres);
  const q = new Przejscie(karta, info, '13-adres');
  expect(await q.wartosc('x')).toBe('123');
  expect(await q.wartosc('y')).toBe('77');
  expect(await q.wartosc('h')).toBe('55');
  expect(await q.wartosc('thickness')).toBe('4');
  await q.krok('nowa-karta');
});

test('14 zero, liczba ujemna i tekst: zrozumiały komunikat zamiast błędu serwera', async ({ page }, info) => {
  const p = new Przejscie(page, info, '14-bledne-wartosci');
  for (const [wartosc, tekst] of [['0', 'musi być większe od zera'], ['-5', 'musi być większe od zera'], ['abc', 'potrzebna jest liczba']]) {
    await page.goto('/ClosedBox');
    await p.wpisz('x', wartosc);
    const podglad = await page.locator('#preview_img').getAttribute('src');
    const odp = await page.request.get(podglad!);
    expect(await odp.text()).toContain('Popraw wartości');
    const [r] = await Promise.all([
      page.waitForResponse((r) => r.url().includes('render=2')),
      page.locator('button[name="render"][value="2"]').click(),
    ]);
    expect(r.status()).toBeLessThan(500);
    const bledy = page.getByTestId('bledy');
    await expect(bledy).toBeVisible();
    await expect(bledy).toContainText(tekst);
    await expect(bledy).toContainText('szerokość (x)');
    expect(await p.wartosc('x')).toBe(wartosc); // formularz zachowuje wpisane wartości
    await p.krok(`komunikat-${wartosc}`, '[data-test="bledy"]');
  }
});

test('15 link do edytora i z powrotem przez „Więcej wzorów”', async ({ page }, info) => {
  const p = new Przejscie(page, info, '15-linki');
  await page.goto('/');
  await p.krok('katalog', '[data-test="link-edytor"]');
  await page.getByTestId('link-edytor').click();
  await expect(page).toHaveURL(new RegExp('^' + EDYTOR.replace(/\./g, '\\.')));
  const wiecej = page.getByTestId('wiecej-wzorow');
  await expect(wiecej).toHaveText('Więcej wzorów');
  await p.krok('edytor', '[data-test="wiecej-wzorow"]');
  await wiecej.click();
  await expect(page).toHaveURL(new RegExp(KONFIGURACJA.adresSerwisu.replace(/\./g, '\\.')));
  await expect(page.getByTestId('polecane')).toBeVisible();
  await p.krok('z-powrotem-w-katalogu');
});
