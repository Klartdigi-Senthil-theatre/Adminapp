import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyAuevkemTTCmsr8dd9raFmrSnxGHXOaTOM',
  authDomain: 'klartopedia-staging.firebaseapp.com',
  projectId: 'klartopedia-staging',
  storageBucket: 'klartopedia-staging.appspot.com',
  messagingSenderId: '746886112169',
  appId: '1:746886112169:web:dde279083cdca7de6edab8',
  measurementId: 'G-M9RG2Q7GMJ',
  vapidKey: 'BMwh3pNeMvb7BEQRrxvLcfFD-qfUHlsWaiM_akjlY7zI93s1EY70LTt5RpA4jdAF9y7aqBELH0FLcEHPuB0G2Qo',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Storage and get a reference to the service
export const storage = getStorage(app);

export default app;
