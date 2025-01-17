// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyCyrUG0CSiNBd76sf9PymlnVxhdqnt2Sw0",
    authDomain: "chat-app-797e0.firebaseapp.com",
    projectId: "chat-app-797e0",
    storageBucket: "chat-app-797e0.firebasestorage.app",
    messagingSenderId: "314168852640",
    appId: "1:314168852640:web:0c0b5da919523b0cb689c5",
    measurementId: "G-EFEST0CCBW"
  };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Gắn Web client ID vào Provider nếu cần
provider.setCustomParameters({
    client_id: "314168852640-jcqkhrieudkfod6sotkugqhl62pdjp6u.apps.googleusercontent.com",
});

export { auth, provider };
