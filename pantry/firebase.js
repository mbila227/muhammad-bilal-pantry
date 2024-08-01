// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";

import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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

const firestore = getFirestore(app);

export {firestore}