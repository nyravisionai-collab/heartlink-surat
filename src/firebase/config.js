import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import { getDatabase } from 'firebase/database'

const firebaseConfig = {
  apiKey: "AIzaSyAvL-Dc3A83UxebIVoBBwAOr3rKGMg7tFM",
  authDomain: "electricals-kart-164ba.firebaseapp.com",
  projectId: "electricals-kart-164ba",
  storageBucket: "electricals-kart-164ba.firebasestorage.app",
  messagingSenderId: "80825721292",
  appId: "1:80825721292:web:d4fda02c335c0713e27d69",
  databaseURL: "https://electricals-kart-164ba-default-rtdb.firebaseio.com",
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize services
const auth = getAuth(app)
const db = getFirestore(app)
const storage = getStorage(app)
const rtdb = getDatabase(app)

export { app, auth, db, storage, rtdb }
export default app
