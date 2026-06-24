// Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAIbhdlmdV0UUfqmpy8Fp1Qq",
    authDomain: "tracomestre-88a5c.firebaseapp.com",
    projectId: "tracomestre-88a5c",
    storageBucket: "tracomestre-88a5c.firebasestorage.app",
    messagingSenderId: "661742336751",
    appId: "1:661742336751:web:9b0cc7e40bdc201ebaf91a",
    measurementId: "G-GZCSZ5CN5W"
};
let auth = null, db = null, firebaseOk = false;
try {
    if (firebaseConfig.apiKey !== 'SUA_API_KEY') {
        firebase.initializeApp(firebaseConfig);
        auth = firebase.auth();
        db = firebase.firestore();
        firebaseOk = true;
    }
} catch(e) { console.warn('Firebase não configurado:', e); }
