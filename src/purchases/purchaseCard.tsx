import React, { useRef, useState, useEffect } from 'react'
import "./purchaseCard.scss"
import { useClickOutside, months } from '../utils';
import CloseIcon from '@mui/icons-material/Close';


function PurchasesCard({ purchaseSelected, setPurchaseSelected, user }: any) {
    const dbCategories = user?.categories ? user.categories : {}

    const [month, setMonth] = useState(0)
    const [year, setYear] = useState(2000)
    const [day, setDay] = useState(1)

    useEffect(() => {
        if(!purchaseSelected) return

        const date = purchaseSelected.timestamp.toDate()
        setMonth(date.getMonth())
        setYear(date.getFullYear())
        setDay(date.getDate())


    }, [purchaseSelected])


    const extraInfoRef = useRef(null)
    useClickOutside(extraInfoRef, () => { setPurchaseSelected(null) })

    return (
        <div className={`${purchaseSelected ? "modal" : "hide"}`}>
            <div ref={extraInfoRef} className="purchaseExtraInfo">
                <CloseIcon className="closeIcon" onClick={() => {
                    setPurchaseSelected(null)
                }} />

                <div className="purchaseExtraInfoImg">
                    <img src={`${purchaseSelected?.photoURL}`} alt="Image Preview" className="image_preview_img" />

                </div>

                <h2> {purchaseSelected?.name} </h2>
                <div className="purchaseExtraInfoData">

                    <span>
                        <p className="purchaseExtraInfoDataTitle">Id:</p>
                        <p>{purchaseSelected?.productId} </p>
                    </span>
                    <span>
                        <p className="purchaseExtraInfoDataTitle">Category:</p>
                        <p>{dbCategories[`${purchaseSelected?.category}`]} </p>
                    </span>
                    <span>
                        <p className="purchaseExtraInfoDataTitle">Purchase made in:</p>
                        <p>{day} {months[month]} {year}</p>
                    </span>
                    <span>
                        <p className="purchaseExtraInfoDataTitle">Qty Purchased:</p>
                        <p>{purchaseSelected?.qtyPurchased} </p>
                    </span>
                    <span>
                        <p className="purchaseExtraInfoDataTitle">Cost:</p>
                        <p>{purchaseSelected?.cost} </p>
                    </span>
                    <span>
                        <p className="purchaseExtraInfoDataTitle">Total Cost:</p>
                        <p>{purchaseSelected?.totalCost}</p>
                    </span>
                </div>


            </div>

        </div>
    )
}

export default PurchasesCard
