import React from 'react'
import "./login.scss"
import { useAuth } from './authContext'

function Login() {
    const { login, logout } = useAuth()

    const googleIconURL = "https://firebasestorage.googleapis.com/v0/b/products-inventory-275.appspot.com/o/google-icon-logo.png?alt=media&token=39d574b2-1ef1-45ad-af80-3c05a0df9670"
    return (
        <div className="login">
            <div className="login_body">
                <h1>Products Inventory</h1>
                <button onClick={login}>
                    <img src={googleIconURL} alt="Google Icon"/>
                    <p>Sign in with Google</p>
                </button>
            </div>
        </div>
    )
}

export default Login
