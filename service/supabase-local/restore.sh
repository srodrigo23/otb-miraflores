#!/bin/bash
set -euo pipefail

echo ">>> Restaurando backup de Supabase..."

psql -v ON_ERROR_STOP=1 \
  --username "${POSTGRES_USER:-supabase_admin}" \
  --dbname postgres \
  --single-transaction \
  -c 'SET session_replication_role = replica' \
  -f /backup/schema.sql \
  -f /backup/data.sql

echo ">>> Backup restaurado."