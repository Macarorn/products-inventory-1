import React from 'react'
import "./salesPreview.scss"

function SalesPreview({ soldProduct, setSaleSelected, className }: any) {

    // const [saleSelected, setSaleSelected] = saleSelectedState
    // let income: number = productSold.qty * productSold.price
    return (
        <tr onClick={() => {
            setSaleSelected(soldProduct)
        }} className={`${className ? className: ""} salesPreviewDataRows`}>
            {/* <td><MoreVertIcon /></td> */}
            <td> {soldProduct?.productId} </td>
            <td className="td_name"> {soldProduct?.name} </td>
            <td> {soldProduct?.qtySold} </td>
            <td> {soldProduct?.totalIncome} </td>
        </tr>
    )
}

export default SalesPreview
