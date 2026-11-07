# PlaceTrack: Campus Placement Application Tracker

A full-stack **MERN** web application built for **Full Stack Development II (24BET_TPP-603), Experiment 10: Lab-Based Mini Project**.

The university placement cell publishes job opportunities. Students browse and search them, apply, and track each application's status. Administrators manage jobs and move applications through the pipeline (`applied → shortlisted → interview → selected / rejected`).

**Business rule:** a student cannot apply twice to the same job. This is enforced in three layers:

1. **MongoDB**: a compound unique index on `{ student, job }` in the `Application` model, so even simultaneous requests can't create a duplicate.
2. **Express**: the `POST /api/applications` route checks first and returns `409 Conflict` with a clear message.
3. **React**: after applying, the job page shows the application status instead of the apply form, and job cards show an "Applied" badge.

Extra rules: jobs past their deadline or marked closed reject applications, and jobs can set a minimum CGPA and eligible branches.

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18 (functional components and hooks), React Router 6, Vite, plain CSS (responsive, light and dark) |
| Backend | Node.js, Express 4 REST API |
| Database | MongoDB with Mongoose 8 (schemas, validation, refs, `.populate()`) |
| Auth | JWT (`jsonwebtoken`) and password hashing with bcrypt (`bcryptjs`) |

## Collections (Mongoose models)

| Model | Key fields | Relations |
|---|---|---|
| `User` | name, email (unique), password (bcrypt-hashed, `select:false`), role `student`/`admin`, rollNo, branch, cgpa | |
| `Job` | company, title, description, type, ctc, location, minCgpa, eligibleBranches, deadline, status | `postedBy → User` |
| `Application` | status, coverNote, resumeLink, adminRemark | `student → User`, `job → Job`, unique `{student, job}` |

## REST API

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| POST | `/api/auth/register` | public | Register (student, or admin with `ADMIN_CODE`) |
| POST | `/api/auth/login` | public | Log in and receive a JWT |
| GET | `/api/auth/me` | logged in | Current user (protected route) |
| PUT | `/api/auth/me` | logged in | Update profile / password |
| GET | `/api/jobs?search=&type=&status=` | public | List and search jobs (includes applicant count) |
| GET | `/api/jobs/:id` | public | Job details |
| POST | `/api/jobs` | admin | Create a job |
| PUT | `/api/jobs/:id` | admin | Update a job |
| DELETE | `/api/jobs/:id` | admin | Delete a job and its applications |
| POST | `/api/applications` | student | Apply (duplicate → **409**) |
| GET | `/api/applications/me` | student | My applications (populated with job) |
| GET | `/api/applications?job=&status=` | admin | All applications (populated with student and job) |
| GET | `/api/applications/stats` | admin | Dashboard counts |
| GET | `/api/applications/:id` | owner / admin | One application |
| PUT | `/api/applications/:id` | owner / admin | Admin: status and remark. Student: edit while `applied` |
| DELETE | `/api/applications/:id` | owner / admin | Withdraw (student, only while `applied`) |

## Frontend pages (React Router)

| Route | Page | Access |
|---|---|---|
| `/` | Home: hero, live stats, jobs closing soon | public |
| `/jobs` | Job list with search, type and status filters (cards) | public |
| `/jobs/:id` | Job details and apply form / application status | public (apply needs login) |
| `/login`, `/register` | Auth forms with validation | public |
| `/my-applications` | Application table, status filter pills, withdraw | student |
| `/profile` | Edit profile, CGPA, password | logged in |
| `/admin` | Dashboard: stats, create/edit/delete jobs | admin |
| `/admin/applications` | All applicants, search and filter, change status, add remark | admin |

---

## How each lab experiment is covered

