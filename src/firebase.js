// src/firebase.js
import { initializeApp } from "firebase/app";
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCSkQsu3E0FhJLsqJhn7Ns88T0VZqkhY8E",
  authDomain: "t30app-f103f.firebaseapp.com",
  projectId: "t30app-f103f",
  storageBucket: "t30app-f103f.firebasestorage.app",
  messagingSenderId: "1022144023831",
  appId: "1:1022144023831:web:718de93c117f09204abb52",
  measurementId: "G-WGY7D2V04Z"
};

// تشغيل التطبيق
const app = initializeApp(firebaseConfig);

// تفعيل الكاش المحلي (Offline Persistence) عشان الداتا تفتح وأنت أوفلاين وتعمل تحديث أوتوماتيك بس تشبك
export const database = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});