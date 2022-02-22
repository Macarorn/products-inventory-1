import React, { useRef, useState, useEffect } from 'react'
import "./checkBoxes.scss"

function CheckBoxes({ className, onClick, options, setOptions }: any) {

    useEffect(() => {
        const testArr: boolean[] = []
        for (let index = 0; index < options.length; index++) {
            testArr.push(false)
        }
    }, [])

    const inputsRef = useRef<any>([])
    inputsRef.current = []

    const labelsRef = useRef<any>([])
    labelsRef.current = []

    const checkedOptionsHandler = () => {
        let inputOptions: string[] = []
        inputsRef.current.forEach((element: any) => {
            if (element.checked) {
                inputOptions.push(element.value)
            }
        })
        setOptions(inputOptions)
    }

    return (
        <div onClick={onClick} className={`${className ? className : ""} checkBoxes`}>

            {options?.map((option: string, key: number) =>
                <label onChange={checkedOptionsHandler} key={key} >
                    <input ref={element => inputsRef.current.splice(key, 1, element)} type="checkbox"  value={option} />
                    <p>
                        {option}
                    </p>
                </label>
            )}

        </div>
    )
}

export default CheckBoxes
