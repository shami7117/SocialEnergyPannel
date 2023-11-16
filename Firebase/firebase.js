// Import the functions you need from the SDKs you need
import { initializeApp, } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { FirebaseApp } from "firebase/app";
import firebase from 'firebase/app';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBQPLKUnWxrSQSDDqp7mfes8zEy-CjKLEo",
  authDomain: "social-energy-9fbfc.firebaseapp.com",
  projectId: "social-energy-9fbfc",
  storageBucket: "social-energy-9fbfc.appspot.com",
  messagingSenderId: "645569564657",
  appId: "1:645569564657:web:1660a4e6d9204140e67e50",
  measurementId: "G-H8YS9ZNRPG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);

export const auth = getAuth(app);

