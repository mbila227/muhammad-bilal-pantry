// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAZqRCbL2W8E2yYYleQ2njRyHNU8tTOQQA",
  authDomain: "inventory-management-9cde2.firebaseapp.com",
  projectId: "inventory-management-9cde2",
  storageBucket: "inventory-management-9cde2.appspot.com",
  messagingSenderId: "686792224673",
  appId: "1:686792224673:web:a2f9e4506c7a51c63ee5e0",
  measurementId: "G-XFQH28LRVL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);


// Initialize Firebase Authentication and Firestore
const auth = getAuth(app);
const firestore = getFirestore(app);
const provider = new GoogleAuthProvider();



export { auth, firestore };
