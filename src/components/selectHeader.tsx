import React, { useState } from 'react'
import "./selectHeader.scss"
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';


function SelectHeader({ title, state, className, onClick }: any) {
    const [showSelectContent, setShowSelectContent] = state
    return (
        <div onClick={() => {
            setShowSelectContent((showSelectContent: boolean) => !showSelectContent)
            if (onClick) onClick()
        }} className={`${className ? className : ""} selectHeader`}>

            <p className="selectHeaderTitle"> {title} </p>

            <div className="selectHeaderDropDownIcon">
                {showSelectContent ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
            </div>
        </div>
    )
}

export default SelectHeader
