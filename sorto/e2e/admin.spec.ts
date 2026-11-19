// Przypadki 16–17 (administrator): zmiany w pliku konfiguracyjnym bez przebudowy obrazu.
// Zmienia sorto/konfiguracja/boxes.json na serwerze i zawsze przywraca go w finally.
// Uruchamiane osobno (npm run e2e:admin), bo zmienia wspólny plik i restartuje kontener.
import { expect, test } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { czekajNaSerwis, Przejscie } from './pomoc';

const PLIK = path.resolve(__dirname, '../konfiguracja/boxes.json');
const KONTENER = process.env.KONTENER ?? 'boxes-app-1';
const zdrowie = () => execFileSync('docker', ['inspect', '-f', '{{.State.Health.Status}}', KONTENER]).toString().trim();
/** restart kontenera i czekanie, aż Docker uzna go za zdrowy (dopiero wtedy Traefik kieruje do niego ruch) */
const restart = async () => {
  execFileSync('docker', ['restart', KONTENER]);
  await expect.poll(zdrowie, { timeout: 120_000, intervals: [1000] }).toBe('healthy');
};
const obraz = () => execFileSync('docker', ['inspect', '-f', '{{.Image}}', KONTENER]).toString().trim();

test.describe.configure({ mode: 'serial', timeout: 300_000 });

test('16 admin: grubość 4 mm, język angielski i inny adres edytora po restarcie, bez przebudowy obrazu', async ({ page }, info) => {
  const p = new Przejscie(page, info, '16-admin-konfiguracja');
  const oryginal = readFileSync(PLIK, 'utf8');
  const obrazPrzed = obraz();
  const nowyAdres = 'https://pudelka.dev.sorto.ai/?z=katalogu-wzorow';
  try {
    const k = JSON.parse(oryginal);
    k.wartosciDomyslne.thickness = '4';
    k.jezykDomyslny = 'en';
    k.edytor.adres = nowyAdres;
    writeFileSync(PLIK, JSON.stringify(k, null, 2) + '\n');
    await restart();
    await czekajNaSerwis(page);
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.getByTestId('polecane').locator('h2').first()).toHaveText('Recommended');
    await expect(page.getByTestId('link-edytor')).toHaveAttribute('href', nowyAdres);
    await p.krok('katalog-po-angielsku');
    await page.goto('/ClosedBox');
    expect(await p.wartosc('thickness')).toBe('4');
    await p.krok('grubosc-4', '#thickness');
    expect(obraz()).toBe(obrazPrzed); // ten sam obraz — bez przebudowy
  } finally {
    writeFileSync(PLIK, oryginal);
    await restart();
    await czekajNaSerwis(page);
  }
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'pl');
  await p.krok('przywrocone');
});

test('17 admin: dopisany wzór pojawia się w sekcji Polecane', async ({ page }, info) => {
  const p = new Przejscie(page, info, '17-admin-polecane');
  const oryginal = readFileSync(PLIK, 'utf8');
  try {
    const k = JSON.parse(oryginal);
    expect(k.polecane).not.toContain('HingeBox');
    k.polecane.push('HingeBox');
    writeFileSync(PLIK, JSON.stringify(k, null, 2) + '\n');
    await page.goto('/');
    const nowy = page.getByTestId('polecany-HingeBox');
    await expect(nowy).toBeVisible();
    await expect(nowy).toContainText('Pudełko z zawiasami meblowymi');
    await p.krok('nowy-polecany', '[data-test="polecany-HingeBox"]');
  } finally {
    writeFileSync(PLIK, oryginal);
  }
  await page.goto('/');
  await expect(page.getByTestId('polecany-HingeBox')).toHaveCount(0);
  await p.krok('przywrocone', '[data-test="polecane"]');
});
