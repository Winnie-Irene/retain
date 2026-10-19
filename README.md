# Retain

**A personal expense and monthly budget planner.**

Most months start the same way. We make a plan, promise ourselves that this is the month we will be disciplined, and then somewhere around the third week we open our mobile money history and wonder where everything went. A pretty budget spreadsheet helps, until you have to fill it in and do the maths yourself.

Retain is that spreadsheet grown up. It keeps the soft blush pages, the little moon and sun, and the handwritten titles I liked so much, but now it does the adding up for me. You record what you spend, set what the month can carry, and Retain tells you plainly whether you are within, approaching, or over your budget before the month gets away from you.

## Live links

| | |
| --- | --- |
| Live app | https://retain-orcin.vercel.app |
| API | https://retain-api-phig.onrender.com/api/health |
| Repository | https://github.com/Winnie-Irene/retain |

The API runs on Render's free plan, so the very first request after a quiet spell can take up to a minute while the server wakes up. After that it is quick.

### Demo accounts

These are created by the seed script.

| Role | Email | Password |
| --- | --- | --- |
| User (six months of data) | winnie@retain.app | Retain@2026 |
| Admin | admin@retain.app | Admin@2026 |

Anyone can sign up as a normal user. Nobody can sign up as an admin. Admin accounts only come from the seed script, so the keys to the house are never handed to a stranger.

## What Retain does

### For everyone who signs up

- **Expenses.** Add, view, edit and delete your own expenses. Each one has a title, amount, category, date, payment method and optional notes.
- **Search, filter and sort.** Search by title or notes, filter by one or more categories, payment methods, fixed or variable type, a date range (with quick picks for this month, last month and the last 30 days) and an amount range. Sort by date, amount or title. Results are paginated with a choice of 10, 20 or 50 rows.
- **Monthly budget.** Set or update a budget for any month. Retain shows what you have spent, what is left, the percentage used, and a status: within budget, approaching, or over. You choose when "approaching" kicks in (80% by default) in Settings. If you have not set one yet, it offers last month's amount as a starting point.
- **Dashboard.** For any month you pick: total spent, remaining budget, highest single expense, number of expenses, spending by category, how you paid, recent expenses and a pacing chart that compares what you have spent so far with a steady daily pace. Tap any category in the donut chart and Retain opens your expense list already filtered to that category and month.
- **Budget history.** A budgeted versus actual chart for the last six months, plus a month by month table.
- **Fixed and variable expenses.** Mark each expense as fixed (the same every month, like rent) or variable (food, transport). The dashboard shows the split, and the expense list can be filtered by type.
- **Goals and notes.** Each month has three small prompts on the Budget page: this month's financial goal, one thing to reduce next month, and one thing that went well. A little journal next to the numbers.
- **Savings goals.** Create goals with a target and an optional date, add money or take some out, and watch a progress ring fill up. Retain works out how much you need to put aside each month to make the date, and keeps a history of every top up. Retain keeps the record only. The money itself stays wherever you actually keep it.
- **Profile and settings.** Change your name, email and profile photo, change your password, pick your budget warning level and the page Retain opens on, or delete your account and everything in it.
- **Terms and privacy.** Plain language Terms of Use and Privacy Policy pages. New accounts have to accept them before signing up.

### For admins

- **Category management.** Create, rename, recolour and delete categories. When a category is deleted, every expense that used it moves to **Uncategorized**, a protected default category that cannot be renamed or deleted. Nobody loses their records because an admin tidied up.
- **Platform insights.** Total registered users, total number and value of expenses recorded, expenses recorded this month, total spending per category, the top 5 most used and bottom 5 least used categories, a six month trend, recently added expenses (with who added them) and recently registered users.

## Tech stack

| Layer | Tools |
| --- | --- |
| Frontend | React 19, TypeScript, Vite |
| State | React Context (authentication and categories), Redux Toolkit (expense search, filters, sorting and pagination) |
| Routing | React Router with protected and admin-only routes |
| Charts | Recharts |
| Styling | Hand-written CSS with design tokens, self-hosted Jost and Pinyon Script fonts, Lucide icons |
| Backend | Node.js, Express 5, TypeScript |
| Database | MongoDB Atlas with Mongoose |
| Auth | JSON Web Tokens, bcrypt password hashing and rate limited sign in |
| Validation | Zod on the server, inline form validation on the client |
| Hosting | Vercel (client) and Render (API) |

## How it fits together

```
retain/
  client/                 React + TypeScript + Vite
    src/
      api/                fetch wrapper and typed service functions
      context/            AuthContext and CategoriesContext
      store/              Redux store, filters slice, expenses slice, selectors
      routes/             ProtectedRoute, AdminRoute, GuestRoute
      pages/              dashboard, expenses, budget, savings, settings, admin, auth, legal
      components/         ui pieces, charts, expense, budget, savings and notes components
      styles/             tokens, layout, components and page styles
      types/              shared TypeScript types for models and API responses
  server/                 Express + TypeScript + MongoDB
    src/
      config/             environment validation, database connection, constants
      models/             User, Category, Expense, Budget, SavingsGoal, MonthlyNote
      middleware/         requireAuth, requireAdmin, error handling
      controllers/        auth, expenses, budgets, categories, dashboard, admin, profile, savings, notes
      services/           budget maths, category fallback, aggregation helpers
      validators/         Zod schemas for every request body and query
      seed/               demo data generator
```