| Exp | Concept | Where in this project |
|---|---|---|
| 1 | Reusable components, JSX, dynamic rendering | `client/src/components/`: `JobCard`, `StatusBadge`, `StatCard`, `Alert`, `Loader`, `EmptyState`, `JobForm`; lists rendered with `.map()` |
| 2 | `useState` for forms, `useEffect` for fetching | Every form (`Login`, `Register`, `JobForm`, `Profile`, apply form) is controlled with `useState`; pages fetch with `useEffect` |
| 3 | Pages with navigation | `App.jsx` routes, `NavLink` navbar, `useParams` (`/jobs/:id`), `useSearchParams` (filters in the URL), `useNavigate` redirects |
| 4 | Forms, tables/cards, search, conditional rendering | Job cards grid, admin tables, live search, status pills; role-based navbar and apply panel |
| 5 | Node.js backend | `server/src/server.js`, `app.js`, env config, seed script |
| 6 | Express REST API (GET/POST/PUT/DELETE) | `server/src/routes/*.js`: full CRUD on jobs and applications, central error handler |
| 7 | Registration, login, protected route (JWT + bcrypt) | `models/User.js` (bcrypt pre-save hook), `routes/auth.js` (JWT), `middleware/auth.js` (`protect`, `authorize`); `ProtectedRoute.jsx` in React |
| 8 | Related collections, validation, `.populate()` | 3 related models with required/min/max/enum/regex validators; `.populate('student')` / `.populate('job')`; unique compound index |
| 9 | Frontend ↔ backend integration | `client/src/api/client.js` (`fetch` + JWT header); UI state updates after every create/update/delete without reloading |

---

## Running locally

**Requirements:** Node.js 18 or newer. MongoDB is optional (see option B).

```bash
npm run install:all
```

### Option A: with a real MongoDB (local or Atlas)

1. Copy `server/.env.example` to `server/.env`, then set `MONGO_URI` and a long random `JWT_SECRET`.
2. Load the demo data, then start both servers in two terminals:

```bash
npm run seed
```
```bash
npm run server
```
```bash
npm run client
```

### Option B: no MongoDB installed (in-memory database)

```bash
npm run server:memory
```
```bash
npm run client
```

This starts a temporary MongoDB in memory and seeds it automatically. The first run downloads a MongoDB binary, and data resets each time it restarts.

Open **http://localhost:5173**.

### Demo accounts (created by the seed)

| Role | Email | Password |
|---|---|---|
| Admin (placement cell) | admin@cu.edu | admin123 |
| Student (CSE, 8.6) | aarav@cu.edu | student123 |
| Student (ECE, 7.4) | diya@cu.edu | student123 |
| Student (ME, 6.8) | kabir@cu.edu | student123 |

New admin accounts can be registered with the "Placement cell" tab and the `ADMIN_CODE` from `.env`.

## Demonstration script

1. Log in as **admin** and publish a new job, for example "Google, APM, min CGPA 7.5, CSE only".
2. Log out and log in as **aarav** (CSE, 8.6). Search "google", open the job and apply. The applicant count increases.
3. Try to apply again (or send the request twice). The API rejects it with **409 "You have already applied to this job"**.
4. Log in as **kabir** (ME, 6.8) and open the same job. Applying fails the CGPA/branch eligibility check.
5. Back as **admin**, open Applications, filter by the job and change aarav's status to *shortlisted*.
6. As **aarav**, open My Applications. The status is now *shortlisted*, and Withdraw is no longer offered.

**Data flow:** React (student clicks *Apply now*) → `fetch POST /api/applications` with JWT → Express `protect` + `authorize('student')` → deadline, eligibility and duplicate checks → Mongoose validates and saves (unique index) → JSON response → React updates the panel to show *Applied*.

## Deploying (live URL)

The Express server also serves the built React app, so one web service is enough:

1. Create a free **MongoDB Atlas** cluster, then copy its connection string.
2. On **Render** (or Railway), create a Web Service from this GitHub repo:
   - Build command: `npm run build`
   - Start command: `npm start`
   - Environment variables: `MONGO_URI`, `JWT_SECRET`, `ADMIN_CODE`, and `NODE_VERSION=20` or newer
3. Seed the cloud database once from your machine by setting `MONGO_URI` in `server/.env` to the Atlas string and running `npm run seed`.

## Project structure

```
fsd/
├── server/
│   └── src/
│       ├── server.js         # entry: env, DB connection, listen
│       ├── app.js            # express app, routes, static client
│       ├── config/db.js
│       ├── models/           # User, Job, Application
│       ├── middleware/       # auth (protect/authorize), error handler
│       ├── routes/           # auth, jobs, applications
│       ├── seedData.js       # demo data
│       ├── seed.js           # npm run seed
│       └── devMemory.js      # npm run dev:memory
└── client/
    └── src/
        ├── api/client.js     # fetch wrapper with JWT
        ├── context/AuthContext.jsx
        ├── components/       # Navbar, JobCard, JobForm, ProtectedRoute, ...
        ├── pages/            # Home, Jobs, JobDetail, MyApplications, Admin*, ...
        └── utils/format.js
```
