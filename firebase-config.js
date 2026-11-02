// Shared Firebase setup. Used by login.html and index.html.
// The web config below is NOT a secret (Firebase web keys are public by design).
// Real protection comes from Firebase Authentication settings (see README.md).
import { initializeApp } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-app.js";
import {
  getAuth, setPersistence, browserLocalPersistence, browserSessionPersistence,
  signInWithEmailAndPassword, signOut, onAuthStateChanged, sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/13.1.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDm_iWiijipNKJBkw52WYMydy76ubw_MkI",
  authDomain: "anl-scm-dashboard.firebaseapp.com",
  projectId: "anl-scm-dashboard",
  storageBucket: "anl-scm-dashboard.firebasestorage.app",
  messagingSenderId: "203565219209",
  appId: "1:203565219209:web:2dca866e2029a7b231b558",
  measurementId: "G-6RQWDGSG8P"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export {
  setPersistence, browserLocalPersistence, browserSessionPersistence,
  signInWithEmailAndPassword, signOut, onAuthStateChanged, sendPasswordResetEmail
};

/* ====== PASTE your deployed Apps Script web-app URL here (ends with /exec) ====== */
export const API_URL = 'https://script.google.com/macros/s/AKfycbxMeAottJP8lXjwBU493TsPzX3sQ2vEGTDBgVY7BuCHyqEHai_63rMAUQa--rTkZn3e/exec';
/* ================================================================================ */
export const apiReady = () => /^https:\/\/script\.google\.com\//.test(API_URL);

/* Talks to the Apps Script backend with the signed-in user's Firebase token (the server decides what the user may do). */
export async function api(user, action, payload = {}) {
  if (!apiReady()) throw new Error('API_URL is not set in firebase-config.js yet. See README.');
  const token = await user.getIdToken();
  let r;
  try { r = await fetch(API_URL, {method:'POST', body:JSON.stringify({action, token, ...payload})}); }   // text/plain body: no CORS pre-flight
  catch (e) { throw new Error('Network error. Check your connection and the Apps Script deployment (access must be "Anyone").'); }
  let j; try { j = await r.json(); } catch (e) { throw new Error('The access service did not answer correctly. Re-deploy the Apps Script as a Web app (Anyone).'); }
  if (!j.ok) throw new Error(j.error || 'Request failed');
  return j;
}

/* "admin" | "management" | "collector" - from the server, cached for 5 minutes in this browser tab */
export async function getRole(user) {
  const k = 'scm_role_' + user.uid, now = Date.now();
  try { const c = JSON.parse(sessionStorage.getItem(k) || 'null'); if (c && now - c.t < 300000) return c.r; } catch (e) {}
  const r = await api(user, 'whoami');
  try { sessionStorage.setItem(k, JSON.stringify({r:r.role, t:now})); } catch (e) {}
  return r.role;
}
