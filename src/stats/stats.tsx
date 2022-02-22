import React, { useState, useEffect, } from 'react'
import "./stats.scss"
import { doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../auth/authContext';
import { db } from '../firebase';
import StatsCharts from './statsCharts';
import StatsTimeFilter from './statsTimeFilter';

function Stats() {
    const { currentUser } = useAuth()
    const [stockData, setStockData] = useState<any>()
    const [statsData, setStatsData] = useState<any>({})
    const [title, setTitle] = useState("All Time")


    const readStockData = async () => {
        const stockRef = doc(db, "users", currentUser.uid, "stats", "stock")
        const stockSnap = await getDoc(stockRef)
        if (stockSnap.exists()) {
            setStockData(stockSnap.data())
            return
        }
        setStockData({})
    }

    useEffect(() => {
        readStockData()
    }, [])


    return (<div className="page_nav_margin">

        <div className="stats">
            <div className="statsHeader">
                <StatsTimeFilter titleState={[title, setTitle]} dataState={[statsData, setStatsData]} />
            </div>
            <div className="statsBody">
                <div className="statsBodyHeader">
                    <h2>Stats</h2>
                    <div className="statsProductsInfo">
                        <span>
                            <h3>Products In Stock</h3>
                            <p> {stockData?.productsInStock || 0} </p>
                        </span>
                        <span>
                            <h3>Products Out Of Stock</h3>
                            <p> {stockData?.productsOutOfStock || 0} </p>
                        </span>
                    </div>
                </div>
                <div className="statsCharts">
                    <div className="statsChartsHeader">
                        <h2> {title} </h2>
                    </div>
                    <StatsCharts dataState={[statsData, setStatsData]} />
                </div>
            </div>
        </div>

    </div>)
}

export default Stats
