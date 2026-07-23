# 🚀 Deploying Heart Link Surat to GitHub Pages

This guide explains how to publish **Heart Link Surat** to **GitHub Pages** using the repository's `docs/` folder.

---

## 📋 Prerequisites

Before deploying, make sure you have:
1. Installed dependencies with `npm install`
2. Pushed the branch you want GitHub Pages to publish

---

## 🛠️ Deployment Configuration

The project is configured with:
- **`"homepage"`**: `https://nyravisionai-collab.github.io/heartlink-surat`
- **`"build:pages"`**: Builds the app with the correct GitHub Pages base path (`/heartlink-surat/`)
- **`"deploy"`**: Builds the app and syncs the production files into `docs/`

GitHub Pages can then serve the site directly from the selected branch's `docs/` folder.

---

## 🚀 Step-by-Step Deployment

### Step 1: Generate the GitHub Pages Build
Run:

```bash
npm run deploy
```

This command will:
1. Build the production app for GitHub Pages
2. Copy the final static files into `docs/`
3. Prepare the branch for GitHub Pages publishing

### Step 2: Push the Deployment Branch
Push the branch containing the updated `docs/` folder.

Example:

```bash
git push origin <your-branch>
```

### Step 3: Configure GitHub Pages
1. Open the repository: [nyravisionai-collab/heartlink-surat](https://github.com/nyravisionai-collab/heartlink-surat)
2. Go to **Settings** → **Pages**
3. Under **Build and deployment**:
   - Set **Source** to **Deploy from a branch**
   - Select the branch you pushed in Step 2
   - Select the folder **`/docs`**
   - Click **Save**
4. Wait 1-2 minutes for GitHub Pages to publish the site

The live URL will be:

**`https://nyravisionai-collab.github.io/heartlink-surat/`**

---

## 🔐 Firebase Authorized Domain

Because Firebase Authentication only accepts approved origins, add the GitHub Pages domain in Firebase:

1. Open the [Firebase Console](https://console.firebase.google.com/)
2. Select project **`electricals-kart-164ba`**
3. Go to **Authentication** → **Settings** → **Authorized domains**
4. Add:

```text
nyravisionai-collab.github.io
```

---

## 🔄 Updating the Live Site

Whenever you want to publish changes again:

```bash
npm run deploy
git add docs
git commit -m "Update GitHub Pages build"
git push origin <your-branch>
```

If GitHub Pages is already pointing to that branch's `docs/` folder, the site will refresh automatically after the push.
