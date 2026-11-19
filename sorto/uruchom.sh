#!/bin/sh
# Buduje i uruchamia serwis. Adres (domenę) dla Traefika bierze z jedynego pliku konfiguracyjnego.
set -e
KATALOG=$(cd "$(dirname "$0")" && pwd)
ADRES_SERWISU=$(python3 -c 'import json,sys; print(json.load(open(sys.argv[1]))["adresSerwisu"])' "$KATALOG/konfiguracja/boxes.json")
export ADRES_SERWISU
cd "$KATALOG/.."
docker compose -f sorto/docker-compose.yml up -d --build "$@"
