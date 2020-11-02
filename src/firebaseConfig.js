// For Firebase JS SDK v7.20.0 and later, measurementId is optional
import firebase from 'firebase';

const firebaseApp = firebase.initializeApp({
    apiKey: "AIzaSyCZTllvpEyGTjzAZhWUmHpaGokKFZEaqyU",
    authDomain: "instagram-clone-react-1e429.firebaseapp.com",
    databaseURL: "https://instagram-clone-react-1e429.firebaseio.com",
    projectId: "instagram-clone-react-1e429",
    storageBucket: "instagram-clone-react-1e429.appspot.com",
    messagingSenderId: "338718017862",
    appId: "1:338718017862:web:00048cb0ee69ae2e9b3d47",
    measurementId: "G-JD08Y70QK5"
})

const db = firebaseApp.firestore();
const auth = firebase.auth();
const storage = firebase.storage()

export { db, auth, storage };
