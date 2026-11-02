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

## Roles: who sees what

| Role | After login goes to | Can do |
|---|---|---|
| **admin** (you) | Dashboard | See everything; open the Data Entry page (**+** button); see every row and **who entered it**; create, edit and **delete** any row |
| **management** | Dashboard | View the dashboard only. No data-entry access |
| **collector** (data-entry staff) | Data Entry page | Add entries; see and **edit only the entries they entered themselves**. They never see the dashboard and can **never delete** |

Roles are decided on the **server** (the Apps Script), not in the browser, so a collector cannot give themselves more rights.

### Give people access
1. **Firebase console → Authentication → Users → Add user** (e-mail + password).
2. In `apps-script/Code.gs`, add that e-mail (lower-case) to `ROLES` with `'admin'`, `'management'` or `'collector'`, then re-deploy (Deploy → Manage deployments → ✏️ → New version → Deploy).
3. An e-mail that is not in `ROLES` is signed out with "no access" even if it has a Firebase account.

### Data entry (add / edit / delete rows in the Google Sheet)
`entry.html` writes into the **Master Sales** tab through a small Google Apps Script backend (a GitHub Pages site cannot write to Google Sheets by itself).

**One-time setup**
1. Open the spreadsheet → **Extensions → Apps Script**. Delete the sample code and paste the whole of `apps-script/Code.gs`.
2. Edit `ROLES` at the top (your e-mail as `admin`, staff as `collector`, managers as `management`). `MASTER_GID` is already set to your Master Sales tab (`gid=1908194160`).
3. **Deploy → New deployment → type: Web app** · *Execute as:* **Me** · *Who has access:* **Anyone** → Deploy → **Authorize** → copy the **Web app URL** (ends with `/exec`).
4. Open **`firebase-config.js`**, paste that URL into `API_URL`, commit/upload. (Until `API_URL` is set, everyone who logs in is sent to the dashboard, as before.)

**How it works**
- **Create** – fills the next free row of *Master Sales*. Formats and formulas of the previous row are copied down, a numeric *Sl No* is continued, a *Total* line below the data stays below. The script adds two columns at the right of the header the first time: **Entered By** (the user's e-mail) and **Entered At**. That is how "own entries" are recognised. Rows that existed before have no owner, so only the admin sees them.
- **Read** – the table shows rows of the chosen *delivery month* (or *All months*). Collectors get only their own rows from the server. Suggestions: item / customer / location names (`SHARE_NAME_LISTS`), and a customer's last PO / rate only from the user's own entries.
- **Update** – *Edit* → *Update entry*. A collector's edit is refused by the server unless the row's *Entered By* is their e-mail.
- **Delete** – admin only (server-enforced).
- Before an update/delete the script checks the row still holds the same Item / Truck / Challan / Date; if someone changed it you are asked to reload.
- Columns are found by **header names** (Sl No, Item, Truck No, Delivery Date, Challan No, Bag PCS, Customer Name, WO / PO No, WO / PO Date, WO / PO Rate, S. Weight (Kg), R. Weight (Kg), Supply Location).

### Important limits (please read)
- The dashboard still reads its data directly from the Google Sheet in the browser, so the sheet is "Anyone with the link can view". Role routing hides the dashboard from collectors and fully protects the entry API, but **anyone who knows the sheet link can still open the sheet itself**. For real confidentiality: make the sheet private and let the dashboard read through the Apps Script (`APPS_SCRIPT_URL` in `index.html` is already prepared for this).
- The dashboard currently reads the **Supply Details <Mon>'<yy>** tabs. New Master Sales rows appear there only if those tabs are fed from Master Sales.

---

## UPDATE: Sales + Purchase entry, dashboard fed by Apps Script

**Two tables, full CRUD** – `entry.html` now has **Sales** and **Purchase** tabs (Create / Read / Update / Delete):
| Tab | Sheet tab it writes | Form fields |
|---|---|---|
| Sales | **Master Sales Data** (found by gid `1908194160`, or by the name *Master Sales Data* / *Master Sales*) | Item, Truck No, Delivery Date, Challan No, Bag PCS, Customer, WO/PO No, WO/PO Date, WO/PO Rate, S. Weight, R. Weight, Supply Location |
| Purchase | **Master Purchase Data** (found by name) | Purchase Date, Item, Supplier, Invoice/Challan No, Quantity, Rate, Amount (auto = Qty × Rate if blank), Remarks |

- Columns are found by **header name**, so the order in your sheet does not matter. If *Master Purchase Data* is completely empty, the script writes the header row for you. If it has its own headings, they are matched (Date / Item / Supplier / Qty / Rate / Amount / Remarks and common variants). Two columns, **Entered By** and **Entered At**, are added at the right the first time.
- If the **Amount** (or Sales Value) column in your sheet is a formula, the script copies the formula down and never overwrites it.
- **Dashboard** (Truck-Wise Supply Performance) reads the same **Supply Details <Mon>'<yy>** tabs as before (Sep'25 onward). With `API_URL` set, the Apps Script (`dash_supply`, admin + management only) serves those tabs, so the sheet can be private; without it the dashboard falls back to the old public-sheet method. The Purchase and Profit & Loss pages are unchanged. Master Sales Data / Master Purchase Data are used **only by the data-entry form**.

**Settings at the top of `Code.gs`:** `ROLES`; `COLLECTOR_CAN_PURCHASE` (default `false`: purchase is admin-only).

**Re-deploy:** paste the new `Code.gs` → Deploy → Manage deployments → ✏️ → New version → Deploy (the URL stays the same). Upload `index.html`, `entry.html`, `firebase-config.js`.
