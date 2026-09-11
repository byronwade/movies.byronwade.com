#!/bin/sh
cd /workspace || exit 1

# Byron's Neon — accounts + taste persist here (sandbox). Deploy injects its own.
export DATABASE_URL='postgresql://neondb_owner:npg_I81bCNcDVlGa@ep-proud-resonance-au9tos7l-pooler.c-10.us-east-1.aws.neon.tech/neondb?sslmode=require'
export DATABASE_URL_UNPOOLED='postgresql://neondb_owner:npg_I81bCNcDVlGa@ep-proud-resonance-au9tos7l.c-10.us-east-1.aws.neon.tech/neondb?sslmode=require'
export BETTER_AUTH_SECRET='829307ea8a4025a2bf012f5aa8df2744336c8186819ea3950a40f98abc055d92'

if ! node scripts/migrate.mjs > /tmp/kino-migrate.log 2>&1; then
  echo "[startup] neon migrate failed" >> /tmp/kino-dev.log
  cat /tmp/kino-migrate.log >> /tmp/kino-dev.log
fi

if curl -sf -o /dev/null --max-time 2 http://127.0.0.1:8080/; then
  exit 0
fi
npm run dev > /tmp/kino-dev.log 2>&1 &
i=0
while [ "$i" -lt 40 ]; do
  if curl -sf -o /dev/null --max-time 2 http://127.0.0.1:8080/; then
    exit 0
  fi
  i=$((i + 1))
  sleep 0.5
done
exit 0
