import React from 'react'
import "./purchasePreview.scss"

function PurchasePreview({ purchasedProduct, setPurchaseSelected, className }: any) {
    return (
        <tr onClick={() => {
            setPurchaseSelected(purchasedProduct)
        }} className={`${className ? className : ""} purchasesExtraInfoDataRows`}>

            <td> {purchasedProduct.productId} </td>
            <td className="td_name"> {purchasedProduct.name} </td>
            <td> {purchasedProduct.qtyPurchased} </td>
            <td> {purchasedProduct.totalCost} </td>
        </tr>
    )
}

export default PurchasePreview
