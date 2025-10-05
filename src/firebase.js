// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCqiEZ1n_UdmDn2PPEEizkw5BommJMRHMM",
  authDomain: "anatomy-sgd-4a703.firebaseapp.com",
  databaseURL: "https://anatomy-sgd-4a703-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "anatomy-sgd-4a703",
  storageBucket: "anatomy-sgd-4a703.firebasestorage.app",
  messagingSenderId: "274607992817",
  appId: "1:274607992817:web:1a47d43edc2e7aab645e50",
  measurementId: "G-K570C59QGG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getDatabase(app);

export { app, analytics, firebaseConfig, db };