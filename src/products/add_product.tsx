import React, { useState, useRef, useEffect } from 'react'
import "./add_product.scss"
import { storage, db } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

import { IoMdClose } from 'react-icons/io';
import { MdDelete } from 'react-icons/md';



import { MdOutlineAddPhotoAlternate } from 'react-icons/md';
// import { useShowAddProduct } from '../context/showAddProduct';
import { useAuth } from '../auth/authContext';
import { setDoc, addDoc, collection, doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { useClickOutside, createKeywords, customID, getKeyByValue } from '../utils';
import CheckBoxes from '../components/checkBoxes';
import RadioButtons from '../components/radioButtons';

function AddProduct({ modalState, setModalState, categories }: any) {
    const { currentUser, dbUser } = useAuth()
    const scrollRef = useRef<null | HTMLDivElement>(null);
    // const { showAddProduct, setShowAddProduct } = useShowAddProduct()
    const [imageSrc, setImageSrc] = useState("")
    // const [fileURL, setFileURL] = useState("")
    const [image, setImage] = useState<any>(null)
    const [category, setCategory] = useState("")



    const createCustomID = async (IDlength: number) => {
        let id: string = customID(IDlength)
        let productRef = doc(db, 'users', `${currentUser.uid}`, 'products', id)
        let productSnap = await getDoc(productRef)

        while (productSnap.exists()) {
            id = customID(IDlength)
            productRef = doc(db, 'users', `${currentUser.uid}`, 'products', id)
            productSnap = await getDoc(productRef)
        }

        return id
    }

    const saveProduct = async (e: any) => {
        e.preventDefault()
        if (image === null) return

        const photoRef = ref(storage, image.name)
        await uploadBytes(photoRef, image)

        let photoURL = await getDownloadURL(photoRef)

        const dbCategories = dbUser?.categories? dbUser.categories : {}


        const name = e.target[1].value
        const lowerCaseName = name.toLowerCase()
        const nameAsArray = createKeywords(lowerCaseName)
        const description = e.target[2].value
        const cost = parseFloat(e.target[3].value)
        const price = parseFloat(e.target[4].value)
        const productID = await createCustomID(5)
        const productCategory = getKeyByValue(dbCategories, category)



        const productRef = doc(db, 'users', `${currentUser.uid}`, 'products', productID)
        await setDoc(productRef, {
            photoURL: photoURL,
            name: lowerCaseName,
            id: productID,
            nameAsArray: nameAsArray,
            description: description,
            cost: cost ? cost : 0,
            price: price ? price : 0,
            category: productCategory ? productCategory : "",
            qty: 0
        })

        await setDoc(doc(db, "users", currentUser.uid, "stats", "stock"),{
            productsOutOfStock: increment(1)
        },{
            merge: true
        })

        setModalState(false)
        setImageSrc("")
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

    useEffect(() => {
        // console.log(categories);


        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [modalState])

    // useEffect(() => {
    //     console.log(category);

    // }, [category])

    const addProductRef = useRef(null)
    useClickOutside(addProductRef, () => { setModalState(false) })

    return (
        <div className={`${modalState ? "modal" : "hide"}`}>
            <div ref={addProductRef} className="add_product_body">
                <IoMdClose className="add_product_close" onClick={() => setModalState(false)} />

                <div ref={scrollRef} className="image_preview">
                    <img src={imageSrc} alt="Image Preview" className={` ${imageSrc === "" ? "hide" : "image_preview_img"}`} />


                    <MdDelete onClick={() => setImageSrc("")} className={`image_preview_errase ${imageSrc === "" ? "hide" : ""}`} />

                    <label htmlFor="input_type_image" className={` ${imageSrc === "" ? "image_preview_placeholder" : "hide"}`} >
                        <MdOutlineAddPhotoAlternate />
                        Upload Photo
                    </label>
                </div>

                <div className="add_product_header">
                    <h2>Add Product</h2>

                </div>
                <form className="add_product_form" onSubmit={saveProduct}>
                    <input id="input_type_image" name="input_type_image" type="file" accept="image/*" onChange={imageHandler} />


                    <div className="inputBox inputText">
                        <label htmlFor="new_product_name">Name:</label>
                        <input required autoComplete="off" type="text" name="new_product_name" id="new_product_name" />
                    </div>
                    <div className="inputBox inputText">
                        <label className="labelTextarea" htmlFor="new_product_description">Description:</label>
                        <textarea autoComplete="off" name="new_product_description" id="new_product_description" ></ textarea>
                    </div>

                    <div className="inputBox">
                        <label htmlFor="new_product_invested">Purchase Cost:</label>
                        <span>

                            <input autoComplete="off" type="number" name="new_product_invested" id="new_product_invested" />
                        $
                        </span>
                    </div>
                    <div className="inputBox">
                        <label htmlFor="new_product_salePrice">Sale Price:</label>
                        <span>
                            <input autoComplete="off" type="number" name="new_product_salePrice" id="new_product_salePrice" />
                            $</span>
                    </div>


                    <div className="addProductCategories">
                        <p className="addProductCategories_p">Category:</p>
                        <RadioButtons options={categories} optionState={[category, setCategory]} />
                    </div>

                    <div className="buttons">

                        <button id="submit" type="submit">Save</button>
                        <button className="resetButton" id="resetButton" type="reset">Clear</button>
                    </div>

                </form>
            </div>
        </div>
    )
}

export default AddProduct
