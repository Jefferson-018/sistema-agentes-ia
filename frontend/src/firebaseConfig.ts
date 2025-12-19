// Importa as funções do Google
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Suas Chaves Secretas (O DNA do Projeto)
const firebaseConfig = {
  apiKey: "AIzaSyDuHhUTOyqWOn0Jkkt2bzGlwkdxZ8Qj12Y",
  authDomain: "agente-ia-system.firebaseapp.com",
  projectId: "agente-ia-system",
  storageBucket: "agente-ia-system.firebasestorage.app",
  messagingSenderId: "866024270088",
  appId: "1:866024270088:web:98c9c80ef0babf75a464bd"
};

// Inicia a conexão
const app = initializeApp(firebaseConfig);

// Exporta o sistema de Autenticação para usarmos nas outras telas
export const auth = getAuth(app);