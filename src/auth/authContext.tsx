import React, { useContext, useState, useEffect } from "react"
import { auth, googleProvider } from "../firebase"
import { signInWithPopup } from "firebase/auth"



const AuthContext = React.createContext<any>(null)

export function useAuth() {
    return useContext(AuthContext)
}

export function AuthProvider({ children }: any) {
    const [currentUser, setCurrentUser] = useState<any>()
    const [products, setProducts] = useState([])
    const [dbUser, setdbUser] = useState()

    function login() {
        return signInWithPopup(auth, googleProvider)
    }

    function logout() {
        return auth.signOut()
    }

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(user => {
            setCurrentUser(user)
            setProducts([])
        })
        return unsubscribe
    }, [])


    const value = {
        setCurrentUser,
        currentUser,
        login,
        logout,
        products,
        setProducts,
        dbUser,
        setdbUser
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

