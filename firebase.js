// Import the functions you need from the SDKs you need
const firebase = require("firebase");
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBhm0s6SJlZaCWnpCfrXO5kuKgylRy0VVY",
  authDomain: "robo-investimentos.firebaseapp.com",
  projectId: "robo-investimentos",
  storageBucket: "robo-investimentos.appspot.com",
  messagingSenderId: "996644907770",
  appId: "1:996644907770:web:a26ad7e2c2ec80edbdb743"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const User = db.collection("Users");

module.exports = User;