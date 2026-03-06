import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDdsAAaQqODov6VVxPGQhkd18U8iOvKAaQ",
  authDomain: "jeu-totem.firebaseapp.com",
  databaseURL: "https://jeu-totem-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "jeu-totem",
  storageBucket: "jeu-totem.firebasestorage.app",
  messagingSenderId: "572655056694",
  appId: "1:572655056694:web:ccef0314513e67b064e597"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
