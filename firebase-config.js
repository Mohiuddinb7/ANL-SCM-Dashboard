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
