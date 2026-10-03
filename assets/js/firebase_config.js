import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
import { getDatabase, ref, push, onValue, set, update, remove } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-database.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-analytics.js";

const firebaseConfig = {
  apiKey: "AIzaSyD0eOK9gCPyN8jDVD_YJjZmJZhV010D30A",
  authDomain: "inventory-5180a.firebaseapp.com",
  databaseURL: "https://inventory-5180a-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "inventory-5180a",
  storageBucket: "inventory-5180a.firebasestorage.app",
  messagingSenderId: "68195106178",
  appId: "1:68195106178:web:9b0d60ae02b46dcb99239b",
  measurementId: "G-BQRFG73GZP"
  };

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

// Export db dan fungsi-fungsi Firebase agar bisa dipakai di file JS lain
export { auth, db, ref, push, onValue, set, update, remove, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged};
