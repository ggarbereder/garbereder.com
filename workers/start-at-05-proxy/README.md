# start-at-05 reverse proxy (Cloudflare Worker)

This Worker serves **www.garbereder.com/start-at-05/** at **start-at-05.com** and **www.start-at-05.com** (reverse proxy with HTML/header rewriting).

## Deploy

### 1. Prerequisites

- [Wrangler](https://developers.cloudflare.com/workers/wrangler/install-and-update/) installed: `npm install -g wrangler` or `npx wrangler`
- Cloudflare account; you will attach the custom domain to this Worker

### 2. Deploy the Worker

From the repo root:

```bash
cd workers/start-at-05-proxy
npx wrangler deploy
```

Or from repo root without `cd`:

```bash
npx wrangler deploy --config workers/start-at-05-proxy/wrangler.toml
```

Log in with `npx wrangler login` if needed.

### 3. Attach custom domains (start-at-05.com and www)

**Option A – Custom domain in the same Cloudflare account**

1. Add the zone **start-at-05.com** in Cloudflare (Dashboard → Add site). Add the domain and follow DNS setup (nameservers or CNAME).
2. In **Workers & Pages** → your worker **start-at-05-proxy** → **Settings** → **Domains and routes**:
   - Add **Custom Domain**: `start-at-05.com`
   - Add **Custom Domain**: `www.start-at-05.com`

**Option B – Custom domain on another provider**

1. Create a **Worker Custom Domain** in Cloudflare for the Worker (Workers & Pages → start-at-05-proxy → Settings → Domains):
   - Add `start-at-05.com` and `www.start-at-05.com`.
2. In your DNS provider for **start-at-05.com**:
   - For the apex (`start-at-05.com`): CNAME to the hostname Cloudflare shows for the Worker (e.g. `start-at-05-proxy.<your-subdomain>.workers.dev`) or use Cloudflare’s CNAME flattening if the domain is on Cloudflare.
   - For **www**: CNAME `www` to the same Worker hostname or to `start-at-05.com`.

Cloudflare’s “Add Custom Domain” flow will tell you exactly which CNAME target to use for the Worker.

### 4. DNS summary

- **start-at-05.com** → CNAME (or A/AAAA if Cloudflare gives you an IP) to the Worker’s target.
- **www.start-at-05.com** → CNAME to the same Worker target (or to `start-at-05.com` if you use a single zone).

After DNS propagates, **https://start-at-05.com** and **https://www.start-at-05.com** will serve the same content as **https://www.garbereder.com/start-at-05/**.

## Local testing

```bash
cd workers/start-at-05-proxy
npx wrangler dev
```

Then open the URL Wrangler prints (e.g. `http://localhost:8787`) and optionally use a Host header or a tunnel to simulate the custom host.

## Behavior

- Requests to **start-at-05.com** or **www.start-at-05.com** are proxied to **www.garbereder.com**:
  - `/` → `/start-at-05/`
  - `/_astro/*`, `/img/*`, favicon, etc. → same path on origin (site-wide assets).
  - Other paths → `/start-at-05/<path>` on origin.
- HTML and `Location` headers are rewritten so links and redirects use the custom domain instead of garbereder.com/start-at-05.
