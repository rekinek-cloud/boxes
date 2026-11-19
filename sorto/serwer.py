# Warstwa serwisu boxes.dev.sorto.ai nałożona na niezmieniony serwer Boxes.py (scripts/boxesserver).
#
# Nie zmienia kodu Boxes.py. Owija aplikację WSGI oryginału i:
#  - czyta jeden plik konfiguracyjny (ścieżka w zmiennej KONFIGURACJA), przy każdej zmianie pliku od nowa,
#  - ustawia język domyślny, gdy adres nie wskazuje języka (przełącznik języka oryginału zostaje),
#  - podstawia wartości domyślne parametrów (np. grubość, korekta szczeliny, format), gdy adres ich nie podaje,
#  - ogranicza listę formatów do dozwolonych,
#  - sprawdza liczby przed generowaniem i zamiast strony błędu pokazuje formularz z komunikatem,
#  - dokleja do stron HTML: nagłówek z nazwą serwisu i linkiem do edytora, sekcję „Polecane”, stopkę z licencją.
#
# Copyright (C) 2026 Sorto. Ten plik jest częścią forka Boxes.py i podlega tej samej licencji (GPL v3 lub nowsza).
from __future__ import annotations

import argparse
import html
import json
import os
import re
import threading
from pathlib import Path
from urllib.parse import quote, unquote_plus

import scripts.boxesserver as oryginal  # moduł oryginału (w obrazie: kopia scripts/boxesserver jako .py)

SCIEZKA_KONFIGURACJI = os.environ.get("KONFIGURACJA", "/konfiguracja/boxes.json")
KATALOG_STATYCZNY = Path(__file__).parent / "static"
PREFIKS_STATYCZNY = "/static/sorto/"


class Konfiguracja:
    """Plik konfiguracyjny czytany od nowa po każdej zmianie (zmiana nie wymaga przebudowy ani restartu)."""

    def __init__(self, sciezka: str) -> None:
        self.sciezka = sciezka
        self._znacznik = None
        self._dane: dict = {}
        self._blokada = threading.Lock()

    def dane(self) -> dict:
        znacznik = os.stat(self.sciezka).st_mtime_ns
        if znacznik != self._znacznik:
            with self._blokada:
                with open(self.sciezka, encoding="utf-8") as f:
                    self._dane = json.load(f)
                self._znacznik = znacznik
        return self._dane


konfiguracja = Konfiguracja(SCIEZKA_KONFIGURACJI)
# instancja utworzona przez sam moduł oryginału (adres plików statycznych: zmienna STATIC_URL, jak w oryginale);
# druga instancja BServer dopisałaby wszystkie wzory do grup drugi raz
serwer = oryginal.boxserver


# ---------- pomocnicze ----------

def argumenty_zapytania(qs: str) -> list[str]:
    return [unquote_plus(a) for a in qs.split("&")] if qs else []


def wartosc(args: list[str], klucz: str) -> str | None:
    for a in args:
        if a.startswith(klucz + "="):
            return a[len(klucz) + 1:]
    return None


def akcje_wzoru(box) -> dict[str, argparse.Action]:
    wynik = {}
    for grupa in box.argparser._action_groups:
        for a in grupa._group_actions:
            if a.option_strings and not isinstance(a, argparse._HelpAction):
                wynik[a.option_strings[0].lstrip("-")] = a
    return wynik


def teksty(k: dict, kod_jezyka: str) -> dict:
    wszystkie = k["teksty"]
    return wszystkie.get(kod_jezyka) or wszystkie.get(k["jezykZapasowy"]) or wszystkie[k["jezykDomyslny"]]


def wypelnij(szablon: str, **pola) -> str:
    return szablon.format(**{n: html.escape(str(v)) for n, v in pola.items()})


# ---------- sprawdzanie wartości ----------

