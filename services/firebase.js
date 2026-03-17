// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCcU-JBI7MZnJenvDlS5P1h7l8xJBTCQp8",
  authDomain: "loginbiblioteca-f3345.firebaseapp.com",
  projectId: "loginbiblioteca-f3345",
  storageBucket: "loginbiblioteca-f3345.firebasestorage.app",
  messagingSenderId: "108778633782",
  appId: "1:108778633782:web:0ce27e847d2cf018bcb697"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);