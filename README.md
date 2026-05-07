# HakiTracker — Browser Activity Analytics & Productivity System

A full-stack Chrome Extension that tracks your browser activity, sends data to a Node.js backend, and displays beautiful analytics in a React dashboard.

```
Browser → Chrome Extension → Node.js API → MongoDB → React Dashboard
```

## Features
```
--Real-time browser activity tracking
--Offline-first sync using chrome.storage.local
--Automatic website categorization
--Interactive analytics dashboard with charts
--Daily productivity summaries
--Background retry system for failed syncs
--REST API with MongoDB persistence
--Chrome Extension Manifest V3 architecture

```

---

## Motivation
```
Most productivity trackers are either invasive, paid, or lack meaningful analytics.

HakiTracker was built to explore browser extension development, real-time activity tracking, offline synchronization, and full-stack analytics visualization using the MERN ecosystem.

```

## Project Structure

```
HakiTracker/
├── extension/          # Chrome Extension (MV3)
│   ├── manifest.json
│   ├── background.js   # Tab tracking service worker
│   ├── popup.html/js   # Extension popup UI
│   └── icons/
│
├── backend/            # Node.js + Express API
│   ├── server.js
│   ├── routes/usage.js
│   ├── models/Usage.js
│   ├── controllers/usageController.js
│   └── .env.example
│
└── dashboard/          # React analytics dashboard (Vite)
    └── src/
        ├── App.jsx
        ├── components/
        ├── hooks/
        └── api/
```

---

## Screenshots

### Dark Mode Dashboard
![Dark Dashboard](./assets/dashboard-dark1.png)

![Dark Dashboard 2](./assets/dashboard-dark2.png)

### Light Mode Dashboard
![Light Dashboard](./assets/dashboard-light1.png)

![Light Dashboard 2](./assets/dashboard-light2.png)

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Google Chrome browser

---

### Step 1 — Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create your .env file
cp .env.example .env
```
Update .env:

MONGO_URI=mongodb+srv://youruser:yourpass@cluster0.xxxxx.mongodb.net/HakiTrackerxxxxx.mongodb.net/HakiTracker
PORT=3001
NODE_ENV=development

```bash
# Start the backend
npm run dev

# You should see:
# ✓ Connected to MongoDB
# ✓ Server running at https://hakitrackr-backend.onrender.com/api
```

**Test the backend:**
```bash
curl https://hakitrackr-backend.onrender.com/api/health
# → {"status":"ok","db":"connected"}
```

---

### Step 2 — Install the Chrome Extension

1. Open Chrome and go to `chrome://extensions`
2. Enable **Developer mode** 
3. Click **"Load unpacked"**
4. Select the `extension/` folder from this project

**Required Icons**

Create these files inside extension/icons/:
- icon16.png
- icon48.png
- icon128.png

---

### Step 3 — Start the React Dashboard
```
cd dashboard

npm install

npm run dev

# Open http://localhost:5173
```

---

**Run Everything Together**
# Terminal 1
cd backend && npm install && npm run dev

# Terminal 2
cd dashboard && npm install && npm run dev

Then load the Chrome extension manually from the extension/ folder.