def sprawdz(box, args: list[str], k: dict, t: dict, _) -> list[str]:
    """Zwraca listę zrozumiałych komunikatów; pusta = można generować."""
    akcje = akcje_wzoru(box)
    bledy = []
    for a in args:
        if "=" not in a:
            continue
        nazwa, w = a.split("=", 1)
        akcja = akcje.get(nazwa)
        if akcja is None:
            continue
        pole = _(nazwa.split("_", 1)[1] if nazwa[:1].isupper() and "_" in nazwa else nazwa)
        if nazwa == "format" and w not in k["dozwoloneFormaty"]:
            bledy.append(wypelnij(t["bladFormat"], wartosc=w))
            continue
        liczby: list[float] | None = None
        if akcja.type in (float, int):
            try:
                liczby = [float(w)]
            except ValueError:
                bledy.append(wypelnij(t["bladLiczba"], pole=pole, wartosc=w))
                continue
        elif getattr(akcja.type, "__name__", "") == "argparseSections":
            try:
                liczby = [float(x) for x in akcja.type(w)]
            except Exception:
                bledy.append(wypelnij(t["bladPrzegrodki"], pole=pole, wartosc=w))
                continue
        if liczby is None:
            continue
        if nazwa in k["parametryDodatnie"] and any(x <= 0 for x in liczby):
            bledy.append(wypelnij(t["bladDodatnie"], pole=pole, wartosc=w))
        elif nazwa in k["parametryNieujemne"] and any(x < 0 for x in liczby):
            bledy.append(wypelnij(t["bladNieujemne"], pole=pole, wartosc=w))
    if bledy:
        return bledy
    try:
        box.parseArgs(["--" + a for a in args if a and not a.startswith("render=")])
    except oryginal.ArgumentParserError as e:
        bledy.append(wypelnij(t["bladOgolny"], opis=str(e)))
    return bledy


# ---------- doklejanie do stron HTML ----------

def naglowek(k: dict, t: dict, jezyk: str) -> str:
    return (f'<header class="sorto-naglowek"><a class="sorto-nazwa" href="./?language={quote(jezyk)}">{html.escape(t["nazwaSerwisu"])}</a>'
            f'<a class="sorto-edytor" data-test="link-edytor" href="{html.escape(k["edytor"]["adres"])}">{html.escape(t["linkEdytora"])}</a></header>\n')


def stopka(k: dict, t: dict) -> str:
    z = k["kodZrodlowy"]
    return (f'<footer class="sorto-stopka" data-test="stopka"><p>{html.escape(t["stopkaOpis"])}</p><p>'
            f'<a data-test="link-fork" href="{html.escape(z["fork"])}">{html.escape(t["stopkaFork"])}</a> · '
            f'<a data-test="link-oryginal" href="{html.escape(z["oryginal"])}">{html.escape(t["stopkaOryginal"])}</a> · '
            f'<a href="{html.escape(z["licencja"])}">{html.escape(t["stopkaLicencja"])}</a></p></footer>\n')


def polecane(k: dict, t: dict, _, jezyk: str) -> str:
    statyczne = serwer.static_url
    pozycje = []
    for nazwa in k["polecane"]:
        box = serwer.boxes.get(nazwa)
        if box is None:
            continue
        opis = _(box.__doc__).strip() if box.__doc__ else ""
        pozycje.append(
            f'<a class="sorto-polecany" data-test="polecany-{nazwa}" href="{nazwa}?language={quote(jezyk)}">'
            f'<img alt="" loading="lazy" src="{statyczne}/samples/{nazwa}-thumb.jpg">'
            f'<span class="sorto-polecany-nazwa">{html.escape(_(nazwa))}</span>'
            f'<span class="sorto-polecany-opis">{html.escape(opis)}</span></a>')
    return (f'<section class="sorto-polecane" data-test="polecane"><h2>{html.escape(t["polecane"])}</h2>'
            f'<div class="sorto-polecane-lista">{"".join(pozycje)}</div>'
            f'<h2 class="sorto-katalog">{html.escape(t["wszystkieWzory"])}</h2></section>\n')


