import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";
import { getDatabase, ref } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBmxOwlZqbbX7BcLXDCJAaVkqKvIp3qU2c",
  authDomain: "prolaniscare-74544.firebaseapp.com",
  databaseURL: "https://prolaniscare-74544-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "prolaniscare-74544",
  storageBucket: "prolaniscare-74544.appspot.com",
  messagingSenderId: "503658861775",
  appId: "1:503658861775:web:d6a3d3793ccffb955b53ba"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const storage = getStorage(app)
export const firestore = getFirestore(app)
export const database = getDatabase(app)

export const usersRef = ref(database, "users/")
export const tolaksRef = ref(database, "tolak-ukurs/")
export const nutrisisRef = ref(database, "nutrisis/")
export const tipsMakananRef = ref(database, "tips/Makanan/")
export const tipsOlahragaRef = ref(database, "tips/Olahraga/")
export const resepNormalRef = ref(database, "reseps/resepnormal/")
export const resepObesitasRef = ref(database, "reseps/resepobesitas/")