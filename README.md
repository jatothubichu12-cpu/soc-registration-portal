# SOC Academy — Student Registration Portal

A static, front-end-only demo of a Cyber Security SOC (Security Operations Center) student registration portal, built for educational and training-simulation purposes. Pure HTML5, CSS3, and vanilla JavaScript — no build step, no backend, deployable directly on GitHub Pages.

## Live features

- **Home page** — hero with an animated "live SOC feed" console, six training tracks (SOC Analyst, Threat Hunting, Incident Response, Digital Forensics, Malware Analysis, SIEM Monitoring), an About section, and a footer.
- **Registration page** — a full, validated multi-section form covering identity, academic, contact, training-preference, and free-text fields, with inline validation and a success confirmation screen.
- **Admin login** — a simple demo-credential gate (see below) protecting the dashboard.
- **Admin dashboard** — live stats (total / today's / batch count / department count), search, filters (batch, department, domain), a sortable data table, view/edit/delete actions, and CSV export.
- **Data storage** — everything is stored in the browser's `localStorage`, so the "database" lives entirely on the visitor's device. No server, no network calls, no real student data is ever transmitted anywhere.
- **404 page**, toast notifications, animated counters, a page loader, and a fully responsive layout (desktop / tablet / mobile).

## Demo admin credentials

```
Username: Bittu
Password: B@chu
```

These are intentionally shown on the login screen itself — this is a demo/training project, not a production authentication system. Do not reuse this pattern (or these credentials) for anything handling real user data.

## Project structure

```
/
├── index.html          Home page
├── register.html        Registration form
├── admin.html           Admin login (demo credentials)
├── dashboard.html        Admin dashboard
├── 404.html             Custom not-found page
├── css/
│   ├── style.css         Shared design system (tokens, nav, hero, cards, footer)
│   ├── register.css      Registration form styling
│   └── admin.css         Dashboard styling
├── js/
│   ├── app.js            Shared utilities: loader, toasts, counters, live feed, LocalStorage data layer
│   ├── register.js       Form validation + submission
│   ├── admin.js          Login gate + session handling
│   └── dashboard.js      Stats, search/filter, table, modals, CSV export
└── README.md
```

## Running locally

No build tools required. Either:

1. Open `index.html` directly in a browser, or
2. Serve the folder with any static server, e.g.:
   ```bash
   npx serve .
   # or
   python3 -m http.server 8080
   ```

## Deploying to GitHub Pages

1. Push this folder to a GitHub repository.
2. In the repository settings, go to **Pages**.
3. Under **Source**, choose the branch (e.g. `main`) and root folder (`/`).
4. Save — GitHub will publish the site at `https://<username>.github.io/<repo>/`.

No environment variables, API keys, or backend services are needed.

## Data & privacy notes

- All registration data is stored only in the visiting browser's `localStorage`. Clearing browser data, using a different browser, or a different device will not show the same records — this is expected for a static-hosting demo and is **not** a substitute for a real database.
- The admin dashboard reads directly from the same `localStorage` bucket in the same browser, which is why the demo instructs testers to register and view the dashboard in the same browser session.
- This project is intended purely as an educational/demo template. Replace the LocalStorage layer with a real backend and proper authentication before using it for any actual student enrollment.

## Customization ideas

- Swap the demo admin credential check in `js/admin.js` for a real authentication flow.
- Point `SOCData` in `js/app.js` at a REST API or database instead of `localStorage`.
- Adjust the color tokens at the top of `css/style.css` to re-theme the whole site.
