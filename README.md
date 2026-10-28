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
