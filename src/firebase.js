import firebase from 'firebase';

// Initialize Firebase
const config = {
    apiKey: "AIzaSyAHmKXpcr1N6aAPTJqcTyzwgWLuyW0CUro",
    authDomain: "gilmoremood.firebaseapp.com",
    databaseURL: "https://gilmoremood.firebaseio.com",
    projectId: "gilmoremood",
    storageBucket: "gilmoremood.appspot.com",
    messagingSenderId: "911837512714",
    appId: "1:911837512714:web:94359121c98b124d650bf3"
};
firebase.initializeApp(config);

// this exports the CONFIGURED version of firebase
export default firebase;