def ramka_bledow(t: dict, bledy: list[str]) -> str:
    lista = "".join(f"<li>{b}</li>" for b in bledy)
    return (f'<div class="sorto-bledy" role="alert" data-test="bledy"><strong>{html.escape(t["naglowekBledow"])}</strong>'
            f'<ul>{lista}</ul></div>\n')


def przetworz_html(tresc: str, k: dict, t: dict, _, jezyk: str, bledy: list[str] | None = None) -> str:
    tresc = tresc.replace("</head>", f'<link rel="stylesheet" href="{PREFIKS_STATYCZNY}sorto.css">\n</head>', 1)
    tresc = re.sub(r"<title>(.*?)</title>", lambda m: f"<title>{m.group(1)} · {html.escape(t['nazwaSerwisu'])}</title>", tresc, count=1, flags=re.S)
    tresc = re.sub(r"(<body[^>]*>)", lambda m: m.group(1) + "\n" + naglowek(k, t, jezyk), tresc, count=1)
    if '<div class="modenav">' in tresc:  # strona katalogu (galeria lub lista)
        tresc = re.sub(r'(<div class="modenav">.*?</div>)', lambda m: polecane(k, t, _, jezyk) + m.group(1), tresc, count=1, flags=re.S)
    tresc = re.sub(r'(<select name="format".*?</select>)', lambda m: tylko_dozwolone(m.group(1), k), tresc, count=1, flags=re.S)
    if bledy:
        tresc = tresc.replace('<form id="arguments"', ramka_bledow(t, bledy) + '<form id="arguments"', 1)
    tresc = tresc.replace("</body>", stopka(k, t) + "</body>", 1)
    return tresc


def tylko_dozwolone(select: str, k: dict) -> str:
    dozwolone = set(k["dozwoloneFormaty"])
    return re.sub(r'\s*<option value="([^"]*)"[^>]*>[^<]*</option>',
                  lambda m: m.group(0) if m.group(1) in dozwolone else "", select)


def svg_bledu(t: dict, bledy: list[str], k: dict) -> bytes:
    p = k["podgladBledu"]
    linie = [re.sub(r"<[^>]+>", "", html.unescape(b)) for b in bledy]
    wys = p["marginesMm"] * 2 + p["wierszMm"] * (len(linie) + 1)
    teksty_svg = "".join(
        f'<text x="{p["marginesMm"]}" y="{p["marginesMm"] + p["wierszMm"] * (i + 1)}" font-size="{p["czcionkaMm"]}">{html.escape(l)}</text>'
        for i, l in enumerate([t["naglowekBledow"]] + linie))
    return (f'<?xml version="1.0" encoding="utf-8"?><svg xmlns="http://www.w3.org/2000/svg" width="{p["szerokoscMm"]}mm" height="{wys}mm" '
            f'viewBox="0 0 {p["szerokoscMm"]} {wys}" fill="{p["kolor"]}" font-family="sans-serif">{teksty_svg}</svg>').encode("utf-8")


# ---------- obsługa żądania ----------

def zbierz(aplikacja, environ):
    stan = {}

    def start_response(status, naglowki, exc_info=None):
        stan["status"], stan["naglowki"] = status, list(naglowki)

    tresc = b"".join(aplikacja(environ, start_response))
    return stan["status"], stan["naglowki"], tresc


def odpowiedz(start_response, status, naglowki, tresc: bytes):
    naglowki = [(n, w) for n, w in naglowki if n.lower() != "content-length"] + [("Content-Length", str(len(tresc)))]
    start_response(status, naglowki)
    return [tresc]


