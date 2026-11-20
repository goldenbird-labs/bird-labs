# Bird Labs website

The marketing site for [birdlabs.net](https://birdlabs.net), with Birdie (the AI chatbot) and a private admin dashboard built into a single Node.js app.

| URL | What it is |
|---|---|
| `/` | Public website (React + Tailwind) |
| `/chat` | Birdie, the AI chatbot. Opens in the floating chat window on the site |
| `/admin` | Admin dashboard: visitor analytics and every lead from the form, chatbot and free-review requests |

The Express server in `server.js` serves the built site and these APIs:

- `POST /api/leads` — contact form and free-review requests
- `POST /api/chat`, `GET /api/chat/config` — Birdie (OpenAI, streaming)
- `POST /api/track` — cookie-free page-view and click analytics
- `/api/admin/*` — password-protected dashboard data, lead list, CSV export

## Where leads go

Every lead is saved to the database and shows up in **/admin → Leads**. Copies also go to Pushover and Google Sheets when those are configured. If a destination fails, the lead is still kept as long as one of them worked. If all of them fail, the full lead is printed to the server log.

## Deploying on Hostinger (GitHub)

1. In hPanel, create a **MySQL database** (Databases → MySQL) and note its host, name, user and password.
2. Create or open the **Node.js web app** connected to this GitHub repo.
   - Build command: `npm run build`
   - Start command: `node server.js` (or `npm start`, which builds first)
   - Node version: 20 or newer
3. Add the environment variables from `.env.example`. At minimum set `ADMIN_PASSWORD`, `DB_*` and `OPENAI_API_KEY`.
4. Deploy. The tables are created automatically on first start.
5. Visit `/admin` and sign in with `ADMIN_PASSWORD`.

## Editing content

- Website text: `src/components/*.jsx` (one file per section)
- Contact links (Calendly, WhatsApp, email, phone): `src/lib/site.js`
- What Birdie knows: `chatbot/knowledge-base.md`
- Birdie's name, greeting and suggested questions: `chatbot/bot-config.json`

## Local development

```bash
npm install
cp .env.example .env   # fill in what you need; ADMIN_PASSWORD is enough to try the dashboard
npm run dev:backend    # API on http://localhost:3001
npm run dev:frontend   # site on http://localhost:5173 (also /chat.html and /admin.html)
```

Without `DB_*` settings, leads and analytics are stored in `./data/*.jsonl`.

## Analytics notes

- No cookies and no third-party scripts. Each browser gets a random visitor ID in `localStorage`.
- Bots are filtered out by user agent. Your own visits aren't counted while you're signed in to `/admin`.
- Location comes from the visitor's time zone, so IP addresses are never stored for page views.
- Tag links you share with `?utm_source=instagram&utm_campaign=november` to see them under **Campaigns**.
