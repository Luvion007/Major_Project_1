import firebase from 'firebase/app'
import "firebase/firestore"
import "firebase/auth"
import 'firebase/storage'


const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

  firebase.initializeApp(firebaseConfig)

  //making it into object

  const projectFirebase = firebase.firestore()
  const projectAuth = firebase.auth()
  const projectStorage = firebase.storage()
  const timestamp = firebase.firestore.Timestamp

  export {projectFirebase, projectAuth, projectStorage, timestamp, firebase}