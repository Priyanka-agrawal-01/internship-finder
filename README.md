# InternPulse 🚀

InternPulse is a modern, responsive, and fully-functional full-stack internship and remote job aggregator. It fetches active job postings from public APIs, merges and filters them, and offers an email notification subscription service powered by Nodemailer.

This application is built with a **beginner-friendly, clean, and highly readable architecture**, making it an excellent resume project.

---

## 📂 Project Structure

```text
project_1/
├── backend/                  # Node.js + Express.js backend
│   ├── src/
│   │   ├── config/
│   │   │   └── mail.js       # Nodemailer SMTP & Ethereal setup
│   │   ├── services/
│   │   │   ├── jobService.js # Public job API fetching & caching service
│   │   │   └── emailService.js # Subscription confirmation email compiler
│   │   ├── routes/
│   │   │   ├── jobRoutes.js  # GET /api/jobs router
│   │   │   └── subscribeRoutes.js # POST /api/subscribe router
│   │   └── server.js         # Entry point for the Express server
│   ├── .env.example          # Environment variables template
│   ├── .env                  # Local environment file
│   └── package.json          # Backend dependencies
│
├── frontend/                 # React + Tailwind CSS frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx    # Glassmorphic navbar & posting counter
│   │   │   ├── SearchFilter.jsx # Multi-functional search and filter controls
│   │   │   ├── JobCard.jsx   # Job card with dynamic metadata & 'New' badges
│   │   │   └── SubscribeForm.jsx # Interactive newsletter email form
│   │   ├── App.jsx           # Parent coordinate hub & filter logic
│   │   ├── index.css         # Styling, custom scrollbar & animations
│   │   └── main.jsx          # React renderer entry point
│   ├── index.html            # Core HTML skeleton & viewport meta
│   ├── tailwind.config.js    # Tailwind palette overrides
│   ├── postcss.config.js     # PostCSS CSS parser configuration
│   └── package.json          # Frontend packages & build scripts
│
└── README.md                 # Project guide (this file)
```

---

## ⚡ Quick Start & Run Commands

Follow these steps to run both the backend and frontend locally:

