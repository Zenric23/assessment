// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA79_q4No6J0mcjvU4TJrga8ps8NYbp64Q",
  authDomain: "zenric-s-assessment.firebaseapp.com",
  projectId: "zenric-s-assessment",
  storageBucket: "zenric-s-assessment.appspot.com",
  messagingSenderId: "560005674857",
  appId: "1:560005674857:web:9971dd26a08b9860216ff8"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const database = getFirestore(app);