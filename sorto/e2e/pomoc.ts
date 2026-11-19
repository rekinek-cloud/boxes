// Pomocniki przejść przez ekran: zrzuty kroków, pola formularza Boxes.py, pobieranie i pomiar plików.
import { expect, type Page, type TestInfo } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

export const KATALOG = path.resolve(__dirname, '../dowody/e2e');
const PYTHON = path.resolve(__dirname, '.venv/bin/python');
const MIERZ = path.resolve(__dirname, 'mierz.py');

export interface Czesc {
  id: string; szer: number; wys: number; kontury: number; napisy: string[]; odniesienie: boolean;
  uskokiLewo: number[]; uskokiGora: number[]; uskokiPrawo: number[]; uskokiDol: number[];
  szczeliny: [number, string, number][];
}
export interface Pomiar {
  plik: string; format: 'svg' | 'dxf' | 'pdf'; czesci?: Czesc[]; ramka: { szer: number; wys: number };
  strona?: { szer: number; wys: number }; elementy?: Record<string, number>;
}

/** mierzy pliki narzędziem mierz.py (svgpathtools / ezdxf / PyMuPDF) */
export function zmierz(...pliki: string[]): Pomiar[] {
  return JSON.parse(execFileSync(PYTHON, [MIERZ, ...pliki]).toString());
}

/** części pudełka bez prostokąta kontrolnego */
export const czesci = (p: Pomiar) => (p.czesci ?? []).filter((c) => !c.odniesienie);

/** wymiary części jako posortowane pary [dłuższy, krótszy], zaokrąglone do 0,01 mm */
export const wymiary = (cz: Czesc[], odejmij = 0) =>
  cz.map((c) => [Math.max(c.szer, c.wys) - odejmij, Math.min(c.szer, c.wys) - odejmij].map((v) => Math.round(v * 100) / 100))
    .sort((a, b) => b[0] - a[0] || b[1] - a[1]);

export class Przejscie {
  private n = 0;
  constructor(public page: Page, private info: TestInfo, private przypadek: string) {
    mkdirSync(this.katalog, { recursive: true });
  }
  get katalog() {
    return `${KATALOG}/${this.info.project.name}/${this.przypadek}`;
  }
  async krok(nazwa: string, cel?: string) {
    if (cel) await this.page.locator(cel).first().scrollIntoViewIfNeeded();
    await this.page.waitForTimeout(300);
    await this.page.screenshot({ path: `${this.katalog}/${String(++this.n).padStart(2, '0')}-${nazwa}.png` });
  }
  zapisz(nazwa: string, tresc: string) {
    writeFileSync(`${this.katalog}/${nazwa}`, tresc);
  }
  /** pole formularza wzoru; rozwija zwiniętą grupę ustawień, jeśli trzeba */
  async pole(id: string) {
    const el = this.page.locator(`[id="${id}"]`);
    if (!(await el.isVisible())) {
      const tabela = await el.evaluate((e) => e.closest('table')?.id);
      await this.page.locator(`[id="h-${tabela}"]`).click();
      await expect(el).toBeVisible();
    }
    return el;
  }
  async wpisz(id: string, wartosc: string | number) {
    const el = await this.pole(id);
    await el.fill(String(wartosc));
    await el.press('Tab'); // zdarzenie „change” odświeża podgląd
  }
  async zaznacz(id: string, stan: boolean) {
    await (await this.pole(id)).setChecked(stan);
  }
  async wybierz(id: string, wartosc: string) {
    await (await this.pole(id)).selectOption(wartosc);
  }
  async wartosc(id: string) {
    return (await this.pole(id)).inputValue();
  }
  /** klika „Pobierz”, zapisuje plik w dowodach i zwraca jego ścieżkę */
  async pobierz(nazwa?: string): Promise<string> {
    const [dl] = await Promise.all([
      this.page.waitForEvent('download'),
      this.page.locator('button[name="render"][value="2"]').click(),
    ]);
    const sciezka = `${this.katalog}/${nazwa ?? dl.suggestedFilename()}`;
    await dl.saveAs(sciezka);
    return sciezka;
  }
  /** adres obrazka podglądu po ostatnim odświeżeniu */
  async podglad() {
    const img = this.page.locator('#preview_img');
    await expect(img).toHaveAttribute('src', /render=4/);
    await expect.poll(() => img.evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth > 0)).toBe(true);
    return (await img.getAttribute('src'))!;
  }
}

/** czeka, aż serwis odpowie 200 (po restarcie kontenera) */
export async function czekajNaSerwis(page: Page, adres = '/') {
  let zRzedu = 0; // trzy odpowiedzi 200 z rzędu: po restarcie Traefik bywa przez chwilę niestabilny
  await expect.poll(async () => {
    const kod = (await page.request.get(adres).catch(() => null))?.status() ?? 0;
    zRzedu = kod === 200 ? zRzedu + 1 : 0;
    return zRzedu;
  }, { timeout: 120_000, intervals: [1000] }).toBeGreaterThanOrEqual(3);
}
