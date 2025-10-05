import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: 'AIzaSyAuevkemTTCmsr8dd9raFmrSnxGHXOaTOM',
  authDomain: 'klartopedia-staging.firebaseapp.com',
  projectId: 'klartopedia-staging',
  storageBucket: 'klartopedia-staging.appspot.com',
  messagingSenderId: '746886112169',
  appId: '1:746886112169:web:dde279083cdca7de6edab8',
  measurementId: 'G-M9RG2Q7GMJ',
};

const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
export default app;
