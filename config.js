import * as firebase from 'firebase';
require('@firebase/firestore');
var firebaseConfig = {
    apiKey: "AIzaSyB3G54xCyYb-BceNa8YJkyVZhhPisschcg",
    authDomain: "wily-2db99.firebaseapp.com",
    databaseURL: "https://wily-2db99.firebaseio.com",
    projectId: "wily-2db99",
    storageBucket: "wily-2db99.appspot.com",
    messagingSenderId: "528995131750",
    appId: "1:528995131750:web:5cd9ce43b9f7440fe368a7"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  export default firebase.firestore();