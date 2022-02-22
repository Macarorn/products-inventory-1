import React, { useRef, useState, useEffect } from 'react'
import "./addPurchase.scss"
import { useClickOutside, regex, getKeyByValue, getISOyearMonth, getISOyear, incremetObjectValue } from '../utils'
import CloseIcon from '@mui/icons-material/Close';
import { getDoc, doc, addDoc, collection, serverTimestamp, writeBatch, runTransaction, updateDoc, increment, Timestamp, query, WriteBatch, Transaction } from 'firebase/firestore';
import { useAuth } from '../auth/authContext';
import { db } from '../firebase';
import SwitchButton from '../components/switchButton';

function AddPurchase({ modalState, dbUser }: any) {
    const { currentUser } = useAuth()
    const [showAddPurchase, setShowAddPurchase] = modalState
    const [productId, setProductId] = useState("")
    const [qtyPurchased, setQtyPurchased] = useState("")
    const [useDefaultCost, setuseDefaultCost] = useState(true)
    const [productFound, setProductFound] = useState<any>()
    const [customCost, setCustomCost] = useState<string>("")
    const [productRef, setProductRef] = useState<any>()
    // const [date, setDate] = useState<any>()

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
    const statsBatchUpdate = async (transaction: Transaction, id: string, inputQtyPurchased: number, totalCost: number) => {
        const totalStatsRef = doc(db, "users", currentUser.uid, "stats", `${id}`)
        const totalStatsSnap = await getDoc(totalStatsRef)

        if (totalStatsSnap.exists()) {
            const purchasesByCategory = totalStatsSnap.data().purchasesByCategory || {}

            transaction.update(totalStatsRef, {
                purchasesByCategory: incremetObjectValue(purchasesByCategory, productFound.category, inputQtyPurchased),

                purchases: increment(inputQtyPurchased),
                invested: increment(totalCost)
            })
        } else {
            transaction.set(totalStatsRef, {
                purchasesByCategory: {
                    [`${productFound.category}`]: inputQtyPurchased
                },
                purchases: inputQtyPurchased,
                invested: totalCost
            })
        }
    }
    const addPurchase = async (e: any) => {
        e.preventDefault()
        if (!productFound) return

        await updateDoc(doc(db, "users", currentUser.uid), {
            lastSeen: serverTimestamp()
        })


        const purchasesRef = collection(db, "users", `${currentUser.uid}`, "purchases")
        const newPurchaseRef = doc(purchasesRef)

        const userLastSeenTimestamp: Timestamp = dbUser?.lastSeen
        const userLastSeenDate: Date = dbUser?.lastSeen?.toDate()


        const name = productFound.name
        const nameAsArray = productFound.nameAsArray
        const photoURL = productFound.photoURL

        const parseIntQtyPurchased = parseInt(qtyPurchased)
        const inputQtyPurchased = parseIntQtyPurchased || parseIntQtyPurchased == 0 ? Math.max(1, parseIntQtyPurchased) : 1

        const parseIntCustomCost = parseInt(customCost)
        const inputCustomCost = parseIntCustomCost || parseIntCustomCost == 0 ? Math.max(0, parseIntCustomCost) : 0

        const cost = useDefaultCost ? productFound.cost : inputCustomCost
        const totalCost = cost * inputQtyPurchased

        const categoryId = productFound.category



        const newPurchaseData = {
            name: name,
            nameAsArray: nameAsArray,
            productId: productId,
            photoURL: photoURL,
            qtyPurchased: inputQtyPurchased,
            cost: cost,
            category: categoryId,
            totalCost: totalCost,
            timestamp: userLastSeenTimestamp
        }

        try {
            await runTransaction(db, async transaction => {
                const stockRef = doc(db, "users", currentUser.uid, "stats", "stock")
                const productDoc: any = await transaction.get(productRef);

                if (productDoc.data().qty == 0) {
                    transaction.update(stockRef, {
                        productsOutOfStock: increment(-1)
                    })
                }
                transaction.update(stockRef, {
                    productsInStock: increment(inputQtyPurchased)
                })
                transaction.update(productRef, {
                    qty: increment(inputQtyPurchased)
                })
                transaction.set(newPurchaseRef, newPurchaseData)

                await statsBatchUpdate(transaction, "allTime", inputQtyPurchased, totalCost)

                await statsBatchUpdate(transaction, getISOyear(userLastSeenDate), inputQtyPurchased, totalCost)

                await statsBatchUpdate(transaction, getISOyearMonth(userLastSeenDate), inputQtyPurchased, totalCost)

            })
        } catch (error) { console.error(error) }

        setProductId("")
    }

    useEffect(() => {
        if (productId.length == 5) {
            searchProduct()
            return
        }
        setProductFound(null)

    }, [productId])


    const addPurchaseRef = useRef(null)
    useClickOutside(addPurchaseRef, () => { setShowAddPurchase(false) })
    return (
        <div className={showAddPurchase ? "modal" : "hide"}>
            <div ref={addPurchaseRef} className="addPurchase">
                <div className="addPurchaseHeader">
                    <CloseIcon onClick={() => { setShowAddPurchase(false) }} />
                    <h2>Add Purchase</h2>
                </div>
                <div className={`${productFound ? "addPurchaseProductInfo" : "hide"}`}>
                    <img src={`${productFound?.photoURL}`} alt="Product Img" />
                    <span>
                        <h4>Name:</h4>
                        <p> {productFound?.name} </p>
                    </span>
                    <span>
                        <h4>Cost:</h4>
                        <p> {productFound?.cost} </p>
                    </span>
                </div>


                <form onSubmit={addPurchase} className="addPurchaseForm">
                    <label>
                        <h4> Product Id:</h4>
                        <input type="text" value={productId} onChange={e => { setProductId(e.target.value.trim()) }} />
                    </label>
                    <div className={`${productFound ? "addPurchaseDetails" : "hide"}`}>

                        <label>
                            <h4> Qty Purchased:</h4>
                            <input type="text" value={qtyPurchased} onChange={e => {
                                let regexInput = e.target.value.replace(regex, "")
                                setQtyPurchased(regexInput)
                            }} />
                        </label>

                        <span>
                            <h4>Use Default Cost</h4>
                            <SwitchButton state={[useDefaultCost, setuseDefaultCost]} />
                        </span>

                        <label className={`${useDefaultCost ? "hide" : ""}`} >
                            <h4>Product Cost:</h4>

                            <input type="text" value={customCost} onChange={e => {
                                let regexInput = e.target.value.replace(regex, "")
                                setCustomCost(regexInput)
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

export default AddPurchase
