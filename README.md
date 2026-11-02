# Agrigate Network Ltd. – SCM Dashboard (with Firebase login)

## Files
| File | What it does |
|---|---|
| `login.html` | Sign-in page (email + password, show/hide password, keep me signed in, forgot password) |
| `index.html` | The dashboard. Stays hidden and sends visitors to `login.html` unless signed in. Has a **Sign out** button in the header |
| `firebase-config.js` | Firebase setup shared by both pages |
| `logo.png` | Logo used on the login page |

Upload all four files (plus this README if you like) to the **root of your GitHub Pages repo**, in the same folder.

## 1. Firebase console setup (one time)
1. **Build → Authentication → Get started → Sign-in method → Email/Password → Enable → Save.**
2. **Authentication → Users → Add user.** Create each person's email + password. The "username" is the email address.
3. **Authentication → Settings → User actions → turn OFF "Enable create (sign-up)".**
   This is important: without it, anyone who finds your public web key can register their own account and log in. With it off, only users you add in step 2 can sign in.
4. **Authentication → Settings → Authorized domains → Add domain:** `YOURNAME.github.io` (and your custom domain if you use one).
5. *(Recommended)* Google Cloud Console → APIs & Services → Credentials → your Browser key → **Application restrictions: Websites** → add `https://YOURNAME.github.io/*`.

## 2. Deploy
Commit the files to your repo and enable GitHub Pages (Settings → Pages). Open `https://YOURNAME.github.io/REPO/` – you will land on the login page.

## 3. Test locally
The pages use ES modules, so open them through a local server, not by double-clicking:

    python3 -m http.server 8000

then visit http://localhost:8000/ (`localhost` is authorised in Firebase by default).

## Good to know
- The Firebase web config in `firebase-config.js` is public by design – it is not a password.
- Login protects the **dashboard page**. The dashboard reads your Google Sheet from the browser, so if that sheet / Apps Script URL is public, someone who finds the URL can still read the data directly. For truly confidential figures, restrict the sheet or put the data behind an authenticated endpoint.
- To remove someone's access: Authentication → Users → disable or delete the user.

---

## Data entry (add / edit / delete rows in the Google Sheet)

`entry.html` is a sign-in-protected form that writes straight into the monthly **Supply Details <Mon>'<yy>** tabs
of your Master Sales spreadsheet (the same tabs the dashboard reads). It needs a small Google Apps Script backend
(`apps-script/Code.gs`) because a GitHub Pages site cannot write to Google Sheets by itself.

### One-time setup
1. Open the **Master Sales** spreadsheet → **Extensions → Apps Script**. Delete the sample code and paste the whole of `apps-script/Code.gs`.
2. At the top of the script, put the e-mail(s) allowed to enter data in `ALLOWED_EMAILS` (must match their Firebase login e-mail).
3. **Deploy → New deployment → type: Web app** · *Execute as:* **Me** · *Who has access:* **Anyone** → Deploy → **Authorize** (it asks for Sheets access and "connect to an external service") → copy the **Web app URL** (ends with `/exec`).
4. Open `entry.html`, find `API_URL` near the top of the script and paste that URL. Commit/upload.
5. After any later change to `Code.gs`: **Deploy → Manage deployments → ✏️ → Version: New version → Deploy** (the URL stays the same).

### How it works
- **Create** – fills the next free row of the tab that matches the *Delivery Date* month (e.g. 1-Nov-26 → `Supply Details Nov'26`). Formats and formulas of the previous row (e.g. a Sales Value column) are copied down, a numeric *Sl No* is continued, and a *Total* line below the data stays below.
- **Read** – pick a month; the table shows that tab's rows. Customer / item / location lists and the last PO details of a customer are suggested from the 3 newest tabs.
- **Update** – click *Edit*, change, *Update entry*. If you change the Delivery Date to another month, the row is moved to that month's tab.
- **Delete** – click *Delete* → confirm. The row is removed from the sheet.
- Safe edits: before an update/delete the script checks the row still holds the same Item / Truck / Challan / Date; if someone else changed it you are asked to reload.
- Columns are found by their **header names** (Sl No, Item, Truck No, Delivery Date, Challan No, Bag PCS, Customer Name, WO / PO No, WO / PO Date, WO / PO Rate, S. Weight (Kg), R. Weight (Kg), Supply Location), so extra columns or a different column order are fine.

### Security
Every request carries the signed-in user's Firebase token; the script verifies it with Firebase and only accepts e-mails in `ALLOWED_EMAILS`. Nobody can write to the sheet from outside the app.
The month tab must already exist (duplicate last month's tab and clear the rows). New entries appear on the dashboard at its next refresh (auto every 5 minutes, or press Refresh).
