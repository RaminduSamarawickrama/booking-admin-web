# booking-admin-web

Operations dashboard for the airport transfer booking platform. React 19 + TypeScript + Vite, deployed on Vercel (Hobby).

## Run locally

```sh
cp .env.example .env    # optional: point at a backend
npm install
npm run dev             # http://localhost:5174
```

The backend comes from the gateway in [booking-engine](https://github.com/RaminduSamarawickrama/booking-engine) (`docker compose up`). The panel on the page shows which backend this build talks to and lets you switch it (localhost, LAN IP, Cloudflare tunnel) without rebuilding. A `?api=` link is only applied after you confirm it.

| Variable | Purpose |
| --- | --- |
| `VITE_API_BASE_URL` | Backend the build talks to by default |
| `VITE_WEBSOCKET_URL` | Optional; derived from the API URL when empty |
| `VITE_ALLOW_API_OVERRIDE` | `false` hides the backend switcher |

`VITE_` values end up in the public bundle: never put secrets in them.

## Deploy

Every push to `main` deploys to production on Vercel; every pull request gets a preview URL. Settings live in `vercel.json`.

UI work follows `.claude/skills/frontend-design/SKILL.md`.

Enable the secret-blocking pre-commit hook once per clone: `git config core.hooksPath .githooks`

Part of the airport transfer booking platform:

| Repo | What it is |
| --- | --- |
| [booking-engine](https://github.com/RaminduSamarawickrama/booking-engine) | Spring Boot services, Docker Compose, infrastructure and planning docs |
| [booking-shared](https://github.com/RaminduSamarawickrama/booking-shared) | TypeScript shared by every client: backend switching, shared UI |
| [booking-customer-web](https://github.com/RaminduSamarawickrama/booking-customer-web) | Customer website (Vercel) |
| [booking-admin-web](https://github.com/RaminduSamarawickrama/booking-admin-web) | Operations dashboard (Vercel) |
| [booking-customer-mobile](https://github.com/RaminduSamarawickrama/booking-customer-mobile) | Customer app (Expo) |
| [booking-driver-mobile](https://github.com/RaminduSamarawickrama/booking-driver-mobile) | Driver app (Expo) |
