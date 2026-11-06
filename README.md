# Split Money App: offline expense splitter with Google Drive sync

Split Money works fully offline on each phone. When you're online and connected to Google Drive, each group is saved as a JSON file in your Drive. Share that file with up to 4 friends and everyone's app stays in sync.

## What's in this folder

| File | What it is |
|---|---|
| `index.html` | The whole app |
| `config.js` | Your Google keys (you fill this in, step 2) |
| `sw.js` | Makes the app open without internet |
| `manifest.webmanifest`, `icon-*.png`, `apple-touch-icon.png` | Lets phones install it like an app |

---

## Step 1: Put it online (free, about 5 minutes)

The app has to be served from an `https://` address once, so phones can install it. After that it runs offline.

**GitHub Pages (recommended)**
1. Sign in at github.com and create a new **public** repository, for example `hisaab`.
2. Click **Add file → Upload files**, drag in every file from this folder, and commit.
3. Go to **Settings → Pages**. Under "Build and deployment", pick **Deploy from a branch**, branch `main`, folder `/ (root)`, and save.
4. After a minute your app is live at `https://YOUR-USERNAME.github.io/hisaab/`.

Netlify also works: drag the folder onto app.netlify.com/drop.

You can stop here and use Split Money offline on one phone. Steps 2–3 add Drive sync and sharing.

---

## Step 2: Let it use Google Drive (free, about 10 minutes)

Do this once, at console.cloud.google.com, signed in with your Google account.

1. **Create a project.** Top bar → project picker → **New project** → name it `Split Money` → Create. Make sure it's selected.
2. **Turn on two APIs.** Menu → **APIs & Services → Library**. Search and **Enable** both:
   - Google Drive API
   - Google Picker API
3. **Set up the sign-in screen.** Menu → **APIs & Services → OAuth consent screen** (may be called **Google Auth Platform**). Click Get started.
   - App name: `Split Money`. Support email: yours. Audience: **External**. Contact email: yours. Create.
   - **Audience → Test users → Add users**: add the Gmail address of **you and each friend** (up to 5 people total is fine; the limit is 100).
   - **Data access → Add or remove scopes**: tick `.../auth/drive.file` ("See, edit, create and delete only the specific Google Drive files you use with this app"). Save.
   - Leave the app in **Testing**. No verification is needed.
4. **Create the client ID.** **Clients** (or Credentials → Create credentials → OAuth client ID):
   - Application type: **Web application**. Name: `Split Money web`.
   - **Authorized JavaScript origins → Add URI**: `https://YOUR-USERNAME.github.io` (no path, no trailing slash).
   - Create, then copy the **Client ID**.
5. **Create the API key** (used only for the "Open a shared ledger" picker). **APIs & Services → Credentials → Create credentials → API key**. Copy it, then click **Edit API key**:
   - Application restrictions: **Websites** → add `https://YOUR-USERNAME.github.io/*`.
   - API restrictions: **Restrict key** → tick **Google Picker API**. Save.
6. **Find your project number.** Top bar project picker → your project → the **Project number** (digits only), or Menu → **IAM & Admin → Settings**.

## Step 3: Add your keys

Open `config.js` (on GitHub: click the file → pencil icon) and fill in the three values:

```js
window.HISAAB_CONFIG = {
  GOOGLE_CLIENT_ID: '1234567890-abc123.apps.googleusercontent.com',
  GOOGLE_API_KEY: 'AIza...',
  GOOGLE_APP_ID: '1234567890'
};
```

Commit. These values are safe to publish: the client ID only works from your own web address, and the API key is limited to the picker on your site.

---

## Using it

**Install on your phone.** Open your app's address in Chrome on Android → ⋮ menu → **Install app** (or "Add to Home screen"). On iPhone, open it in Safari → Share → **Add to Home Screen**.

**Connect Drive.** Tap the status chip at the top right → **Connect Google Drive** → pick your account. You'll see "Google hasn't verified this app". That's expected for a personal app: tap **Continue**. Your groups now sync.

**Share a group with friends.**
1. Open the group → **Edit** → **Open in Google Drive** → **Share** → add each friend's email. Choose **Viewer** if only you should add expenses (their app becomes view-only for that trip), or **Editor** if they should add too. Share only that trip's file; your other groups stay private.
2. Each friend opens your app's address on their phone, installs it, connects their own Drive, and taps **Open a shared ledger** to pick the file.
3. Everyone picks their own name under **Viewing as**.

**Offline.** Add expenses anywhere, with no signal. They're saved on the phone right away and sync the next time you're online with the app open.

**"Tap to resume sync".** Google sign-ins last about an hour. When the chip says this, one tap reconnects, usually with no password.

---

## How the data works

- **On each phone:** everything is stored in the browser's app storage (IndexedDB). It's instant and works offline. Clearing Chrome's site data for your app's address erases it, so keep Drive sync on or save backups.
- **In Google Drive:** one file per group, named `Split Money - <group name>.json`, owned by whoever created the group. Drive keeps version history for each file (Drive → file → ⋮ → **Manage versions**), which is your undo for mistakes.
- **Privacy:** Split Money asks only for the `drive.file` permission. It can see files it created and files you pick in it, nothing else in your Drive. There's no server: data goes only between each phone and Google Drive.
- **Conflicts:** if two people edit at the same time, each expense is merged separately, and the newer edit of the same expense wins. Deleted expenses stay deleted for everyone.
- **Removing a group** only removes it from that phone. To delete it for good, delete the file in Google Drive.
- **Example group** stays on the phone and never syncs.

## Updating the app

Edit the files on GitHub, then change `VERSION` at the top of `sw.js` (for example `splitmoney-v1`) and commit. Phones pick up the new version the second time the app opens.

## Turning it into a Play Store APK later

Wrap the hosted app with **Bubblewrap** or **PWABuilder** (pwabuilder.com → enter your address → Android package). It reuses this exact code.
