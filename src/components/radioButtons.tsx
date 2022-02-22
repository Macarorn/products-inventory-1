import React from 'react'
import "./radioButtons.scss"

import { customID } from '../utils';

function RadioButtons({ options, optionState, name, className, onClick }: any) {
    const inputsRadioName: string = name ? name : customID(7)

    const [currentOption, setOption] = optionState

    return (
        <div className={`${className ? className : ""} radioButtons `} onClick={onClick}>
            {options?.map((option: any, key: number) =>
                <label key={key} >
                    <input name={inputsRadioName} type="radio" value={option} onClick={(e: any) => {
                        if (currentOption == option) {
                            setOption("")
                            e.target.checked = false

                        } else {

                            setOption(option)
                        }
                    }} />
                    <p>
                        {option}
                    </p>
                </label>
            )}
        </div>
    )
}

export default RadioButtons
