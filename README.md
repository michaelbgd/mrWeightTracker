# Weight Tracker

Minimal weight tracking app. Single HTML file, no build tools, stores data as a CSV in a GitHub repo.

## Setup

### 1. Create a private GitHub repo

Create a new **private** repository (e.g. `my-weight-data`). It can be empty — the app will create the CSV file on first use.

### 2. Create a fine-grained Personal Access Token

1. Go to [Settings > Developer Settings > Fine-grained tokens](https://github.com/settings/tokens/new?type=beta)
2. Set **Repository access** to "Only select repositories" and pick your data repo
3. Under **Permissions > Repository permissions**, grant **Contents: Read and write**
4. Generate the token and copy it

### 3. Open the app and connect

Open `index.html` in a browser (see below), paste your token, username, and repo name, then click **Connect Repository**.

Credentials are saved in `localStorage` so you only do this once per browser.

## Running locally

```bash
# Python
python -m http.server 8000

# Or Node.js
npx serve
```

Then open `http://localhost:8000` in your browser.

## How it works

- Data is stored as `weight.csv` in your GitHub repo (CSV with `timestamp,weight_kg` columns)
- Reads and writes via the GitHub Contents API (`GET`/`PUT` on the file)
- Credentials (PAT, owner, repo) are kept in `localStorage` — nothing leaves your browser except API calls to `api.github.com`
- Chart rendering uses Chart.js loaded from CDN

## Deploy to GitHub Pages (optional)

1. Push `index.html` to a GitHub repo (can be the same data repo or a separate one)
2. Go to **Settings > Pages**, select your branch, and save
3. Access the app at `https://<username>.github.io/<repo>/`