### Authentication with React Context

`AuthContext` owns the signed in user, the auth status (`checking`, `authenticated` or `guest`) and the `signIn`, `signUp`, `signOut` and `hasRole` functions. The token is kept in local storage and checked against `/api/auth/me` when the app loads. `ProtectedRoute` sends guests to the sign in page, `AdminRoute` sends non-admins back to their dashboard, and `GuestRoute` keeps signed in people away from the login screens. If the API ever answers with a 401, the app signs the user out automatically.

### Filtering with Redux Toolkit

The `filters` slice holds everything about how the expense list is being viewed: search text, selected categories, payment methods and expense types, date range, amount range, sort field, sort order, page and page size. The `expenses` slice has a `fetchExpenses` thunk that reads the current filters from the store and asks the API for exactly that page. Any change to the filters triggers a new fetch, and older requests are aborted so a slow response can never overwrite a newer one. The dashboard reuses the same slice: clicking a category dispatches `applyQuickFilter` and then opens the expenses page.

### Keeping data private

Every expense, budget, savings goal and note query on the server includes the signed in user's id, so one person can never read or change another person's data, even by guessing an id. Admin routes go through both `requireAuth` and `requireAdmin`, and the role is read from the database on every request rather than trusted from the token alone. Repeated failed sign in attempts are slowed down by a rate limit.

## Running it locally

### What you need

- Node.js 20 or newer
- A MongoDB connection string. A free MongoDB Atlas cluster works well, or a local MongoDB.

### 1. Clone

```bash
git clone https://github.com/Winnie-Irene/retain.git
cd retain
```

### 2. Start the API

```bash
cd server
cp .env.example .env
```

Open `server/.env` and fill in `MONGODB_URI` and a long random `JWT_SECRET`. Then:

```bash
npm install
npm run seed
npm run dev
```

`npm run seed` clears the database and fills it with categories, the admin account, the demo account with six months of expenses, four savings goals and a few monthly notes, and ten other users so the admin insights have something to show. Only run it when you are happy to start fresh.

The API will be on http://localhost:5000. Check http://localhost:5000/api/health.

### 3. Start the client

In a second terminal:

```bash
cd client
cp .env.example .env
npm install
npm run dev
```

Open http://localhost:5173 and sign in with one of the demo accounts.

### Environment variables

**server/.env**

| Variable | What it is for |
| --- | --- |
| `PORT` | Port for the API, 5000 by default |
| `NODE_ENV` | `development` or `production` |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret used to sign tokens, at least 16 characters |
| `JWT_EXPIRES_IN` | How long a sign in lasts, for example `7d` |
| `CLIENT_URL` | The frontend address allowed by CORS. Separate several with commas |
| `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD` | Admin account created by the seed script |
| `SEED_DEMO_EMAIL`, `SEED_DEMO_PASSWORD` | Demo user created by the seed script |

**client/.env**

| Variable | What it is for |
| --- | --- |
| `VITE_API_URL` | Base URL of the API, ending in `/api` |

## API reference

All endpoints live under `/api`. Send the token as `Authorization: Bearer <token>`. Errors always come back as `{ "message": "...", "details": [...] }`, where `details` lists field level problems when a form needs fixing.

### Auth

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| POST | `/auth/register` | Public | Create a user account. Body: `name`, `email`, `password`, `acceptTerms: true` |
| POST | `/auth/login` | Public | Sign in. Returns `{ token, user }` |
| GET | `/auth/me` | Signed in | The current user |

### Expenses

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| GET | `/expenses` | Owner | List your expenses with filters and pagination |
| POST | `/expenses` | Owner | Create an expense |
| GET | `/expenses/:id` | Owner | One expense |
| PATCH | `/expenses/:id` | Owner | Update any field of an expense |
| DELETE | `/expenses/:id` | Owner | Delete an expense |
| GET | `/expenses/payment-methods` | Signed in | The available payment methods |

Query parameters for `GET /expenses`:

| Parameter | Example | Notes |
| --- | --- | --- |
| `search` | `moto` | Matches title or notes, case insensitive |
| `categories` | `id1,id2` | One or more category ids |
| `paymentMethods` | `cash,mobile_money` | `cash`, `card`, `mobile_money`, `bank_transfer` |
| `kinds` | `fixed` | `fixed` or `variable` |
| `startDate`, `endDate` | `2026-10-01` | Inclusive date range |
| `minAmount`, `maxAmount` | `5000` | Inclusive amount range |
| `sortBy` | `amount` | `date`, `amount`, `title` or `createdAt` |
| `order` | `desc` | `asc` or `desc` |
| `page`, `limit` | `2`, `20` | Limit is capped at 100 |

Expense body:

