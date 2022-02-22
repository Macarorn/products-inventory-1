import React, { useState, useEffect, useRef } from 'react'
import "./navbar.scss"
import { Link, useNavigate } from "react-router-dom";
import { HiMenu } from "react-icons/hi";
import { FaUserCircle } from "react-icons/fa";
import { FiLogOut } from "react-icons/fi";
import { IconButton } from "@material-ui/core";
import SearchIcon from '@mui/icons-material/Search';
import BarChartIcon from '@mui/icons-material/BarChart';
// import { StoreIcon } from "@material-ui/icons-material";
import StoreIcon from '@mui/icons-material/Store';
import { RiFileList3Line } from "react-icons/ri";
import { MdPriceCheck } from 'react-icons/md';
import { useAuth } from '../auth/authContext';
import { useClickOutside } from '../utils';
import { useShowNavbar } from './navbarContext';
import { BiPurchaseTagAlt } from 'react-icons/bi';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
// import User from './user';

// import auth from "../fakeAuth";



function Navbar() {
    // const [showNavbar, setShowNavbar] = useState(false)
    const { logout, currentUser, dbUser } = useAuth()
    const navigate = useNavigate()
    const navRef = useRef(null)
    const { showNavbar, setShowNavbar } = useShowNavbar()
    const [ userModal, setUserModal ] = useState(false)
    const [photoURL, setPhotoURL] = useState("")

    // useEffect(() => {
    // if(!authContext.currentUser){

    // navigate("/")
    // }
    // }, [authContext.currentUser])

    useEffect(() => {
        setPhotoURL(dbUser?.photoURL? dbUser.photoURL : "")
    }, [dbUser])

    useClickOutside(navRef, () => { setShowNavbar(false) })

    return (<>

        <div className={`${showNavbar ? "darkBackground" : ""}`}></div>

        {/* <User modalState={userModal} setModalState={setUserModal} /> */}

        <nav ref={navRef} className={`navbar ${showNavbar ? "showText" : ""}`}>
            <div className={`menu_bar ${showNavbar ? "showText" : ""}`} onClick={() => setShowNavbar((showNavbar: boolean) => !showNavbar)}>
                <div className="bar">

                    <IconButton >
                        <HiMenu />
                    </IconButton>
                    <span className="navbar_li_text">
                        {/* <p className="navTitle">
                            Inventory
                        </p> */}
                    </span>
                </div>
                {/* <span className="toolTip">Menu</span> */}
            </div>
            <ul onClick={() => { setShowNavbar(false) }} className={`navUl`}>

                <li className="navbar_li navbar_user"><Link to="/profile">
                    <IconButton>
                        {photoURL == "" ? <FaUserCircle />:<img src={photoURL} />}
                    </IconButton>


                    <span className="navbar_li_text">
                        <p>Profile</p>
                    </span>
                </Link>
                    <span className="toolTip">Profile</span>
                </li>
                
                <li className="navbar_li"> <Link to="/stats">
                    <IconButton> <BarChartIcon /> </IconButton>
                    <span className="navbar_li_text">
                        <p>Stats</p>
                    </span>
                </Link>
                    <span className="toolTip">Stats</span>
                </li>

                <li className="navbar_li"> <Link to="/products">
                    <IconButton> <ShoppingCartIcon /> </IconButton>
                    <span className="navbar_li_text">
                        <p>Products</p>
                    </span>
                </Link>
                    <span className="toolTip">Products</span>
                </li>

                <li className="navbar_li"> <Link to="/purchases">
                    <IconButton> <BiPurchaseTagAlt /> </IconButton>
                    <span className="navbar_li_text">
                        <p>Purchases</p>
                    </span>
                </Link>
                    <span className="toolTip">Purchases</span>
                </li>

                <li className="navbar_li"> <Link to="/sales">
                    <IconButton> <MdPriceCheck /> </IconButton>
                    <span className="navbar_li_text">
                        <p>Sales</p>
                    </span>
                </Link>
                    <span className="toolTip">Sales</span>
                </li>

                {/* <li className="navbar_li"> 
                    
                    <span className="navbar_li_text">
                        <p>Log Out</p>
                    </span>
                
                    <span className="toolTip">Log Out</span>
                </li> */}

                

            </ul>
        </nav>
    </>)
}

export default Navbar
