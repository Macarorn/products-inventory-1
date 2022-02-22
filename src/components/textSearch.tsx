import React from 'react'
import "./textSearch.scss"
import SearchIcon from '@mui/icons-material/Search';

function TextSearch({ textState, placeholder, className, onClick, onChange, onKeyUp }: any) {
    const [textInput, setTextInput] = textState


    return (
        <div onClick={onClick} className={`${className ? className : ""} textSearch`}>
                <SearchIcon />
                <input onKeyUp={onKeyUp} type="text" placeholder={`${placeholder ? placeholder : ""}`} value={textInput} onChange={e => {
                    setTextInput(e.target.value)
                    if (onChange) {
                        onChange()
                    }
                }} />
        </div>
    )
}

export default TextSearch
