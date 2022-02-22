import React from 'react'
import { Outlet, Navigate, useLocation } from 'react-router-dom'
import Navbar from './navbar/navbar'
import { useAuth } from './auth/authContext';
import { ShowNavbarProvider } from './navbar/navbarContext';


function ProtectedRoutes() {
    const { currentUser } = useAuth()

    return currentUser ?
        <ShowNavbarProvider>
            <Navbar /> <Outlet />
        </ShowNavbarProvider> :
        <Navigate to="/" state={{ from: useLocation() }} />
}

export default ProtectedRoutes
