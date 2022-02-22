import React, { useState, useEffect } from 'react'
import "./dateRange.scss"
import { constrain } from "../utils"
import DateRangeIcon from '@mui/icons-material/DateRange';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

function DateRange({ startDate, endDate, onClick, className }: any) {
    const [showDatePicker, setShowDatePicker] = useState(false)
    const [fromDate, setFromDate] = startDate
    const [toDate, setToDate] = endDate
    const [dateSelected, setDateSelected] = useState("from")
    const [year, setYear] = useState(fromDate.year)
    const [month, setMonth] = useState(fromDate.month)
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const currentYear = new Date().getFullYear()

    useEffect(() => {

        setYear(
            constrain(year, 20, currentYear)
        )

        const constrainedYear = constrain(year, 2000, currentYear)

        if (dateSelected == "from") {
            setFromDate({ ...fromDate, year: constrainedYear })
        } else if (dateSelected == "to") {
            setToDate({ ...toDate, year: constrainedYear })
        }
    }, [year])

    useEffect(() => {

        if (dateSelected == "from") {
            setFromDate({ ...fromDate, month: month })
        } else if (dateSelected == "to") {
            setToDate({ ...toDate, month: month })
        }
    }, [month])



    return (
        <div className={`${className} dateRange`} onClick={onClick}>

            <div className="dateRangeHeader">

                <div className={`${showDatePicker && dateSelected == "from" ? "dateSelected" : ""} dateHeaderData startDate`} onClick={() => {
                    setShowDatePicker(true)
                    setDateSelected("from")
                }} >
                    <p>

                        {`${fromDate.year}  ${months[fromDate.month]}`}
                    </p>
                    <DateRangeIcon />
                </div>
                <p className="text_to">
                    To:
                    </p>
                <div className={`${showDatePicker && dateSelected == "to" ? "dateSelected" : ""} dateHeaderData endDate`} onClick={() => {
                    setShowDatePicker(true)
                    setDateSelected("to")
                }}>
                    <p>
                        {`${toDate.year}  ${months[toDate.month]}`}
                    </p>
                    <DateRangeIcon />
                </div>
            </div>
            <div className={`${showDatePicker ? "dateRangeSelect" : "hide"} `} >
                <CloseIcon className="closeIcon" onClick={() => {
                    setShowDatePicker(false)
                }} />


                <div className="dateRangeYear">
                    <button className="dateYearButtons" type="button" onClick={() => {
                        setYear((year: number) => year - 1)
                    }} > <RemoveIcon /> </button>
                    <input type="number" value={year} onChange={e => {
                        let yearInput = parseInt(e.target.value.substring(0, 4))
                        setYear(yearInput ? yearInput : 20)
                    }} />
                    <button className="dateYearButtons" type="button" onClick={() => {
                        setYear((year: number) => year + 1)
                    }} > <AddIcon /> </button>
                </div>


                <div className="dateRangeMonths">
                    {months.map((month, key) =>
                        <div key={key} onClick={() => {
                            setMonth(key)
                        }} >{month}</div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default DateRange
