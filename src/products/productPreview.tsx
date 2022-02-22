import React from 'react'
import "./productPreview.scss"
function ProductPreview({product, setProduct}:any) {
    // let imgSrc = "https://image.freepik.com/free-photo/hand-painted-watercolor-background-with-sky-clouds-shape_24972-1095.jpg"
    return (
        <div className="productPreview" onClick={() => {
            setProduct(product)
         }}>
            <img src={product.photoURL} />
            <p> {product.name} </p>
        </div>
    )
}

export default ProductPreview
