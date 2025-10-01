// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyChmC8Y7TCKcrE3UrTeVRrhBlAiEGKs-Ow",
  authDomain: "discussion-slot-scheduler.firebaseapp.com",
  databaseURL: "https://discussion-slot-scheduler-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "discussion-slot-scheduler",
  storageBucket: "discussion-slot-scheduler.firebasestorage.app",
  messagingSenderId: "658934009789",
  appId: "1:658934009789:web:24534b80b198ad0c924cd4",
  measurementId: "G-KCT9MFR0C5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export { app, analytics, firebaseConfig };