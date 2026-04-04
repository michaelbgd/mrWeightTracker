/* shared.js — common code for weight and fuel trackers
   Each app must define: dataFile(), showTracker(), showSetup(),
   loadEntries(), deleteEntry(a, b), parseCSV(text), renderEntries(rows) */

const API = 'https://api.github.com';
let config = null;

// ── Persistence ──────────────────────────────────────────────────────
// Note: The GitHub PAT is stored in plain text in localStorage. Without a backend
// there's no meaningfully better option. Use a fine-grained token scoped to a
// single repo to limit the blast radius.
function saveConfig(cfg) {
    config = cfg;
    localStorage.setItem('wtConfig', JSON.stringify(cfg));
}

function loadConfig() {
    try {
        const raw = localStorage.getItem('wtConfig');
        if (raw) { config = JSON.parse(raw); return true; }
    } catch (_) {}
    return false;
}

function clearConfig() {
    config = null;
    localStorage.removeItem('wtConfig');
}

// ── GitHub API ───────────────────────────────────────────────────────
async function ghFetch(path, options = {}) {
    const res = await fetch(`${API}${path}`, {
        ...options,
        headers: {
            Authorization: `Bearer ${config.pat}`,
            Accept: 'application/vnd.github+json',
            'X-GitHub-Api-Version': '2022-11-28',
            'Content-Type': 'application/json',
            ...(options.headers || {}),
        },
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `HTTP ${res.status}`);
    }
    return res.status === 204 ? null : res.json();
}

async function getFile() {
    try {
        const data = await ghFetch(`/repos/${config.owner}/${config.repo}/contents/${dataFile()}`);
        const content = decodeURIComponent(escape(atob(data.content.replace(/\n/g, ''))));
        return { content, sha: data.sha };
    } catch (e) {
        if (e.message.includes('404') || e.message.includes('Not Found')) return null;
        throw e;
    }
}

async function putFile(content, sha, message) {
    await ghFetch(`/repos/${config.owner}/${config.repo}/contents/${dataFile()}`, {
        method: 'PUT',
        body: JSON.stringify({
            message,
            content: btoa(unescape(encodeURIComponent(content))),
            ...(sha ? { sha } : {}),
        }),
    });
}

// ── UI helpers ───────────────────────────────────────────────────────
function setStatus(id, msg, type = '') {
    const el = document.getElementById(id);
    el.innerHTML = msg;
    el.className = `status ${type}`;
    if (type === 'success') setTimeout(() => { el.textContent = ''; el.className = 'status'; }, 3000);
}

function showSetup() {
    document.getElementById('setupSection').style.display = 'block';
    document.getElementById('trackerSection').classList.remove('active');
}

// ── Connect ──────────────────────────────────────────────────────────
async function connect() {
    const pat   = document.getElementById('patInput').value.trim();
    const owner = document.getElementById('ownerInput').value.trim();
    const repo  = document.getElementById('repoInput').value.trim();

    if (!pat || !owner || !repo) {
        setStatus('setupStatus', 'Please fill in all three fields.', 'error');
        return;
    }

    const btn = document.getElementById('connectBtn');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span>Verifying\u2026';
    setStatus('setupStatus', '');

    try {
        config = { pat, owner, repo };
        await ghFetch(`/repos/${owner}/${repo}`);
        saveConfig({ pat, owner, repo });
        showTracker();
        await loadEntries();
    } catch (e) {
        config = null;
        const msg = e.message.includes('404') || e.message.includes('Not Found')
            ? 'Repository not found \u2014 check the username and repo name.'
            : e.message.includes('401') || e.message.includes('Bad credentials')
            ? 'Invalid token \u2014 make sure you copied the full PAT.'
            : 'Error: ' + e.message;
        setStatus('setupStatus', msg, 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Connect Repository';
    }
}

// ── Delete (UI confirmation) ─────────────────────────────────────────
function handleDelete(btn, a, b) {
    if (btn.classList.contains('confirm')) {
        btn.disabled = true;
        btn.textContent = '...';
        deleteEntry(a, b);
        return;
    }
    btn.classList.add('confirm');
    btn.textContent = 'Sure?';
    setTimeout(() => {
        if (btn && btn.isConnected && btn.classList.contains('confirm')) {
            btn.classList.remove('confirm');
            btn.innerHTML = '&times;';
        }
    }, 3000);
}

// ── Load entries (with cache) ────────────────────────────────────────
async function loadEntries() {
    const cached = getCachedCSV();
    if (cached) renderEntries(parseCSV(cached));

    try {
        const file = await getFile();
        const freshCSV = file ? file.content : '';
        if (freshCSV !== (cached || '')) {
            renderEntries(freshCSV ? parseCSV(freshCSV) : []);
            if (freshCSV) cacheCSV(freshCSV); else clearCache();
        }
    } catch (e) {
        if (!cached) {
            const c = document.getElementById('entriesContainer');
            c.textContent = '';
            const p = document.createElement('p');
            p.className = 'entries-empty';
            p.style.color = '#dc3545';
            p.textContent = 'Failed to load: ' + e.message;
            c.appendChild(p);
        }
    }
}
