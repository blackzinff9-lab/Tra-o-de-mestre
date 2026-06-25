// ====== MODO DEMO – FIREBASE DESATIVADO ======
console.log('🔒 TraceMaster em modo DEMO (sem autenticação)');

// Desativa completamente o Firebase
let auth = null;
let db = null;
let firebaseOk = false;

// Bloco Firebase comentado – para reativar, descomente e substitua as credenciais
/*
const firebaseConfig = {
    apiKey: "SUA_API_KEY",
    authDomain: "SEU_PROJETO.firebaseapp.com",
    projectId: "SEU_PROJETO",
    storageBucket: "SEU_PROJETO.appspot.com",
    messagingSenderId: "SEU_ID",
    appId: "SEU_APP_ID"
};
try {
    firebase.initializeApp(firebaseConfig);
    auth = firebase.auth();
    db = firebase.firestore();
    firebaseOk = true;
    console.log('Firebase inicializado.');
} catch(e) {
    console.warn('Firebase não configurado:', e);
}
*/
