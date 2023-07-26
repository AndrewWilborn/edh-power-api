import { initializeApp } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"
import admin from "firebase-admin"
import creds from "./firebaseCreds.js"
const app = initializeApp({credential: admin.credential.cert(creds)})
const auth = getAuth(app);
export default auth;