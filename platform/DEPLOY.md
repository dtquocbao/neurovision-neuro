# Deploying NeuroVision Neuro

**Frontend:** [Vercel](https://vercel.com)  
**Backend:** [Hugging Face Spaces](https://huggingface.co/spaces) (Docker)  
**CI/CD:** GitHub Actions (`.github/workflows/deploy-platform.yml`)

---

## 0. GitHub Actions (recommended)

Push to `main` (with changes under `platform/`) deploys **both** backend and frontend in parallel.

### One-time setup

#### A. Hugging Face Space (backend target)

1. [Create a Docker Space](https://huggingface.co/new-space) (e.g. `neurovision-neuro-api`) — **do not** connect GitHub sync if using Actions
2. Create a [write token](https://huggingface.co/settings/tokens)

#### B. Vercel project (frontend target)

1. Import repo at [vercel.com/new](https://vercel.com/new) with **Root Directory** `platform/frontend`
2. Get IDs from Vercel → Project → Settings → General:
   - **Project ID**
   - **Org ID** (Team/Account settings)
3. Create a [Vercel token](https://vercel.com/account/tokens)

#### C. GitHub repository configuration

**Settings → Secrets and variables → Actions**

| Type | Name | Value |
|------|------|--------|
| Secret | `HF_TOKEN` | Hugging Face write token |
| Secret | `VERCEL_TOKEN` | Vercel token |
| Secret | `VERCEL_ORG_ID` | Vercel org/team ID |
| Secret | `VERCEL_PROJECT_ID` | Vercel project ID |
| Secret | `VITE_API_URL` | `https://YOUR-USER-neurovision-neuro-api.hf.space` |
| Variable | `HF_SPACE_ID` | `YOUR-USER/neurovision-neuro-api` |

**Hugging Face Space → Settings → Variables** (set once, not in GitHub):

| Key | Value |
|-----|--------|
| `CORS_ORIGINS` | Your production Vercel URL |
| `CORS_ORIGIN_REGEX` | `https://.*\.vercel\.app` |

#### D. Trigger deploy

```bash
git push origin main
```

Or: **Actions → Deploy Platform → Run workflow**

### NB04 models in CI

Models are gitignored. To include classifier weights in HF builds:

1. Run locally: `python scripts/export_platform_data.py --copy-models`
2. Upload models to a separate HF model repo, or use Git LFS / manual upload to the Space
3. Without models, `/api/classify` returns 503; atlas, score, disease, LR work

---

## 1. Backend — Hugging Face Spaces (Docker)

### Prerequisites

- GitHub repo pushed with `platform/backend/data/` (CSV assets committed)
- Hugging Face account

### Create the Space

1. Go to [huggingface.co/new-space](https://huggingface.co/new-space)
2. **Space name:** e.g. `neurovision-neuro-api`
3. **SDK:** Docker
4. **GitHub sync:** optional — skip if using GitHub Actions (section 0)

### Space README

`platform/backend/README.md` includes the HF YAML frontmatter and is uploaded by GitHub Actions.

### Optional: NB04 classifier models

Classifier needs scVI + MLP weights (~hundreds of MB):

```bash
python scripts/export_platform_data.py --copy-models
```

This copies to `platform/backend/models/`. Models are gitignored at repo root — either:

- Add `platform/backend/models/` to the Docker build context before push (temporarily un-ignore), or
- Upload models to the Space via HF persistent volume / manual copy in a custom build step

Without models, atlas / score / disease / LR still work; `/api/classify` returns 503.

### Space environment variables

**Settings → Variables:**

| Key | Value |
|-----|--------|
| `CORS_ORIGINS` | `https://YOUR-APP.vercel.app` |
| `CORS_ORIGIN_REGEX` | `https://.*\.vercel\.app` (default in code; optional) |

### Verify

After build (~10–20 min first time due to scvi-tools):

```bash
curl https://YOUR-USERNAME-neurovision-neuro-api.hf.space/api/health
```

Note your API base URL: `https://YOUR-USERNAME-neurovision-neuro-api.hf.space` (no trailing slash).

### Local Docker test

```bash
cd platform/backend
docker build -t neurovision-api .
docker run -p 7860:7860 -e CORS_ORIGINS=http://localhost:5173 neurovision-api
```

---

## 2. Frontend — Vercel

### Import project (one-time)

1. [vercel.com/new](https://vercel.com/new) → Import Git repository
2. **Root Directory:** `platform/frontend`
3. **Framework Preset:** Vite (auto-detected)

Subsequent production deploys are handled by **GitHub Actions** (section 0). You can disable Vercel’s native Git integration to avoid double deploys.

### Environment variables

Set `VITE_API_URL` as a **GitHub secret** (used at build time by Actions).  
Optionally mirror it in Vercel → Settings → Environment Variables for manual deploys.

### Verify

Open your Vercel URL → Atlas and L-R pages should load data from HF.  
Check browser DevTools → Network: requests go to `hf.space/api/...`.

---

## 3. CORS checklist

| Symptom | Fix |
|---------|-----|
| CORS error in browser | Add exact Vercel URL to HF `CORS_ORIGINS` |
| Preview deploys fail | Ensure `CORS_ORIGIN_REGEX` allows `*.vercel.app` |
| 502 on HF | Rebuild Space; check Logs for OOM (upgrade to CPU upgrade) |

---

## 4. Architecture

```
Browser (Vercel)
    │  VITE_API_URL
    ▼
HF Space :7860  FastAPI
    ├── data/umap_embeddings.csv
    ├── data/liana_results.csv
    ├── data/seaad_reference.json
    └── models/  (optional, NB04)
```

---

## 5. Cost / limits

| Service | Free tier notes |
|---------|-----------------|
| Vercel | Hobby: sufficient for portfolio |
| HF Spaces | CPU basic: slow cold start; classify may need **CPU upgrade** (16GB RAM) |
| Upload size | 500MB max (`MAX_UPLOAD_BYTES` env to override) |

---

## 6. Alternative: separate HF repo

If monorepo subfolder is awkward, create a small repo containing only `platform/backend/` contents and point the Space there.
