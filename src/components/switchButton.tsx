import React from 'react'
import "./switchButton.scss"
function SwitchButton({ state, className, onClick }: any) {
    const [switchState, setSwitchState] = state
    return (
        <div className={`${className ? className : ""} switchButton`} onClick={onClick}>
            <div onClick={() => { setSwitchState((switchState: boolean) => !switchState) }} className={`${switchState ? "switchButtonOn" : ""} switchButtonBackground`}>
                <div className="switchButtonRound">
                    
                </div>
            </div>

        </div>
    )
}

export default SwitchButton
