# Thinkcap Advisors CRM — v5

A full-featured CRM built for Thinkcap Advisors. Runs entirely in the browser — upload to GitHub and deploy on Vercel in minutes.

## Features

### Modules
- **Dashboard** — pipeline stats, stage charts, top deals, overdue alerts
- **Leads** — full lead capture with stage pipeline (New → Won/Lost), list + kanban board view
- **Accounts** — company master with full details, combined activity timeline
- **Contacts** — multiple contacts per account, linked to leads
- **Reminders** — overdue / due today / upcoming / completed task views
- **Competitors** — global library with pricing, market share, strengths, weaknesses; link to any lead
- **Settings** — manage all dropdown values (sources, services, team members, etc.)

### Interlinking
- Account → shows related Contacts + Leads + combined activity timeline
- Contact → shows linked Account + associated Leads + activities
- Lead → shows linked Account + Contact + Competitors + Activities + Tasks

### Reminder pop-up
- Fires automatically on page load and every 5 minutes
- Shows all due/overdue tasks in one pop-up
- **Snooze 15 min** or **Snooze 1 hour** per task
- **Complete** button → opens modal to enter activity note + optional follow-up task
- Completed activity automatically saved to Lead, linked Account, and linked Contact
- Bell icon in header shows live count of due tasks

### Other features
- **Universal search** — live dropdown across Leads, Contacts, Accounts
- **Per-module filters** — filter by stage, priority, assigned, source
- **Field validation** — email format, Indian mobile (+91), required fields, numeric deal value
- **Live account search** on Contact form — type to search, select from dropdown
- **Create Lead** from Account or Contact screen (pre-fills fields)
- **Activity logging** on Leads, Accounts, and Contacts separately
- **Overdue badges** on lead rows and kanban cards

## Files

| File | Purpose |
|---|---|
| `index.html` | App shell, sidebar, header |
| `styles.css` | All styling |
| `app.js` | All logic — 82 functions |
| `README.md` | This file |

## Deploy to Vercel

1. Upload all 4 files to a GitHub repository
2. Go to [vercel.com](https://vercel.com) → Import Project → select your repo
3. Click **Deploy** — live at `https://your-crm.vercel.app`

## Adding your logo

1. Place `thinkcap-logo.png` in the same folder as `index.html`
2. In `index.html`, find the `.logo-placeholder` div and replace with:
```html
<img src="thinkcap-logo.png" class="logo-img" alt="Thinkcap Advisors">
```

## Next upgrades (when ready)
- **Supabase database** — persist data across sessions and users
- **Google/email login** — individual user accounts with role-based access
- **Custom domain** — `crm.thinkcapadvisors.com`
