# 🚀 Deploying Heart Link Surat to GitHub Pages

This guide outlines how to deploy the **Heart Link Surat** application to **GitHub Pages** cleanly and configure your GitHub and Firebase environments.

---

## 📋 Prerequisites

Before deploying, ensure you have:
1. Pushed your latest changes to the main repository.
2. Initialized your npm dependencies (`npm install`).

---

## 🛠️ Deployment Configuration

We have pre-configured `package.json` with the following:
- **`"homepage"`**: Set to `"https://nyravisionai-collab.github.io/heartlink-surat"`
- **`"predeploy"`**: Runs `GITHUB_PAGES=true npm run build` to compile the app with `/heartlink-surat/` as the router and asset base URL.
- **`"deploy"`**: Automatically pushes the built production bundle (`dist/` directory) to the `gh-pages` branch on your GitHub repository.

---

## 🚀 Step-by-Step Deployment

Follow these simple steps to deploy the site live:

### Step 1: Run the Deployment Command
In your local terminal, run:
```bash
npm run deploy
```
This command will:
1. Automatically execute the `predeploy` script.
2. Build the production React PWA application.
3. Publish the build artifacts to the `gh-pages` branch on GitHub.

### Step 2: Configure GitHub Repository Settings
1. Open your browser and navigate to your repository: [nyravisionai-collab/heartlink-surat](https://github.com/nyravisionai-collab/heartlink-surat)
2. Click on the **Settings** (gear) tab at the top of the page.
3. On the left sidebar under the **Code and automation** section, click on **Pages**.
4. Under the **Build and deployment** section:
   - For **Source**, choose **Deploy from a branch** from the dropdown menu.
   - For **Branch**, select `gh-pages` from the dropdown (this branch is created automatically after running `npm run deploy`).
   - Leave the folder path dropdown as `/ (root)`.
   - Click **Save**.
5. Within 1-2 minutes, GitHub will publish your site to: **`https://nyravisionai-collab.github.io/heartlink-surat/`**

### Step 3: Authorize Domain in Firebase Console (Crucial for Auth)
Because Firebase Auth restricts authentication requests to authorized domains, you must authorize your GitHub Pages domain to allow login and registration:
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Select your Firebase Project (`electricals-kart-164ba`).
3. Click on **Authentication** on the left menu, then navigate to the **Settings** tab.
4. On the left menu of Settings, click on **Authorized domains**.
5. Click **Add domain**.
6. Type **`nyravisionai-collab.github.io`** and click **Add**.

---

## 🔄 Updating Your Live App
Whenever you make updates or fix bugs and want to publish them live, simply run:
```bash
npm run deploy
```
It will re-build and deploy your updates within seconds!