```json
{
  "title": "Moto to campus",
  "amount": 1500,
  "category": "6713f0c2a1b2c3d4e5f60789",
  "date": "2026-10-17T12:00:00.000Z",
  "paymentMethod": "mobile_money",
  "notes": "Running late again",
  "kind": "variable"
}
```

### Budgets

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| GET | `/budgets?month=2026-10` | Owner | Budget summary: amount, spent, remaining, percent used, status |
| PUT | `/budgets/:month` | Owner | Set or update the budget for a month. Body: `amount` |
| DELETE | `/budgets/:month` | Owner | Remove a month's budget |
| GET | `/budgets/history?months=6` | Owner | Summaries for the last few months |

### Categories

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| GET | `/categories` | Signed in | All categories |
| POST | `/categories` | Admin | Create a category. Body: `name`, `color` |
| PATCH | `/categories/:id` | Admin | Rename or recolour a category |
| DELETE | `/categories/:id` | Admin | Delete a category and move its expenses to Uncategorized |

### Goals and notes

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| GET | `/notes/:month` | Owner | The goal, reduce and win notes for a month |
| PUT | `/notes/:month` | Owner | Save the notes for a month. Body: `goal`, `reduce`, `win` |

### Profile

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| PATCH | `/profile` | Signed in | Update `name`, `email` or `avatar` (a small image data URL, or empty to remove) |
| PATCH | `/profile/preferences` | Signed in | Update `alertAt` (50 to 95) or `landingPage` |
| PUT | `/profile/password` | Signed in | Change password. Body: `currentPassword`, `newPassword` |
| DELETE | `/profile` | Signed in (not admins) | Delete the account and all its data. Body: `password` |

### Savings goals

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| GET | `/savings` | Owner | Your goals with progress, plus totals and the next deadline |
| POST | `/savings` | Owner | Create a goal. Body: `name`, `targetAmount`, optional `targetDate`, `color`, `startingAmount` |
| PATCH | `/savings/:id` | Owner | Edit a goal |
| DELETE | `/savings/:id` | Owner | Delete a goal |
| POST | `/savings/:id/contributions` | Owner | Add money (positive `amount`) or take it out (negative `amount`), with an optional `note` |
| DELETE | `/savings/:id/contributions/:contributionId` | Owner | Remove one entry from the history |

### Dashboards

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| GET | `/dashboard?month=2026-10` | Owner | Totals, budget status, highest expense, category, payment and fixed or variable breakdowns, daily pace and recent expenses |
| GET | `/admin/insights` | Admin | Platform totals, spending per category, top and bottom 5 categories, six month trend, recent expenses and new users |
| GET | `/health` | Public | Health check |

## Deployment

### Database: MongoDB Atlas

1. Create a free cluster and a database user.
2. Under Network Access, allow `0.0.0.0/0` so Render can connect.
3. Copy the connection string and add `/retain` before the query string so the data lands in a database called `retain`.
4. Seed it once from your own machine by putting that string in `server/.env` and running `npm run seed`.

### API: Render

Create a **Web Service** from this repository with these settings:

| Setting | Value |
| --- | --- |
| Root Directory | `server` |
| Runtime | Node |
| Build Command | `npm install --include=dev && npm run build` |
| Start Command | `npm start` |
| Health Check Path | `/api/health` |

Environment variables: `NODE_ENV=production`, `MONGODB_URI`, a long random `JWT_SECRET`, `JWT_EXPIRES_IN=7d`, and `CLIENT_URL` set to the Vercel address.

### Client: Vercel

1. Import the repository and set the **Root Directory** to `client`. Vercel detects Vite on its own.
2. Add `VITE_API_URL` with the Render address followed by `/api`.
3. Deploy. `client/vercel.json` makes sure refreshing any page still loads the app.

## Design notes

The look comes from a blush pink monthly budget spreadsheet I found on Pinterest. I kept what made it feel personal: the script headings, the pink header rows on every table, the month box in the corner, the moon, the sun and the little leaf sprigs. Sage and olive came straight from its "How You Did" chart, so budgeted versus actual still uses those two colours. Everything else stays quiet so the numbers are easy to read.

A few small things I cared about:

- Every list has an empty state that tells you what to do next instead of just showing nothing.
- Forms check themselves before sending and also show the server's message under the exact field that needs fixing.
- Deleting anything asks first and tells you exactly what will happen.
- The layout works on phones: the sidebar becomes a drawer, tables turn into readable rows, and forms slide up from the bottom.
- Keyboard focus is always visible and animations calm down if your device asks for reduced motion.

## Future improvements

Things I would love to add next:

- **Real savings.** Connect to mobile money or a bank so the money in a savings goal can actually move, instead of only being recorded.
- **Debts tracker.** Track what you owe and what is owed to you, with a payment plan for each.
- **Recurring expenses.** Let fixed costs like rent and subscriptions add themselves at the start of each month.
- **Reminders.** A gentle nudge when you pass your budget warning level, or when a savings deadline is close.
- **Export.** Download a month as a spreadsheet or PDF.

## Author

**Irene Winnie**
i.winnie@alustudent.com
GitHub: [Winnie-Irene](https://github.com/Winnie-Irene)