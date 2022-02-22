import React, { useRef, useState, useEffect } from 'react'
import "./addSale.scss"
import { useClickOutside, regex, incremetObjectValue, getISOyear, getISOyearMonth } from '../utils'
import CloseIcon from '@mui/icons-material/Close';
import { getDoc, doc, addDoc, collection, serverTimestamp, runTransaction, writeBatch, Transaction, increment, updateDoc, Timestamp } from 'firebase/firestore';
import { useAuth } from '../auth/authContext';
import { db } from '../firebase';
import SwitchButton from '../components/switchButton';

function AddSale({ modalState, dbUser }: any) {
    const { currentUser } = useAuth()
    const [showAddSale, setShowAddSale] = modalState
    const [productId, setProductId] = useState("")
    const [qtySold, setQtySold] = useState("")
    const [useDefaultPrice, setuseDefaultPrice] = useState(true)
    const [productFound, setProductFound] = useState<any>()
    const [customPrice, setCustomPrice] = useState<string>("")
    const [productRef, setProductRef] = useState<any>()

    const searchProduct = async () => {
        const productDoc = doc(db, "users", `${currentUser.uid}`, "products", `${productId}`)
        const productSnap = await getDoc(productDoc)

        if (productSnap.exists()) {
            setProductFound(productSnap.data())
            setProductRef(productDoc)
            return
        }
        setProductFound(null)
        setProductRef(null)
        console.log("Searching...");

    }
    const statsBatchUpdate = async (transaction: Transaction, id: string, inputQtySold: number, totalIncome: number) => {
        const totalStatsRef = doc(db, "users", currentUser.uid, "stats", `${id}`)
        const totalStatsSnap = await getDoc(totalStatsRef)

        if (totalStatsSnap.exists()) {
            const salesByCategory = totalStatsSnap.data().salesByCategory || {}

            transaction.update(totalStatsRef, {
                salesByCategory: incremetObjectValue(salesByCategory, productFound.category, inputQtySold),

                sales: increment(inputQtySold),
                income: increment(totalIncome)
            })
        } else {
            transaction.set(totalStatsRef, {
                salesByCategory: {
                    [`${productFound.category}`]: inputQtySold
                },
                sales: inputQtySold,
                income: totalIncome
            })
        }
    }
    const addSale = async (e: any) => {
        e.preventDefault()
        if (!productFound) return

        await updateDoc(doc(db, "users", currentUser.uid), {
            lastSeen: serverTimestamp()
        })

        const userLastSeenTimestamp: Timestamp = dbUser?.lastSeen
        const userLastSeenDate: Date = dbUser?.lastSeen?.toDate()

        const salesRef = collection(db, "users", `${currentUser.uid}`, "sales")
        const newSaleRef = doc(salesRef)

        const name = productFound.name
        const nameAsArray = productFound.nameAsArray
        const photoURL = productFound.photoURL

        const parseIntQtySold = parseInt(qtySold)
        const inputQtySold = parseIntQtySold || parseIntQtySold == 0 ? Math.max(1, parseIntQtySold) : 1

        const parseIntCustomPrice = parseInt(customPrice)
        const inputCustomPrice = parseIntCustomPrice || parseIntCustomPrice == 0 ? Math.max(0, parseIntCustomPrice) : 0

        const price = useDefaultPrice ? productFound.price : inputCustomPrice
        const totalIncome = price * inputQtySold

        const newSoldata = {
            name: name,
            nameAsArray: nameAsArray,
            productId: productId,
            photoURL: photoURL,
            qtySold: inputQtySold,
            price: price,
            category: productFound.category,
            totalIncome: totalIncome,
            timestamp: userLastSeenTimestamp
        }


        try {
            await runTransaction(db, async transaction => {

                const stockRef = doc(db, "users", currentUser.uid, "stats", "stock")

                const productDoc: any = await transaction.get(productRef);
                const newQty = productDoc.data().qty - inputQtySold

                if (newQty >= 0) {
                    transaction.update(productRef, { qty: newQty })

                    await statsBatchUpdate(transaction, "allTime", inputQtySold, totalIncome)

                    await statsBatchUpdate(transaction, getISOyear(userLastSeenDate), inputQtySold, totalIncome)

                    await statsBatchUpdate(transaction, getISOyearMonth(userLastSeenDate), inputQtySold, totalIncome)

                    if (newQty == 0) {
                        transaction.update(stockRef, {
                            productsOutOfStock: increment(1)
                        })
                    }

                    transaction.set(newSaleRef, newSoldata)
                } else {
                    return Promise.reject("Sale cancelled, not enough quantity available ")
                }
            })

            // await addDoc(salesRef, newSoldata)

        } catch (e) { console.error(e) }



        setProductId("")
    }

    useEffect(() => {
        if (productId.length == 5) {
            searchProduct()
            return
        }
        setProductFound(null)
    }, [productId])


    const addSaleRef = useRef(null)
    useClickOutside(addSaleRef, () => { setShowAddSale(false) })
    return (
        <div className={showAddSale ? "modal" : "hide"}>
            <div ref={addSaleRef} className="addSale">
                <div className="addSaleHeader">
                    <CloseIcon onClick={() => { setShowAddSale(false) }} />
                    <h2>Add Sale</h2>
                </div>
                <div className={`${productFound ? "addSaleProductInfo" : "hide"}`}>
                    <img src={`${productFound?.photoURL}`} alt="Product Img" />
                    <span>
                        <h4>Name:</h4>
                        <p> {productFound?.name} </p>
                    </span>
                    <span>
                        <h4>Price:</h4>
                        <p> {productFound?.price} </p>
                    </span>
                    <span>
                        <h4>Qty Available:</h4>
                        <p> {productFound?.qty} </p>
                    </span>
                </div>


                <form onSubmit={addSale} className="addSaleForm">
                    <label>
                        <h4> Product Id:</h4>
                        <input type="text" value={productId} onChange={e => { setProductId(e.target.value.trim()) }} />
                    </label>
                    <div className={`${productFound ? "addSaleDetails" : "hide"}`}>

                        <label>
                            <h4> Qty Sold:</h4>
                            <input type="text" value={qtySold} onChange={e => {
                                let regexInput = e.target.value.replace(regex, "")
                                setQtySold(regexInput)
                            }} />
                        </label>

                        <span>
                            <h4>Use Default Price</h4>
                            <SwitchButton state={[useDefaultPrice, setuseDefaultPrice]} />
                        </span>

                        <label className={`${useDefaultPrice ? "hide" : ""}`} >
                            <h4>Product Price:</h4>

                            <input type="text" value={customPrice} onChange={e => {
                                let regexInput = e.target.value.replace(regex, "")
                                setCustomPrice(regexInput)
                            }} />
                        </label>

                        <div className="addProductButtons">

                            <button type="submit" className="addProductSubmitButton" >Submit</button>
                            <button type="reset" className="addProductResetButton">Clear Form</button>
                        </div>
                    </div>

                </form>
            </div>
        </div>
    )
}

export default AddSale