---

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/usage` | Extension sends a session |
| GET | `/api/usage` | Raw sessions (with `?date=YYYY-MM-DD`) |
| GET | `/api/usage/summary` | Aggregated per domain |
| GET | `/api/usage/categories` | Category breakdown |
| GET | `/api/usage/daily?days=7` | Day-by-day stats |
| DELETE | `/api/usage` | Clear stored data |
| GET | `/health` | Backend health check |

**Example POST body (from extension):**
```json
{
  "domain": "github.com",
  "category": "Productivity",
  "duration": 183000,
  "timestamp": "2026-04-14T10:30:00.000Z",
  "date": "2026-04-14"
}
```

---

## How It Works

### Tracking Logic (background.js)
The extension listens to these Chrome events:
- `chrome.tabs.onActivated` 
- `chrome.tabs.onUpdated` 
- `chrome.windows.onFocusChanged` 
- `chrome.idle.onStateChanged`
- `chrome.alarms` 

### Data Flow
```
1. User switches tab
2. background.js calculates session duration
3. Saved to chrome.storage.local (offline buffer)
4. POST to /api/usage (immediate sync)
5. If backend offline → retry on next alarm
6. Dashboard fetches GET /api/usage/summary every 30s
```

### Categories
Sites are automatically categorized into: Social, Entertainment, Productivity, Learning, News, Communication, Finance, Shopping, gaming, Other.

You can extend the category map in `extension/background.js` → `getCategory()` function.

---

## Deployment
HakiTracker uses a simple deployment setup suitable for development demos and portfolio projects.

## Backend + Dashboard Deployment (Render)

Both the backend API and React dashboard can be deployed using Render.

### Deploy the Backend

1. Push the repository to GitHub
2. Create a new **Web Service** on Render
3. Connect your GitHub repository
4. Configure:

```bash
Build Command: npm install
Start Command: node server.js
```

5. Add environment variables:

```env
MONGO_URI=your_mongodb_connection_string
PORT=3001
NODE_ENV=production
```
6. Deploy the service

Example API URL:

```txt
https://hakitracker-api.onrender.com
```
---

### Deploy the Dashboard
Create another Render Web Service for the dashboard.

Configure:

```bash
Build Command: npm install && npm run build
Start Command: npm run preview
```
Update the API base URL inside:

```txt
dashboard/src/api/usageApi.js
```
Example:

```js
const BASE_URL = "https://hakitracker-api.onrender.com/api";
```
---

## Chrome Extension Setup

The Chrome extension is currently intended for local development/demo usage.

To connect the extension to the deployed backend:

### Update `manifest.json`

```json
"host_permissions": [
  "https://hakitracker-api.onrender.com/*"
]
```

### Update `background.js`

```js
const BACKEND_URL =
  "https://hakitracker-api.onrender.com/api";
```

Then reload the extension from:

```txt
chrome://extensions
```
---

## Demo Access

The Chrome extension is not publicly published on the Chrome Web Store yet.

Project demonstrations are available through:

* dashboard screenshots
* recorded demo videos
* GitHub source code

## Future Improvements

| Feature | How to build it |
|---------|----------------|
| **Distraction alerts** | In `background.js`, check daily total on each session end. If over limit, call `chrome.notifications.create()` |
| **Focus score goals** | Store daily target in `chrome.storage.sync`. Show progress in popup and dashboard |
| **Goal tracking** | Add a `/goals` API + UI in dashboard. Compare actual vs target per category |
| **Weekly reports** | Add a `GET /api/usage/weekly` endpoint + email via SendGrid |
| **Block distracting sites** | Add `declarativeNetRequest` permission + rules API |
| **Multiple users** | Add JWT auth to the API. Extension sends a user token with each request |
| **Export data** | Add `GET /api/usage/export.csv` endpoint |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Extension | Chrome MV3, Vanilla JS |
| Backend | Node.js, Express, Mongoose |
| Database | MongoDB Atlas |
| Frontend | React 18, Vite, Recharts |
| Charts | Recharts |
| HTTP client | Axios |

---

## Troubleshooting

**Extension not sending data?**
- Check service worker console for errors
- Verify backend is running
- Check `host_permissions` in manifest.json includes your backend URL

**Dashboard shows no data?**
- Browse some websites with the extension installed first
- Check network tab in browser devtools — is the API call returning data?
- Try: `curl https://hakitrackr-backend.onrender.com/api/api/usage/summary`

**MongoDB connection fails?**
- Double-check MONGO_URI in .env (no spaces, correct password)
- In Atlas → Network Access → Add your current IP address
- Try adding `0.0.0.0/0` to allow all IPs (dev only)

**License**
This project is licensed under the MIT License.