### 1. Prerequisite
Ensure you have [Node.js](https://nodejs.org/) installed (v18.0.0 or higher is recommended).

### 2. Setup the Backend
Navigate to the `backend` directory, install packages, set up configurations, and boot the server:
```bash
# Move to backend folder
cd backend

# Install Node dependencies
npm install

# Initialize your environmental variables
copy .env.example .env

# Start the server (runs on http://localhost:5000)
npm start
```
> [!TIP]
> You can also run `npm run dev` to launch the server using `nodemon` which will automatically reload the application whenever you make code adjustments.

### 3. Setup the Frontend
Open a new terminal window, navigate to the `frontend` directory, install packages, and boot the Vite development server:
```bash
# Move to frontend folder
cd frontend

# Install React dependencies
npm install

# Run the local development server (runs on http://localhost:5173)
npm run dev
```

---

## ⚙️ Environment Variables Setup

### Backend Environment (`backend/.env`)
By default, the backend requires **zero initial configuration**. If you boot it with blank email variables, it will automatically register a temporary, sandboxed test mailbox at `ethereal.email` and print the visual preview links directly inside your terminal when emails are sent.

To connect your own real email account, modify your `backend/.env` file:
```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Real Email SMTP Settings (optional)
EMAIL_SERVICE=gmail
EMAIL_USER=your_gmail_address@gmail.com
EMAIL_PASS=your_gmail_app_password
```
*(Note: If using Gmail, you must generate a 16-digit "App Password" under your Google Account security settings instead of your regular password).*

### Frontend Environment (`frontend/.env`)
For local testing, the frontend defaults to communicating with `http://localhost:5000`. To point the frontend to a deployed production server, create a file named `.env` in the `frontend/` directory:
```env
VITE_API_URL=https://your-backend-render-url.onrender.com
```

---

## 🌐 How InternPulse Works

### 1. How Frontend Communicates with Backend
*   The React application uses **Axios** to send HTTP requests to the backend server.
*   Upon mounting, `App.jsx` triggers a `GET` request to `${BACKEND_URL}/api/jobs`. The fetched listings are stored in React state.
*   When a user inputs an email into the newsletter form, the `SubscribeForm.jsx` sends a `POST` request to `${BACKEND_URL}/api/subscribe` containing `{ email }` in the request body.

### 2. How Job Fetching & Caching Works
*   The backend service `jobService.js` queries public job endpoints in parallel using `Promise.allSettled`.
*   To prevent hitting rate limits (e.g. Remotive blocks IPs that request data more than twice a minute), the backend caches the normalized job results in-memory for **10 minutes**.
*   Subsequent client requests are instantly returned from the local cache. If the cache expires, the server hits the APIs again, merges the responses, updates the cache, and serves the new listings.

### 3. How APIs are Integrated & Normalized
*   **Remotive API:** Pulls listings from `https://remotive.com/api/remote-jobs`.
*   **Arbeitnow API:** Pulls listings from `https://www.arbeitnow.com/api/job-board-api`.
*   The schemas returned by these endpoints differ. Our `jobService.js` normalizes them into a unified format:
    *   `id`: Prepended with their source (e.g., `remotive-1234`, `arbeitnow-slug`) to ensure key uniqueness.
    *   `title`, `company`, `location`, `url`: Mapped uniformly.
    *   `tags`: Cleaned and truncated to a maximum of 5 tags to prevent visual clutter.
    *   `isInternship`: Automatically computed by checking if the title or tags contain keywords like *intern*, *co-op*, *placement*, *student*, or *trainee*.
    *   `postedAt`: Normalized into ISO string timestamps.

### 4. How Email Notifications Work
*   When the backend receives a validation post on `/api/subscribe`, it inspects the string against email regex validation.
*   `emailService.js` loads the SMTP transporter setup in `mail.js`.
*   A responsive HTML subscription confirmation template is rendered, complete with the branding color palette and active links.
*   **Nodemailer** sends the email. If the environment is in development and has no credentials, it provides a clickable URL logging the test mailbox where the developer can inspect the visual markup.

---

## 🚀 Deployment Instructions

### Deploying the Backend on Render
1.  Sign in to [Render](https://render.com/).
2.  Click **New +** and select **Web Service**.
3.  Connect your GitHub repository containing the project.
4.  Set the following configurations:
    *   **Name:** `internpulse-backend`
    *   **Root Directory:** `backend`
    *   **Runtime:** `Node`
    *   **Build Command:** `npm install`
    *   **Start Command:** `npm start`
5.  Add the following **Environment Variables** in the service settings:
    *   `NODE_ENV` = `production`
    *   `PORT` = `10000` (or leave blank; Render binds automatically)
    *   `FRONTEND_URL` = `https://your-frontend-vercel-url.vercel.app`
    *   *(Optional SMTP settings)* `EMAIL_SERVICE`, `EMAIL_USER`, `EMAIL_PASS`.
6.  Click **Deploy Web Service**.

### Deploying the Frontend on Vercel
1.  Sign in to [Vercel](https://vercel.com/).
2.  Click **Add New...** and select **Project**.
3.  Import your GitHub repository.
4.  Configure the Vercel project:
    *   **Framework Preset:** `Vite` (Vercel auto-detects this)
    *   **Root Directory:** `frontend`
    *   **Build Command:** `npm run build`
    *   **Output Directory:** `dist`
5.  Under **Environment Variables**, add:
    *   `VITE_API_URL` = `https://your-backend-render-url.onrender.com` (use your deployed Render service URL).
6.  Click **Deploy**. Vercel will build the frontend assets and host them on a fast, global CDN.
