import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyCZ_ooaQaIwbrqKXK2lbL0zK4j4BLRwEb0",
    authDomain: "interiordesign-prab.firebaseapp.com",
    projectId: "interiordesign-prab",
    storageBucket: "interiordesign-prab.appspot.com",
    messagingSenderId: "330230494635",
    appId: "1:330230494635:web:8b0020b740e0fe0d2d4eee"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

export { db, storage };
