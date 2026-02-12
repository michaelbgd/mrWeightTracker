# Weight Tracker - Setup Instructions

This is a minimal weight tracking app that writes to Google Sheets using only vanilla JavaScript and CDN libraries.

## Setup Steps

### 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Name it "Weight Tracker" and click "Create"

### 2. Enable Google Sheets API

1. In your project, go to "APIs & Services" → "Library"
2. Search for "Google Sheets API"
3. Click on it and press "Enable"
4. Also search for "Google Drive API" and enable it

### 3. Configure OAuth Consent Screen

1. Go to "APIs & Services" → "OAuth consent screen"
2. Choose "External" (unless you have a Google Workspace)
3. Fill in:
   - App name: "Weight Tracker"
   - User support email: your email
   - Developer contact: your email
4. Click "Save and Continue"
5. On "Scopes" page, click "Add or Remove Scopes"
   - Add: `https://www.googleapis.com/auth/spreadsheets`
   - Add: `https://www.googleapis.com/auth/drive.file`
6. Click "Save and Continue"
7. Add your email as a test user (click "Add Users")
8. Click "Save and Continue"

### 4. Create OAuth Client ID

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. Choose "Web application"
4. Name it "Weight Tracker Web Client"
5. Under "Authorized JavaScript origins", add:
   - `http://localhost:8000` (for local testing)
   - Your GitHub Pages URL: `https://yourusername.github.io`
6. You don't need to add redirect URIs
7. Click "Create"
8. Copy the Client ID (looks like `123456789-abc123.apps.googleusercontent.com`)

### 5. Update the HTML File

1. Open `weight-tracker.html`
2. Find this line near the top of the `<script>` section:
   ```javascript
   const CLIENT_ID = 'YOUR_CLIENT_ID_HERE.apps.googleusercontent.com';
   ```
3. Replace `YOUR_CLIENT_ID_HERE.apps.googleusercontent.com` with your actual Client ID

### 6. Test Locally

1. Start a local web server in the directory containing the HTML file:
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Or Python 2
   python -m SimpleHTTPServer 8000
   
   # Or using Node.js npx (if you have Node installed)
   npx serve
   ```

2. Open `http://localhost:8000/weight-tracker.html` in your browser
3. Click "Sign in with Google"
4. Enter a weight and submit

### 7. Deploy to GitHub Pages

1. Create a new GitHub repository
2. Upload `weight-tracker.html` (you can rename it to `index.html`)
3. Go to repository Settings → Pages
4. Under "Source", select your main branch
5. Save and wait for deployment
6. Access your app at `https://yourusername.github.io/repo-name/`

## How It Works

- **Authentication**: Uses Google Identity Services for OAuth 2.0
- **Storage**: Creates a new Google Sheet in the user's Drive on first use
- **Data**: Stores Sheet ID in localStorage to reuse the same sheet
- **Writing**: Uses Google Sheets API to append rows with timestamp and weight

## Features

- ✅ No build tools required
- ✅ Pure HTML/CSS/JavaScript
- ✅ CDN-loaded libraries only
- ✅ Data stored in user's own Google Drive
- ✅ Automatic spreadsheet creation
- ✅ Timestamp with each entry

## Notes

- The Client ID is public and visible in source code (this is normal for client-side OAuth)
- Each user's data is stored in their own Google Drive
- The app requests minimal permissions (only access to files it creates)
- Access tokens are stored in memory only and expire after 1 hour