def serwuj_nasze_statyczne(environ, start_response):
    nazwa = environ["PATH_INFO"][len(PREFIKS_STATYCZNY):]
    plik = KATALOG_STATYCZNY / nazwa
    if not re.fullmatch(r"[a-z0-9_-]+\.(css|js|svg)", nazwa) or not plik.is_file():
        return odpowiedz(start_response, "404 Not Found", [("Content-type", "text/plain")], b"Not found")
    typ = {"css": "text/css", "js": "text/javascript", "svg": "image/svg+xml"}[nazwa.rsplit(".", 1)[1]]
    return odpowiedz(start_response, "200 OK", [("Content-type", typ + "; charset=utf-8")], plik.read_bytes())


def application(environ, start_response):
    sciezka = environ.get("PATH_INFO", "")
    if sciezka.startswith(PREFIKS_STATYCZNY):
        return serwuj_nasze_statyczne(environ, start_response)
    if sciezka.startswith("/static/") or sciezka == "/favicon.ico":
        return serwer.serve(environ, start_response)

    k = konfiguracja.dane()
    environ = dict(environ)
    args = argumenty_zapytania(environ.get("QUERY_STRING", ""))
    if wartosc(args, "language") is None:
        environ["HTTP_ACCEPT_LANGUAGE"] = k["jezykDomyslny"]
    lang = serwer.getLanguage(list(args), environ.get("HTTP_ACCEPT_LANGUAGE", ""))
    _ = lang.gettext
    jezyk = lang.info().get("language") or k["jezykDomyslny"]
    t = teksty(k, jezyk)

    nazwa = sciezka[1:]
    box_cls = serwer.boxes.get(nazwa)
    bledy: list[str] = []
    if box_cls is not None:
        box = box_cls()
        dostepne = akcje_wzoru(box)
        uzupelnienia = [f"{n}={w}" for n, w in k["wartosciDomyslne"].items()
                        if n in dostepne and wartosc(args, n) is None]
        if uzupelnienia:
            environ["QUERY_STRING"] = "&".join(filter(None, [environ.get("QUERY_STRING", "")] + [quote(u, safe="=") for u in uzupelnienia]))
            args = argumenty_zapytania(environ["QUERY_STRING"])
        render = wartosc(args, "render") or "0"
        if render != "0":
            wlasciwe = [a for a in args if a and not a.startswith(("render=", "language="))]
            bledy = sprawdz(box, wlasciwe, k, t, _)
            if bledy and render == "4":
                return odpowiedz(start_response, "200 OK", [("Content-type", "image/svg+xml; charset=utf-8")], svg_bledu(t, bledy, k))

    if bledy:
        # formularz z wpisanymi wartościami i komunikatem zamiast strony błędu
        environ["QUERY_STRING"] = "&".join(a for a in environ.get("QUERY_STRING", "").split("&") if not a.startswith("render="))
        status, naglowki, tresc = zbierz(serwer.serve, environ)
        status = "422 Unprocessable Entity"
    else:
        status, naglowki, tresc = zbierz(serwer.serve, environ)
        if box_cls is not None and (status.startswith("500") or b'<meta name="robots" content="noindex">' in tresc[:2000] and b"<form" not in tresc):
            komunikaty = [html.unescape(m) for m in re.findall(r"<p>(.*?)</p>", tresc.decode("utf-8", "replace"), flags=re.S)]
            bledy = [wypelnij(t["bladOgolny"], opis=" ".join(komunikaty).strip())]
            environ["QUERY_STRING"] = "&".join(a for a in environ.get("QUERY_STRING", "").split("&") if not a.startswith("render="))
            status, naglowki, tresc = zbierz(serwer.serve, environ)
            status = "422 Unprocessable Entity"
            if (wartosc(args, "render") or "0") == "4":
                return odpowiedz(start_response, "200 OK", [("Content-type", "image/svg+xml; charset=utf-8")], svg_bledu(t, bledy, k))

    typ = dict((n.lower(), w) for n, w in naglowki).get("content-type", "")
    if typ.startswith("text/html"):
        tresc = przetworz_html(tresc.decode("utf-8"), k, t, _, jezyk, bledy).encode("utf-8")
    return odpowiedz(start_response, status, naglowki, tresc)
