import React, { useEffect} from 'react'
import "./app.scss"
import { Route, Routes, useNavigate, useLocation } from "react-router-dom";
import ProtectedRoutes from './ProtectedRoutes';
import { useAuth } from './auth/authContext';
import { doc, setDoc, onSnapshot, getDoc, serverTimestamp, DocumentReference, DocumentData } from 'firebase/firestore';
import { db } from './firebase';
import Login from './auth/login';
import Stats from './stats/stats';
import Sales from './sales/sales';
import Purchases from './purchases/purchases';
import Profile from './profile/profile';
import Products from './products/products';


function App() {
  const { setdbUser, currentUser, } = useAuth()
  const navigate = useNavigate()
  const location: any = useLocation()


  const setUserDoc = async (userRef: DocumentReference<DocumentData>) => {
    const userSnap = await getDoc(userRef)

    if (userSnap.exists()) return

    await setDoc(userRef, {
      name: currentUser.displayName,
      email: currentUser.email,
      photoURL: "",
      categories: {},
      lastSeen: serverTimestamp()
    })
  }


  useEffect(() => {
    if (!currentUser) return
    
    const userRef = doc(db, "users", currentUser.uid)

    setUserDoc(userRef).catch(console.error)


    // Get real time data from user
    const unSubscribe = onSnapshot(userRef, userSnapShot => {
      setdbUser(userSnapShot.data())
    }, error => console.error(error))


    // Redirect to dynamic route
    const route = location?.state?.from ? location.state.from : "/stats"
    navigate(route)

    
    return unSubscribe
  }, [currentUser])


  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<Login />} />

        <Route element={<ProtectedRoutes />} >

          <Route path="/stats" element={<Stats />} />

          <Route path="/products" element={<Products />} />

          <Route path="/sales" element={<Sales />} />

          <Route path="/purchases" element={<Purchases />} />

          <Route path="/profile" element={<Profile />} />

        </Route>
        
        <Route path="/*" element={<Login />} />

      </Routes>
    </div>
  )
}

export default App
