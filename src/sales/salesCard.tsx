import React, { useRef, useState, useEffect } from 'react'
import "./salesCard.scss"
import { useClickOutside, months } from '../utils';
import CloseIcon from '@mui/icons-material/Close';


function SalesCard({ saleSelected, setSaleSelected, user }: any) {
    const dbCategories = user?.categories ? user.categories : {}

    const [month, setMonth] = useState(0)
    const [year, setYear] = useState(2000)
    const [day, setDay] = useState(1)

    useEffect(() => {
        if (!saleSelected) return

        const date = saleSelected.timestamp.toDate()
        setMonth(date.getMonth())
        setYear(date.getFullYear())
        setDay(date.getDate())


    }, [saleSelected])


    const saleCardRef = useRef(null)
    useClickOutside(saleCardRef, () => { setSaleSelected(null) })

    return (
        <div className={`${saleSelected ? "modal" : "hide"}`}>
            <div ref={saleCardRef} className="saleCard">
                <CloseIcon className="closeIcon" onClick={() => {
                    setSaleSelected(null)
                }} />

                <div className="saleCardImg">
                    <img src={`${saleSelected?.photoURL}`} alt="Image Preview" className="image_preview_img" />

                </div>

                <h2> {saleSelected?.name} </h2>
                <div className="saleCardData">

                    <span>
                        <p className="saleCardDataTitle">Id:</p>
                        <p>{saleSelected?.productId} </p>
                    </span>
                    <span>
                        <p className="saleCardDataTitle">Category:</p>
                        <p>{dbCategories[`${saleSelected?.category}`]} </p>
                    </span>
                    <span>
                        <p className="saleCardDataTitle">Purchase made in:</p>
                        <p>{day} {months[month]} {year}</p>
                    </span>
                    <span>
                        <p className="saleCardDataTitle">Qty Sold:</p>
                        <p>{saleSelected?.qtySold} </p>
                    </span>
                    <span>
                        <p className="saleCardDataTitle">Price:</p>
                        <p>{saleSelected?.price} </p>
                    </span>
                    <span>
                        <p className="saleCardDataTitle">Total Income:</p>
                        <p>{saleSelected?.totalIncome}</p>
                    </span>
                </div>


            </div>

        </div>
    )
}

export default SalesCard
