import React, { useRef } from 'react'
import "./productCard.scss"
import CloseIcon from '@mui/icons-material/Close';
import { useClickOutside } from '../utils'

function ProductCard({ product, setProduct, user }: any) {
    const dbCategories = user?.categories ? user.categories : {}


    const productCardRef = useRef(null)
    useClickOutside(productCardRef, () => { setProduct(undefined) })
    return (
        <div className={`${product ? "modal" : "hide"}`} >
            <div ref={productCardRef} className="productCard">
                <CloseIcon className="productCardCloseIcon" onClick={() => { setProduct(undefined) }} />
                <div className="productCardImg">
                    <img src={`${product?.photoURL}`} alt="Image Preview" className="image_preview_img" />

                </div>

                <h2> {product?.name} </h2>
                <div className="productExtraInfoData">

                    <span>
                        <p className="productExtraInfoDataTitle">Id:</p>
                        <p> {product?.id} </p>
                    </span>

                    <span>
                        <p className="productExtraInfoDataTitle">Description:</p>
                        <p> {product?.description} </p>
                    </span>

                    <span>
                        <p className="productExtraInfoDataTitle">Category:</p>
                        <p> {dbCategories[`${product?.category}`]} </p>
                    </span>

                    <span>
                        <p className="productExtraInfoDataTitle">Cost:</p>
                        <p> {product?.cost} </p>
                    </span>

                    <span>
                        <p className="productExtraInfoDataTitle">Price:</p>
                        <p> {product?.price} </p>
                    </span>

                    <span>
                        <p className="productExtraInfoDataTitle">Qty:</p>
                        <p> {product?.qty} </p>
                    </span>

                </div>
            </div>
        </div>
    )
}

export default ProductCard
