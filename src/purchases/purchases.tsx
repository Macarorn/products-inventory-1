import React, { useState, useEffect, useRef } from 'react'
import "./purchases.scss"
import "../components/filtersStyles.scss"
import PurchasePreview from './purchasePreview'
import PurchaseCard from './purchaseCard'
import SelectDate from '../components/selectDate'
import TextSearch from '../components/textSearch'
import SwitchButton from '../components/switchButton'
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import SelectHeader from '../components/selectHeader'
import { HiOutlineSwitchVertical } from "react-icons/hi"
import CloseIcon from '@mui/icons-material/Close';
import { useClickOutside, getNextMonth } from '../utils'
import { useAuth } from '../auth/authContext'
import RadioButtons from '../components/radioButtons'
import AddPurchase from './addPurchase'
import { collection, where, query, Timestamp, getDocs } from 'firebase/firestore'
import { db } from '../firebase'


function Purchases() {
    const { currentUser, dbUser } = useAuth()
    const [purchases, setPurchases] = useState<any[]>([])
    const [showAddPurchase, setshowAddPurchase] = useState(false)
    const [purchaseSelected, setPurchaseSelected] = useState(null)
    const [showFilters, setShowFilters] = useState(false)
    const [applyDateFilter, setApplyDateFilter] = useState(false)
    const [category, setCategory] = useState("")
    const placeholderDate = new Date()
    const month = placeholderDate.getMonth() + 1
    const placeholderMonth = month < 10 ? 0 + "" + month : month
    const [inputDate, setInputDate] = useState<any>([
        `${placeholderMonth}/1/${placeholderDate.getFullYear()}`
    ])
    const [textState, setTextState] = useState("")
    const [searchById, setSearchById] = useState(false)
    const [categories, setCategories] = useState<string[]>([""])



    const getPurchasesById = async () => {
        const purchaseRef = collection(db, "users", `${currentUser.uid}`, "purchases")
        const q = query(purchaseRef, where("productId", "==", textState))
        const purchaseSnap = await getDocs(q)


        const collectionPurchases: any = []
        purchaseSnap.forEach(purchase => {
            collectionPurchases.push(purchase.data())
        })
        setPurchases(collectionPurchases)
    }

    const searchData = async () => {
        if(searchById){
            getPurchasesById()
            return
        }

        const purchasesRef = collection(db, "users", `${currentUser.uid}`, "purchases")

        const queryConstraints = [
            where("nameAsArray", "array-contains", textState.toLowerCase())
        ]
        if (applyDateFilter) {
            let startDateTimestamp = Timestamp.fromDate(new Date(inputDate[0]))
            let endDateTimestamp
            if (inputDate.length == 1) {
                let nextMonth = getNextMonth(inputDate[0])
                endDateTimestamp = Timestamp.fromDate(new Date(nextMonth))
            } else {
                endDateTimestamp = Timestamp.fromDate(new Date(inputDate[1]))
            }
            queryConstraints.push(where("timestamp", ">=", startDateTimestamp))
            queryConstraints.push(where("timestamp", "<=", endDateTimestamp))
        }

        if (category !== "") {
            queryConstraints.push(where("category", "==", category))
        }

       

        let q = query(purchasesRef, ...queryConstraints)

        const queryPurchasesSnapshot = await getDocs(q)

        const purchasesSnap: any = []
        queryPurchasesSnapshot.forEach(product => {
            purchasesSnap.push(product.data())
        })

        purchasesSnap.sort((a: any, b: any) => {
            if (a.timestamp.seconds > b.timestamp.seconds) return 1
            if (a.timestamp.seconds < b.timestamp.seconds) return -1
            return 0
        })
        setPurchases(purchasesSnap)
        setTextState("")
    }

 
    useEffect(() => {
        const dbCategoriesList = []
        const dbCategories = dbUser?.categories ? dbUser.categories : {}
        for (const key in dbCategories) {
            dbCategoriesList.push(dbCategories[key])
        }
        setCategories(dbCategoriesList)

        searchData().catch(console.error)
        
    }, [showAddPurchase, showFilters])


    // const categories = dbUser?.categories ? dbUser.categories : {} 

    const filtersRef = useRef(null)
    useClickOutside(filtersRef, () => { setShowFilters(false) })

    return (
        <div className="page_nav_margin">
            <AddPurchase modalState={[showAddPurchase, setshowAddPurchase]} dbUser={dbUser} />
            <PurchaseCard purchaseSelected={purchaseSelected} setPurchaseSelected={setPurchaseSelected} user={dbUser} />
            <div className="purchases_title">
                <h2>Purchases Report</h2>
            </div>


            <div className="purchases_body">

                <div className={`${showFilters ? "modal" : "hide"}`}>
                    <div ref={filtersRef} className="filtersCard">

                        <div className="filtersCardBody">


                        <div className="filtersCardHeader">
                            <span>
                                <FilterAltIcon />
                                <p>Filters</p>
                            </span>
                            <CloseIcon className="filtersCardClose" onClick={() => { setShowFilters(false) }} />
                        </div>

                        <div className="filtersCardInputs">
                            <RadioButtons options={categories} optionState={[category, setCategory]} />

                            <div className="filtersCardApplyDate">
                                <p>Date Filter</p>
                                <SwitchButton state={[applyDateFilter, setApplyDateFilter]} />
                            </div>
                            <SelectDate className={applyDateFilter ? "" : "hide"} setDate={setInputDate} />
                        </div>
                        </div>

                    </div>
                </div>

                <div className="filtersPanel">

                    <div className="filterPanelRows">

                        <SelectHeader state={[showFilters, setShowFilters]} title="Filters" />
                        <button onClick={()=>{
                            setshowAddPurchase(true)
                        }} className="filterPanelButtons">Add Purchase</button>

                    </div>

                    <div className="filterPanelRows" >

                        <div className="flex">
                            <div className="filterPanelToggleSearchBy" onClick={() => { setSearchById(searchById => !searchById) }}>
                                <HiOutlineSwitchVertical />
                                <p> {searchById ? "id" : "name"} </p>
                            </div>
                            <TextSearch onKeyUp={(e: any) => {
                                if (e.key == "Enter") {
                                    searchData()
                                }
                            }} placeholder={`Search by ${searchById ? "id" : "name"}`} textState={[textState, setTextState]} />

                        </div>

                        <button type="submit" className="filterPanelButtons" onClick={searchData} >Search</button>
                    </div>

                </div>


                <div className="tableContainer">
                    <table>

                        <thead>

                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Qty</th>
                                <th>Cost</th>
                            </tr>
                        </thead>
                        <tbody>
                            {purchases.map((purchase: any, key: number) => <PurchasePreview key={key} purchasedProduct={purchase} setPurchaseSelected={setPurchaseSelected} />)}
                        </tbody>

                    </table>
                </div>
            </div>
        </div>
    )
}

export default Purchases
