const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore/lite');

const firebaseConfig = {
    apiKey: "AIzaSyBhm0s6SJlZaCWnpCfrXO5kuKgylRy0VVY",
    authDomain: "robo-investimentos.firebaseapp.com",
    projectId: "robo-investimentos",
    storageBucket: "robo-investimentos.appspot.com",
    messagingSenderId: "996644907770",
    appId: "1:996644907770:web:a26ad7e2c2ec80edbdb743"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

const docRef = collection(db, 'users');

async function create() {
    await docRef.add({
        first: 'Ada',
        last: 'Lovelace',
        born: 1815
    });
}

// Get a list of cities from your database
async function getCities(db) {
    const citiesCol = collection(db, 'cities');
    const citySnapshot = await getDocs(citiesCol);
    const cityList = citySnapshot.docs.map(doc => doc.data());
    return cityList;
}

// Get a list of cities from your database
async function addCity(db) {
    const citiesCol = collection(db, 'cities');
    const citySnapshot = await getDocs(citiesCol);
    const city = citySnapshot.add({
        name: 'Tokyo',
        country: 'Japan'
    });
    return city;
}

create();
// addCity();
// getCities(db);