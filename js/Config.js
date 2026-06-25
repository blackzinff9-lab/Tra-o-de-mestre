// ====== FIREBASE DESATIVADO (MODO DEMO) ======
// Para ativar o Firebase, descomente o bloco abaixo e substitua pelas suas credenciais.

let auth = null;
let db = null;
let firebaseOk = false;

/*
// === BLOCO FIREBASE (COMENTADO) ===
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
// === FIM DO BLOCO FIREBASE ===
*/

// Força o modo demo (sempre pula a tela de login)
console.log('Modo DEMO ativado. Login desabilitado.');
