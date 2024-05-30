// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDePOBT9Rekls0eKjhHXAXkFFx5cy02AfA",
  authDomain: "podstream-27164.firebaseapp.com",
  databaseURL: "https://podstream-27164-default-rtdb.firebaseio.com",
  projectId: "podstream-27164",
  storageBucket: "podstream-27164.appspot.com",
  messagingSenderId: "417779657093",
  appId: "1:417779657093:web:646689764c733df1effcec",
  measurementId: "G-9JTMMQ6ZMK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export default app;