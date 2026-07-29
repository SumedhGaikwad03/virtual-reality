# Virtual2Reality

Real estate enquiry website — a client project, built and deployed end-to-end for a real estate firm in about a month.

**Live site:** [virtual2reality.in](https://virtual2reality.in)

---

## Overview

A real estate firm needed a way to capture and organize enquiries from website visitors without the overhead of a full CRM — something simple, reliable, and easy for non-technical staff to use immediately. This project was built and deployed end-to-end based on that client's real requirements, from initial scoping through deployment and ongoing coordination.

## What it does

- **Enquiry capture** — a simple, fast-loading enquiry form on the frontend that visitors use to submit their details and interest.
- **Excel-based record keeping** — the backend receives each submission and appends it directly to a structured Excel file, giving the client an organized, immediately usable record without needing to learn a database tool or admin panel.
- **Deployed and in production** — live and handling real client enquiries at [virtual2reality.in](https://virtual2reality.in).

## Architecture

- **Frontend** — a plain HTML/CSS/JS site. The client's own team would need to maintain and lightly update this site later without a developer on hand, so a simple, dependency-free frontend was a deliberate choice over a framework that would add long-term maintenance overhead for them.
- **Backend** — a lightweight Node.js/Express service receives form submissions and writes each one as a new row into a structured Excel file, which the client can open directly.

```
HTML/CSS/JS form ──POST──▶ Node.js/Express ──▶ Excel record file
```

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML, CSS, JavaScript |
| Backend | Node.js, Express |
| Data output | Excel (.xlsx) |

## Engineering notes

- The plain HTML/CSS/JS frontend and Excel-based backend weren't the "impressive" technical choice — they were the *right* one. The client needed something they could keep running and lightly maintain themselves after handoff, without depending on a developer for every small change. Matching the solution to the client's actual technical comfort level mattered more than showcasing a bigger stack.
- Writing directly to Excel instead of standing up a database avoided unnecessary infrastructure for a client who just needed a usable, glanceable list of enquiries — not a system to query or scale.
- Delivered end-to-end: requirements gathering, build, deployment, and client coordination, not just the code.

## Project structure

```
virtual-reality/
├── backend/     # Express server handling form submissions and Excel writes
└── frontend/    # Static HTML/CSS/JS enquiry site
```

---

Built by [Sumedh Gaikwad](https://github.com/SumedhGaikwad03) — [Portfolio](https://sumedh-portfolio-cyan.vercel.app/)
