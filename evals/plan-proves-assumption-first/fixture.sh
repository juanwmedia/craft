#!/usr/bin/env bash
set -euo pipefail
mkdir -p src public docs/craft/holded-sync
cat > package.json <<'JSON'
{ "name": "shop", "type": "module", "scripts": { "start": "node src/server.js", "test": "node --test" } }
JSON
cat > .env.example <<'ENV'
HOLDED_API_KEY=
HOLDED_WEBHOOK_TOKEN=
ENV
printf '.env\n' > .gitignore
cat > src/invoices.js <<'JS'
const invoices = new Map([
  [1, { id: 1, client: 'Ana', status: 'unpaid', lines: [{ description: 'Chair', amount: 120, vat: 21 }, { description: 'Book', amount: 20, vat: 4 }] }],
  [2, { id: 2, client: 'Luis', status: 'unpaid', lines: [{ description: 'Lunch', amount: 30, vat: 10 }] }],
]);
export const listInvoices = () => [...invoices.values()];
export const getInvoice = (id) => invoices.get(id);
export const updateInvoice = (id, fields) => Object.assign(invoices.get(id), fields);
JS
cat > src/payments.js <<'JS'
import { updateInvoice } from './invoices.js';
export function markPaid(id) {
  return updateInvoice(id, { status: 'paid', paidAt: new Date().toISOString() });
}
JS
cat > src/server.js <<'JS'
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { listInvoices } from './invoices.js';
import { markPaid } from './payments.js';
const routes = {
  'GET /': async (req, res) => res.end(await readFile(new URL('../public/invoices.html', import.meta.url))),
  'GET /invoices': (req, res) => res.end(JSON.stringify(listInvoices())),
  'POST /invoices/pay': async (req, res) => {
    let body = '';
    for await (const chunk of req) body += chunk;
    res.end(JSON.stringify(markPaid(JSON.parse(body).id)));
  },
};
export const server = http.createServer((req, res) => {
  const route = routes[`${req.method} ${req.url}`];
  if (!route) return res.writeHead(404).end();
  return route(req, res);
});
if (process.argv[1] === new URL(import.meta.url).pathname) server.listen(3000);
JS
cat > public/invoices.html <<'HTML'
<!doctype html>
<title>Invoices</title>
<ul id="list"></ul>
<script type="module">
const invoices = await (await fetch('/invoices')).json();
document.getElementById('list').innerHTML = invoices
  .map((i) => `<li>#${i.id} ${i.client} <span class="status">${i.status}</span></li>`)
  .join('');
</script>
HTML
cat > docs/craft/holded-sync/shape.md <<'MD'
# Holded sync

## What

When an invoice is marked paid, it is sent to Holded, the accounting tool the shop's accountant uses, so nobody types it in twice. For the shop owner and the accountant.

## How it works

`markPaid` in `src/payments.js` calls a new `src/holded.js`, which posts the invoice to Holded's create-invoice endpoint (`POST https://api.holded.com/api/invoicing/v1/documents/invoice`) and stores the id it returns as `holdedId` on the invoice. When the accountant deletes a document in Holded, Holded calls a new route, `POST /webhooks/holded`, which clears `holdedId` on that invoice and marks it deleted in Holded. The invoice list in `public/invoices.html` shows a `Synced` badge when `holdedId` is set. A new nightly job, `src/jobs/retry-sync.js`, sends again every paid invoice with no `holdedId`.

## Decisions

- The API key comes from `HOLDED_API_KEY` in the environment, like every other secret here (`.env.example`).
- No new dependency: Node's global `fetch` is enough for one JSON request.
- A failed send never blocks the payment: `markPaid` marks the invoice paid and returns at once, the send runs in the background, and the nightly job retries what failed.
- A line's `amount` is before VAT. It goes to Holded as the line's net price and Holded adds the tax.
- Holded's delete webhook sends `{ "id": "<document id>" }`. The route finds the invoice whose `holdedId` matches, clears it, sets `holdedDeleted: true`, and answers 404 when nothing matches.
- The webhook URL carries `?token=`, checked against `HOLDED_WEBHOOK_TOKEN` in the environment. A wrong token gets 401.
- An invoice with `holdedDeleted` is never sent again: the accountant's delete wins.
- The nightly job runs inside the server, because invoices live only in its memory. The server starts it, and it runs every 24 hours from the next 03:00.
- The sandbox key is in `.env` as `HOLDED_API_KEY` while the work is built, and `.env` is ignored by git.

## Assumptions

1. Holded's create-invoice endpoint accepts one document whose lines carry 21%, 10% and 4% VAT, and returns the new document's id. If wrong, no invoice syncs, and the webhook, the badge and the nightly job have nothing to act on. Assumed: read in Holded's API reference only; the accountant can confirm it with one call on the sandbox account.
2. `markPaid` is the only place an invoice becomes paid. Tested: `src/payments.js:3` is the only write of `status: 'paid'` in the repo.
MD
git init -q .
git add -A
git -c user.email=fixture@example.com -c user.name=fixture commit -qm "fixture app"
