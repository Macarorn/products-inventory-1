import React, { useEffect, useState, useRef } from 'react'
import "./products.scss";
import AddProduct from './add_product';
import CloseIcon from '@mui/icons-material/Close';
import { useAuth } from "../auth/authContext"
import { query, collection, doc, where, getDocs, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import ProductPreview from './productPreview';
import ProductCard from './productCard';
import SelectHeader from '../components/selectHeader';
import { HiOutlineSwitchVertical } from 'react-icons/hi';
import TextSearch from '../components/textSearch';
import { useClickOutside, getKeyByValue } from '../utils';
import SwitchButton from '../components/switchButton';
import RadioButtons from '../components/radioButtons';
import FilterAltIcon from '@mui/icons-material/FilterAlt';

function Products() {
    const { currentUser, dbUser } = useAuth()
    const [products, setProducts] = useState<any[]>([])
    const [addProductModal, setAddProductModal] = useState(false)
    const [productSelected, setProductSelected] = useState(undefined)

    const [category, setCategory] = useState("")
    const [searchById, setSearchById] = useState(false)
    const [showFilters, setShowFilters] = useState(false)
    const [textState, setTextState] = useState("")
    const [showInStock, setShowInStock] = useState(false)
    const [categories, setCategories] = useState<string[]>([""])

    const getProductById = async () => {
        const productRef = doc(db, "users", `${currentUser.uid}`, "products", `${textState != "" ? textState : "invalidID"}`)
        const productSnap = await getDoc(productRef)

        if (productSnap.exists()) {
            setProducts([productSnap.data()])
            return
        }
        setProducts([])
    }

    const searchData = async () => {
        if (searchById) {
            getProductById()
            return
        }

        const productsRef = collection(db, "users", `${currentUser.uid}`, "products")
        
        
        const qtyOperator = showInStock ? ">" : ">="

        const queryConstraints = [
            where("nameAsArray", "array-contains", textState.toLowerCase()),
            where("qty", qtyOperator, 0)
        ]

        if(category !== ""){

            let categoryId = getKeyByValue(dbUser.categories, category)
            queryConstraints.push(where("category", "==", categoryId))
        }
 

        let q = query(productsRef, ...queryConstraints)

        const queryProductsSnapshot = await getDocs(q)

        const productsSnap: any = []
        queryProductsSnapshot.forEach(product => {
            productsSnap.push({ ...product.data(), dbRef: product.ref })
        })
        productsSnap.sort((a: any, b: any) => {
            if (a.name > b.name) return 1
            if (a.name < b.name) return -1
            return 0
        })
        setProducts(productsSnap)
        setTextState("")
    }


    // useEffect(() => {

        // searchData().catch(console.error)
        
    // }, [])

    useEffect(() => {
        if(!dbUser) return
        const dbCategoriesList = []
        const dbCategories = dbUser?.categories ? dbUser.categories : {}
        for (const key in dbCategories) {
            dbCategoriesList.push(dbCategories[key])
        }
        setCategories(dbCategoriesList)
        searchData().catch(console.error)
    }, [addProductModal, showFilters, productSelected])


    // let categories = dbUser?.categories 

    const filtersRef = useRef(null)
    useClickOutside(filtersRef, ()=>{setShowFilters(false)})

    return (

        <div className="page_nav_margin">
            <AddProduct modalState={addProductModal} setModalState={setAddProductModal} categories={categories} />
            <ProductCard product={productSelected} setProduct={setProductSelected} user={dbUser} />

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
                        <span className="products_inStockFilter">
                            <p>In Stock</p>
                            <SwitchButton state={[showInStock, setShowInStock]} />
                        </span>

                        <span className="products_categoryFilter">
                            <p className="products_categoryFilterText">Category</p>
                            <RadioButtons options={categories} optionState={[category, setCategory]} />
                        </span>

                        <button type="submit" className="filterCardApplyFilter" onClick={()=>{
                            searchData()
                            setShowFilters(false)
                            }} >Apply Filters</button>

                    </div>

                </div>
            </div>

            <div className="products">
                <h2>Products</h2>
                <div className="filtersPanel">

                    <div className="filterPanelRows">

                        <SelectHeader state={[showFilters, setShowFilters]} title="Filters" />
                        <button className="filterPanelButtons" onClick={()=>{setAddProductModal(true)}}>Add Product</button>

                    </div>

                    <div className="filterPanelRows" >

                        <div className="flex">
                            <div className="filterPanelToggleSearchBy" onClick={() => { setSearchById(searchById => !searchById) }}>
                                <HiOutlineSwitchVertical />
                                <p> {searchById ? "id" : "name"} </p>
                            </div>
                            <TextSearch onKeyUp={(e: any)=>{
                                if (e.key == "Enter") {
                                    searchData()
                                }
                            }} placeholder={`Search by ${searchById ? "id" : "name"}`} textState={[textState, setTextState]} />

                        </div>

                        <button type="submit" className="filterPanelButtons" onClick={searchData} >Search</button>
                    </div>

                </div>
                <div className="productsList">
                    {products.map((product: any, key: number) => <ProductPreview key={key} product={product} setProduct={setProductSelected} />
                    )}

                </div>
            </div>
        </div>

    )
}

export default Products
