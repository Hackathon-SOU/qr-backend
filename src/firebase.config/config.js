// Import the functions you need from the SDKs you need
const {
    initializeApp
} = require("firebase/app");
const {
    getStorage,
    ref
} = require("firebase/storage");

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCxv9fgomPs0IGdSOefs8isz-IV4MzgqOY",
    authDomain: "qr-reg-web-app-ieee.firebaseapp.com",
    projectId: "qr-reg-web-app-ieee",
    storageBucket: "qr-reg-web-app-ieee.appspot.com",
    messagingSenderId: "547842804729",
    appId: "1:547842804729:web:51b5966727f986e9074b28"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Get a reference to the storage service, which is used to create references in your storage bucket
const storage = getStorage();

// Create a storage reference from our storage service
const storageRef = ref(storage);

module.exports = {
    storage,
    storageRef
}