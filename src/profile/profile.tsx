import React, { useEffect, useState, useRef } from 'react'
import "./profile.scss"
import "./editProfile.scss"

import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../auth/authContext';
import { useNavigate } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { FiLogOut } from 'react-icons/fi';
import { collection, getDocs, getDoc, doc, setDoc, onSnapshot, updateDoc, arrayRemove, query, where, writeBatch, arrayUnion } from 'firebase/firestore';
import { db, storage } from '../firebase';
import { FaUserCircle } from 'react-icons/fa';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useClickOutside, capEachWord, getKeyByValue, customID } from '../utils';

function Profile() {
    const { currentUser, logout, dbUser } = useAuth()
    const [image, setImage] = useState<any>()
    const [imageSrc, setImageSrc] = useState("")
    const navigate = useNavigate()
    const [newCategory, setNewCategory] = useState("")
    const [showEditProfile, setShowEditProfile] = useState(false)
    const [categories, setCategories] = useState<any>([])
    const [dbField, setdbField] = useState("")
    const [editedField, setEditedField] = useState("")


    let userRef = doc(db, "users", `${currentUser.uid}`)

    const addCategory = async (e: any) => {
        e.preventDefault()
        if (newCategory == "") return
        const formatedField = newCategory.toLowerCase().trim()
        
        const updatedCategories = dbUser?.categories ? dbUser.categories : {}
        if(getKeyByValue(updatedCategories, formatedField)) return 

        updatedCategories[`${customID(10)}`] = formatedField

        setNewCategory("")

        await updateDoc(userRef, {
            categories: updatedCategories
        })
    }


    const updateCategory = async () => {
        if(editedField == "") return

        const formatedField = editedField.toLowerCase().trim()

        const updatedCategories = dbUser.categories

        const categoryId = getKeyByValue(updatedCategories, dbField)

        updatedCategories[`${categoryId}`] = formatedField

        await updateDoc(userRef, {
            categories: updatedCategories
        })

        setdbField("")
    }

    const imageHandler = (e: any) => {
        setImageSrc("")
        const file = e.target.files[0]
        if (!file) return
        setImage(file)

        const reader = new FileReader()
        reader.onload = () => {
            if (reader.readyState === 2) {
                setImageSrc(reader.result as string)
            }
        }
        reader.readAsDataURL(e.target.files[0])
    }
    const updateImage = async () => {
        const photoRef = ref(storage, image.name)
        await uploadBytes(photoRef, image)

        let photoURL = await getDownloadURL(photoRef)

        await updateDoc(userRef, {
            photoURL: photoURL
        })
        setImage(null)
        setImageSrc("")
    }

    const deleteProfilePicture = async () => {
        await updateDoc(userRef, {
            photoURL: ""
        })
    }

    const submitName = async () => {
        if (editedField == "") return

        await updateDoc(userRef, {
            name: editedField
        })

        setdbField("")
    }

    useEffect(() => {
        if (image == null) return

        updateImage()

    }, [image])

    useEffect(() => {
        if (!dbUser) return

        if(dbUser.categories){
            let dbCategories = []
            for (const key in dbUser.categories) {
                dbCategories.push(dbUser.categories[key])
            }
            setCategories(dbCategories)
        }

        setEditedField(dbUser.name)
    }, [dbUser])

    useEffect(() => {
        // setCategories(dbUser?.categories)
        const capField = capEachWord(dbField)
        setEditedField(capField)
    }, [dbField])

    const editCardRef = useRef(null)
    useClickOutside(editCardRef, () => { setdbField("") })


    let photoURL = dbUser?.photoURL ? dbUser.photoURL : ""
    return (
        <div className="page_nav_margin" >
            <div className={`${showEditProfile ? "hide" : "profile"}`} >
                <div className="profileHeader">
                    <div className="profileHeaderPanel">
                        <LogoutIcon className="logoutIcon" onClick={() => {
                            navigate("/")
                            logout()
                        }} />
                        <h2>My Profile</h2>
                        <EditIcon className="editIcon" onClick={() => {
                            setShowEditProfile(true)
                        }} />

                    </div>
                    <div className="profileImgContainer">
                        <div className="profileImg">
                            {photoURL == "" ? <FaUserCircle /> : <img src={photoURL} />}
                        </div>
                    </div>
                    <div className="profileData">
                        <span>
                            <h4>Name:</h4>
                            <p> {dbUser.name} </p>
                        </span>
                        <span>
                            <h4>Email:</h4>
                            <p>{dbUser?.email}</p>
                        </span>
                    </div>
                </div>

                <div className="profileCategories">
                    <h3>Product Categories</h3>
                    <div className="profileCategoriesList">
                        {categories.map((category: string, key: number) => <div key={key}>
                            <p>{category}</p>
                        </div>)}
                    </div>
                    <form onSubmit={addCategory}>
                        <input type="text" value={newCategory} onChange={e => { setNewCategory(e.target.value) }} />
                        <button type="submit">Add Category</button>
                    </form>
                </div>

            </div>
            <div ref={editCardRef} className={`${showEditProfile ? "editProfile" : "hide"}`} >
                <div className="editProfileHeader">
                    <div className="editProfileHeaderPanel">
                        <ArrowBackIcon className="goBackIcon" onClick={() => {
                            setShowEditProfile(false)
                        }} />
                        <h2>Edit Profile</h2>
                    </div>
                    <div className="editProfileImgContainer">
                        <div className="editProfileImg">

                            <DeleteIcon className={`${photoURL != "" ? "editProfileImgDeleteIcon" : "hide"}`} onClick={deleteProfilePicture} />


                            {photoURL == "" ? <FaUserCircle /> : <img src={photoURL} />}
                            <label >
                                <input className="hide" type="file" accept="image/*" onChange={imageHandler} />
                                <EditIcon className="editProfileImgEditIcon" />
                            </label>
                        </div>
                    </div>

                    <div className="editProfileData">
                        <span>
                            <h4>Name:</h4>
                            <div className={`${dbField !== dbUser?.name ? "" : "hide"}`} >
                                <p> {dbUser?.name} </p>
                                <EditIcon className="editProfileDataEditIcon" onClick={() => { setdbField(dbUser?.name) }} />
                            </div>
                            <div className={`${dbField == dbUser?.name ? "editProfileNameInput" : "hide"}`}  >
                                <input type="text" value={editedField} onChange={e => { setEditedField(e.target.value) }} onKeyUp={e=>{
                                    if(e.key == "Enter"){
                                        submitName()
                                    }
                                }} />

                                <button type="submit" onClick={submitName}>Save</button>
                            </div>
                        </span>
                    </div>


                </div>
                <div className="editProfileCategories">
                    <h4>Categories:</h4>
                    {categories.map((category: string, key: number) => <div key={key} >

                        <div className={`${dbField != category ? "editProfileCategory" : "hide"}`}>
                            <p> {category} </p>
                            <span>
                                <EditIcon className="editProfileEditIcon" onClick={() => { setdbField(category) }} />
                            </span>
                        </div>

                        <div className={`${dbField == category ? "editProfileCategoryInput" : "hide"}`}>
                            <input type="text" value={editedField} onChange={e => { setEditedField(e.target.value) }} onKeyUp={e=>{
                                if(e.key == "Enter"){
                                    updateCategory()
                                }
                            }} />
                            <button onClick={updateCategory}>save</button>
                        </div>


                    </div>)}
                </div>
            </div>
        </div>
    )
}

export default Profile
