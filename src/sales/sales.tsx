import React, { useState, useEffect, useRef } from 'react'
import "./sales.scss"
import "../components/filtersStyles.scss"
// import SalesPreview from './salesPreview'
import SalesCard from './salesCard'
import SelectDate from '../components/selectDate'
import TextSearch from '../components/textSearch'
import SwitchButton from '../components/switchButton'
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import SelectHeader from '../components/selectHeader'
import { HiOutlineSwitchVertical } from "react-icons/hi"
import CloseIcon from '@mui/icons-material/Close';
import CheckBoxes from '../components/checkBoxes'
import { useClickOutside, ENTER_KEYCODE, getNextMonth } from '../utils'
import { useAuth } from '../auth/authContext'
import AddSale from './addSale'
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore'
import { db } from '../firebase'
import SalesPreview from './salesPreview'
import RadioButtons from '../components/radioButtons'


function Sales() {
    const [sales, setSales] = useState([])
    const [showAddSale, setShowAddSale] = useState(false)
    const [saleSelected, setSaleSelected] = useState()
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
    const { currentUser, dbUser } = useAuth()
    const [searchById, setSearchById] = useState(false)
    const [categories, setCategories] = useState<string[]>([""])


    const getSalesById = async () => {
        const saleRef = collection(db, "users", `${currentUser.uid}`, "sales")
        const q = query(saleRef, where("productId", "==", textState))
        const salesSnap = await getDocs(q)


        const collectionSales: any = []
        salesSnap.forEach(sale => {
            collectionSales.push(sale.data())
        })
        setSales(collectionSales)
    }

    const searchData = async () => {
        if (searchById) {
            getSalesById()
            return
        }

        const salesRef = collection(db, "users", `${currentUser.uid}`, "sales")

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

        let q = query(salesRef, ...queryConstraints)

        const querySalesSnapshot = await getDocs(q)

        const salesSnap: any = []
        querySalesSnapshot.forEach(product => {
            salesSnap.push(product.data())
        })

        salesSnap.sort((a: any, b: any) => {
            if (a.timestamp.seconds > b.timestamp.seconds) return 1
            if (a.timestamp.seconds < b.timestamp.seconds) return -1
            return 0
        })
        setSales(salesSnap)
        setTextState("")
    }

    useEffect(() => {
        if (!dbUser) return
        const dbCategoriesList = []
        const dbCategories = dbUser?.categories ? dbUser.categories : {}
        for (const key in dbCategories) {
            dbCategoriesList.push(dbCategories[key])
        }
        setCategories(dbCategoriesList)
        searchData().catch(console.error)

    }, [showAddSale, showFilters])


    const filtersRef = useRef(null)
    useClickOutside(filtersRef, () => { setShowFilters(false) })

    return (
        <div className="page_nav_margin">
            <AddSale modalState={[showAddSale, setShowAddSale]} categories={categories} dbUser={dbUser} />
            <SalesCard saleSelected={saleSelected} setSaleSelected={setSaleSelected} user={dbUser} />
            <div className="sales_title">
                <h2>Sales Report</h2>
            </div>


            <div className="sales_body">

                <div className={`${showFilters ? "modal" : "hide"}`}>
                    <div ref={filtersRef} className="filtersCard">

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

                <div className="filtersPanel">

                    <div className="filterPanelRows">

                        <SelectHeader state={[showFilters, setShowFilters]} title="Filters" />
                        <button className="filterPanelButtons" onClick={() => {
                            setShowAddSale(true)
                        }} >Add Sale</button>

                    </div>

                    <div className="filterPanelRows">

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

                        <button className="filterPanelButtons" onClick={searchData} >Search</button>
                    </div>

                </div>


                <div className="tableContainer">
                    <table>

                        <thead>

                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Qty</th>
                                <th>Income</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sales.map((sale: any, key: number) => <SalesPreview key={key} soldProduct={sale} setSaleSelected={setSaleSelected} />)}
                        </tbody>

                    </table>
                </div>
            </div>
        </div>
    )
}

export default Sales
