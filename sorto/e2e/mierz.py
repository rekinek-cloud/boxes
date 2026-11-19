#!/usr/bin/env python3
"""Pomiar pobranych plików (SVG, DXF, PDF) dla testów przypadków użycia.

Użycie: mierz.py PLIK [PLIK ...]   -> JSON na standardowe wyjście, jeden obiekt na plik.

SVG (Boxes.py): każda część to osobna grupa <g id="p-N">. Dla każdej części: obrys (szer./wys.),
liczba konturów, głębokość wczepów (najmniejszy niezerowy uskok obrysu od krawędzi ramki) oraz napisy.
DXF: ramka całego rysunku (ezdxf). PDF: ramka wszystkich rysowanych ścieżek (PyMuPDF), w mm.
"""
import json
import sys
import xml.etree.ElementTree as ET

NS = "{http://www.w3.org/2000/svg}"
PT_NA_MM = 25.4 / 72


def zaokr(x, n=3):
    return round(float(x), n)


def svg(sciezka):
    from svgpathtools import Line, parse_path
    drzewo = ET.parse(sciezka)
    korzen = drzewo.getroot()
    czesci = []
    for g in korzen.iter(NS + "g"):
        gid = g.get("id") or ""
        if not gid.startswith("p-"):
            continue
        x0 = y0 = float("inf")
        x1 = y1 = float("-inf")
        kontury = 0
        pionowe, poziome, odcinki = [], [], []
        for p in g.iter(NS + "path"):
            d = p.get("d")
            if not d:
                continue
            sc = parse_path(d)
            for sub in sc.continuous_subpaths():
                kontury += 1
            a, b, c, e = sc.bbox()
            x0, x1, y0, y1 = min(x0, a), max(x1, b), min(y0, c), max(y1, e)
            for seg in sc:
                if isinstance(seg, Line):
                    if abs(seg.start.real - seg.end.real) < 1e-6 and abs(seg.start.imag - seg.end.imag) > 1e-6:
                        pionowe.append(seg.start.real)
                        odcinki.append((seg.start.real, min(seg.start.imag, seg.end.imag), abs(seg.start.imag - seg.end.imag)))
                    if abs(seg.start.imag - seg.end.imag) < 1e-6 and abs(seg.start.real - seg.end.real) > 1e-6:
                        poziome.append(seg.start.imag)
        napisy = ["".join(t.itertext()).strip() for t in g.iter(NS + "text")]
        if x0 == float("inf"):
            continue
        # uskoki od lewej krawędzi ramki i od górnej: odległości linii pionowych/poziomych od krawędzi
        def uskoki(wsp, brzeg):
            return sorted({zaokr(abs(w - brzeg), 2) for w in wsp if 0.01 < abs(w - brzeg) < 20})
        czesci.append({
            "id": gid,
            "szer": zaokr(x1 - x0), "wys": zaokr(y1 - y0),
            "x0": zaokr(x0), "y0": zaokr(y0),
            "kontury": kontury,
            "uskokiLewo": uskoki(pionowe, x0)[:4],
            "uskokiGora": uskoki(poziome, y0)[:4],
            "uskokiPrawo": uskoki(pionowe, x1)[:4],
            "uskokiDol": uskoki(poziome, y1)[:4],
            "napisy": [n for n in napisy if n],
            # prostokąt kontrolny Boxes.py (podpis „100.0mm, burn:0.10mm”) — to nie jest część pudełka
            "odniesienie": any("mm, burn:" in n for n in napisy),
            # szczeliny: pionowe odcinki wewnątrz części (nie na lewej/prawej krawędzi), dłuższe niż 1/4 wysokości,
            # zaczynające się przy górnej lub dolnej krawędzi — np. wycięcia na krzyżowanie przegród
            "szczeliny": sorted({(zaokr(x - x0, 1), "gora" if abs(y - y0) < 5 else "dol" if abs(y + dl - y1) < 5 else "srodek", zaokr(dl, 1))
                                 for x, y, dl in odcinki
                                 if dl > (y1 - y0) / 4 and x - x0 > 5 and x1 - x > 5}),
        })
    xs0 = min((c["x0"] for c in czesci), default=0)
    ys0 = min((c["y0"] for c in czesci), default=0)
    xs1 = max((c["x0"] + c["szer"] for c in czesci), default=0)
    ys1 = max((c["y0"] + c["wys"] for c in czesci), default=0)
    return {"format": "svg", "szerokoscDokumentu": korzen.get("width"), "wysokoscDokumentu": korzen.get("height"),
            "czesci": czesci, "ramka": {"szer": zaokr(xs1 - xs0), "wys": zaokr(ys1 - ys0)}}


def dxf(sciezka):
    import ezdxf
    from ezdxf import bbox
    doc = ezdxf.readfile(sciezka)
    msp = doc.modelspace()
    r = bbox.extents(msp)
    rodzaje = {}
    for e in msp:
        rodzaje[e.dxftype()] = rodzaje.get(e.dxftype(), 0) + 1
    jednostka = doc.header.get("$INSUNITS", 0)
    return {"format": "dxf", "ramka": {"szer": zaokr(r.size.x), "wys": zaokr(r.size.y)}, "elementy": rodzaje, "jednostkiINSUNITS": jednostka}


def pdf(sciezka):
    import fitz
    d = fitz.open(sciezka)
    strona = d[0]
    prost = None
    for rys in strona.get_drawings():
        prost = rys["rect"] if prost is None else prost | rys["rect"]
    return {"format": "pdf", "strony": d.page_count,
            "strona": {"szer": zaokr(strona.rect.width * PT_NA_MM), "wys": zaokr(strona.rect.height * PT_NA_MM)},
            "ramka": {"szer": zaokr(prost.width * PT_NA_MM), "wys": zaokr(prost.height * PT_NA_MM)} if prost else None}


def mierz(sciezka):
    with open(sciezka, "rb") as f:
        poczatek = f.read(512)
    if poczatek.startswith(b"%PDF"):
        return pdf(sciezka)
    if b"<svg" in poczatek or b"<?xml" in poczatek:
        return svg(sciezka)
    return dxf(sciezka)


if __name__ == "__main__":
    print(json.dumps([dict(plik=p, **mierz(p)) for p in sys.argv[1:]], ensure_ascii=False))
