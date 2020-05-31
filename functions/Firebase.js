const firebase = require('firebase');
require('firebase/auth');

const config = {
    apiKey: "AIzaSyBHJk6Z4bbkQIB0BSn4rRdewvVzCDnm9_o",
    authDomain: "kahusayanportal.firebaseapp.com",
    databaseURL: "https://kahusayanportal.firebaseio.com",
    projectId: "kahusayanportal",
    storageBucket: "kahusayanportal.appspot.com",
    messagingSenderId: "162435559210",
    appId: "1:162435559210:web:c0a1a439945663bdebf853",
    measurementId: "G-QJLHTVMMFC"
}

firebase.initializeApp(config);

module.exports = firebase;
