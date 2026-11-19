# Obraz serwisu boxes.dev.sorto.ai.
# Warstwa "oryginal" = niezmieniony Boxes.py, zbudowany tak jak w scripts/Dockerfile oryginału,
#   ale z kodu tego repozytorium (oryginalny Dockerfile pobiera kod z github.com/florianfesti/boxes).
#   Katalog sorto/ jest z tej warstwy wyłączony.
# Warstwa "sorto" = tylko nasze pliki z katalogu sorto/ (serwer-nakładka, tłumaczenie PL, style).
# Budowanie z katalogu głównego repo:  docker compose -f sorto/docker-compose.yml up -d --build

FROM python:3.13-slim AS budowa
WORKDIR /app
# gettext (msgfmt): setup.py kompiluje tłumaczenia po/*.po do locale/ tylko, gdy msgfmt jest dostępny
RUN apt-get update && apt-get install -y --no-install-recommends gettext && apt-get clean && rm -rf /var/lib/apt/lists/*
RUN python3 -m venv env && /app/env/bin/pip install --no-cache-dir gunicorn
COPY . /app
RUN rm -rf /app/sorto && /app/env/bin/pip install --no-cache-dir . && cp scripts/boxesserver scripts/boxesserver.py

FROM python:3.13-slim AS oryginal
# pstoedit: DXF/G-code/PLT, ghostscript (ps2pdf): PDF — oba wywołuje boxes/formats.py
RUN apt-get update && apt-get install -y --no-install-recommends pstoedit ghostscript && apt-get clean && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=budowa /app /app
ENV STATIC_URL=/static
CMD ["/app/env/bin/gunicorn", "-b", "[::]:8000", "-w", "4", "scripts.boxesserver"]

# --- nasza warstwa ---

FROM python:3.13-slim AS tlumaczenie
RUN apt-get update && apt-get install -y --no-install-recommends gettext && apt-get clean && rm -rf /var/lib/apt/lists/*
COPY sorto/po/ /po/
RUN for po in /po/*.po; do j=$(basename "$po" .po); mkdir -p "/locale/$j/LC_MESSAGES" && msgfmt -c "$po" -o "/locale/$j/LC_MESSAGES/boxes.py.mo"; done

FROM oryginal AS sorto
COPY --from=tlumaczenie /locale/ /app/locale/
COPY sorto/serwer.py /app/sorto/serwer.py
COPY sorto/static/ /app/sorto/static/
ENV KONFIGURACJA=/konfiguracja/boxes.json
HEALTHCHECK --interval=30s --timeout=5s --retries=3 --start-period=60s --start-interval=2s CMD ["/app/env/bin/python", "-c", "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8000/static/sorto/sorto.css')"]
CMD ["/app/env/bin/gunicorn", "-b", "[::]:8000", "-w", "4", "sorto.serwer:application"]
