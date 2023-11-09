
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { GoogleAuthProvider, getAuth, onAuthStateChanged, signInWithPopup } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDMc4A051EM1uT70XeN77G4ewF-u57EdkY",
  authDomain: "dandelion-c0f03.firebaseapp.com",
  projectId: "dandelion-c0f03",
  storageBucket: "dandelion-c0f03.appspot.com",
  messagingSenderId: "445762632561",
  appId: "1:445762632561:web:c44e8baec1839857e794d0",
  measurementId: "G-XL45RBXRP8"
};


const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const auth = getAuth(app);
export const  googleAuthProvider = new GoogleAuthProvider();
googleAuthProvider.setCustomParameters({
    prompt: 'select_account'
})

export const signIn = () => signInWithPopup(auth, googleAuthProvider);
export const onAuthStateChanged2 = (cb) => onAuthStateChanged(auth, cb);

