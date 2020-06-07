const firebase = require('firebase');
require('firebase/auth');
require('firebase/database');
require('firebase/firebase-storage');

const config = {
    apiKey: "",
    authDomain: "",
    databaseURL: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: "",
    measurementId: ""
}

firebase.initializeApp(config);

module.exports = firebase;
