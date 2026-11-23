# Bird Labs website

The marketing site for [birdlabs.net](https://birdlabs.net), with Birdie (the AI chatbot) and a private admin dashboard built into a single Node.js app.

| URL | What it is |
|---|---|
| `/` | Public website (React + Tailwind) |
| `/chat` | Birdie, the AI chatbot. Opens in the floating chat window on the site |
| `/admin` | Admin dashboard: visitor analytics, leads, client support requests and client accounts |
| `/careers` | Careers page: open roles and job applications with résumé upload |
| `/portal` | Client portal: customers sign in to send support requests and see their monthly support hours |

The Express server in `server.js` serves the built site and these APIs:

- `POST /api/leads` — contact form and free-review requests
- `POST /api/chat`, `GET /api/chat/config` — Birdie (OpenAI, streaming)
- `POST /api/track` — cookie-free page-view and click analytics
- `/api/admin/*` — password-protected dashboard data, lead list, CSV export, customers and requests
- `/api/portal/*` — client sign-in, support requests and replies
- `/api/careers/*` — open roles and job applications

## Where leads go

Every lead is saved to the database and shows up in **/admin → Leads**. Copies also go to Pushover and Google Sheets when those are configured. If a destination fails, the lead is still kept as long as one of them worked. If all of them fail, the full lead is printed to the server log.

## Client portal

1. In **/admin → Customers**, click **Add customer**. Choose their plan; support hours fill in automatically (Starter 2 h, Growth 3 h, Pro 4 h) and can be changed.
2. A password is generated. Copy the ready-made message and send it to the customer. The password is only shown once, but you can always issue a new one.
3. Customers sign in at `/portal` (the **Client login** button on the site), send requests and reply to you.
4. In **/admin → Requests**, reply to them, change the status and **log time**. Logged time counts toward their monthly hours, which reset on the 1st.

You get a Pushover alert for every new request and customer reply. Customers get an email when you reply, if `RESEND_API_KEY` is set.

## Careers

- `/careers` lists the roles that are open in **/admin → Careers → Jobs**. Each role has its own page with its own application form at `/careers/<id>-<title>` (for example `/careers/2-web-ai-developer`), which you can share on LinkedIn or job boards. Role pages include JobPosting data so they can appear in Google's job search.
- Applicants can attach a résumé (PDF or Word, up to 5 MB) and/or a LinkedIn or portfolio link. Résumés are stored in the database so redeploys don't remove them. On Hostinger's MySQL, `max_allowed_packet` must be at least 8 MB, which is the default.
- New applications appear in **/admin → Careers → Applications** and trigger a Pushover alert. The applicant gets a confirmation email if Resend is set up.
- Two starter postings (Business Development Representative in Niagara Falls, and Web & AI Developer remote in India) are added the first time the app runs. Edit or close them in the admin; they won't be re-added. The text is in `server/seed.js`.

## Deploying on Hostinger (GitHub)

1. In hPanel, create a **MySQL database** (Databases → MySQL) and note its host, name, user and password.
2. Create or open the **Node.js web app** connected to this GitHub repo.
   - Build command: `npm run build`
   - Start command: `node server.js` (or `npm start`, which builds first)
   - Node version: 20 or newer
3. Add the environment variables from `.env.example`. At minimum set `ADMIN_PASSWORD`, `SESSION_SECRET`, `DB_*` and `OPENAI_API_KEY`.
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
