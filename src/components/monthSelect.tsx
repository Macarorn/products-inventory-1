import React, { useState, useEffect } from 'react'
import "./monthSelect.scss"
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { constrain, months } from '../utils';

function MonthSelect({ dateState, className, onClick }: any) {

    const currentDate = new Date()
    const currentYear = currentDate.getFullYear()
    const [year, setYear] = useState(currentYear)
    const [month, setMonth] = useState(currentDate.getMonth())
    const [date, setDate] = dateState

    useEffect(() => {

        setYear(
            constrain(year, 20, currentYear)
        )

        const constrainedYear = constrain(year, 2000, currentYear)

        setDate({ ...date, year: constrainedYear })


    }, [year])
    useEffect(() => {
        setDate({ ...date, month: month })

    }, [month])


    return (
        <div onClick={onClick} className={`${className ? className : ""} monthSelectInput`}>
            <div className="monthSelectYear">
                <button className="monthSelectYearButtons" type="button" onClick={() => {
                    setYear((year: number) => year - 1)
                }} > <RemoveIcon /> </button>
                <input className="monthSelectYearInput" type="number" value={year} onChange={e => {
                    let yearInput = parseInt(e.target.value.substring(0, 4))
                    setYear(yearInput ? yearInput : 20)
                }} />
                <button className="monthSelectYearButtons" type="button" onClick={() => {
                    setYear((year: number) => year + 1)
                }} > <AddIcon /> </button>
            </div>


            <div className="monthSelectMonths">
                {months.map((month, key) =>
                    <div className="monthSelectMonth" key={key} onClick={() => {
                        setMonth(key)
                    }} >{month}</div>
                )}
            </div>
        </div>

    )
}

export default MonthSelect
