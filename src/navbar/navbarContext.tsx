import React, { useState, useContext } from 'react'

export const ShowNavbarContext = React.createContext<any>(undefined)


export function useShowNavbar() {
    return useContext(ShowNavbarContext)
}


export function ShowNavbarProvider({ children }: any) {
    const [showNavbar, setShowNavbar] = useState(false)

    const value = {
        showNavbar,
        setShowNavbar
    }

    return (
        <ShowNavbarContext.Provider value={value}>
            {children}
        </ShowNavbarContext.Provider>
    )
}