import React, { useState, useEffect } from 'react'
import "./selectDate.scss"
import CheckIcon from '@mui/icons-material/Check';
import MonthSelect from './monthSelect';
import DateRangeIcon from '@mui/icons-material/DateRange';
import { months } from '../utils';

function SelectDate({ className, onClick, setDate }: any) {

    const [optionSelected, setOptionSelected] = useState("month")
    const [rangeOptionSelected, setRangeOptionSelected] = useState("from")
    const currentDate = new Date()
    const [inputDate, setInputDate] = useState({
        year: currentDate.getFullYear(),
        month: currentDate.getMonth()
    })
    const [monthDate, setMonthDate] = useState(inputDate)
    const [startDate, setStartDate] = useState(inputDate)
    const [endDate, setEndDate] = useState(inputDate)

    useEffect(() => {
        if (optionSelected == "month") {
            setMonthDate(inputDate)
            return
        }
        if (rangeOptionSelected == "from") {
            setStartDate(inputDate)
        } else {
            setEndDate(inputDate)
        }

    }, [inputDate])

    useEffect(() => {
        if (optionSelected == "month") {
            let month = monthDate.month + 1 < 10 ? 0 + "" + (monthDate.month+1) : monthDate.month + 1
            setDate([`${month}/1/${monthDate.year}`])
            return
        }
        setDate([`${startDate.month + 1}/1/${startDate.year}`, `${endDate.month + 1}/1/${endDate.year}`])

    }, [monthDate, startDate, endDate])


    return (
        <div onClick={onClick} className={`${className ? className : ""} selectDate `}>

            {/* <p className="selectDateModalTitle">Filter on:</p> */}

            <div className="selectDateSelectOption">
                <p className={`${optionSelected == "month" ? "optionSelected" : ""} selectDateOption`} onClick={() => {
                    setOptionSelected("month")
                }}>Month <CheckIcon /> </p>
                <p className={`${optionSelected == "dateRange" ? "optionSelected" : ""} selectDateOption`} onClick={() => {
                    setOptionSelected("dateRange")
                }}>Date Range <CheckIcon /> </p>
            </div>

            <div className="selectDateDisplayInfo">

                <div className={`${optionSelected == "month" ? "selectDateMonthSelected" : "hide"} rangeOptionSelected selectDateInfo_pTag `}>
                    <p>Date:</p>
                    <p className="selectDateTextDate">
                        {`${monthDate.year} ${months[monthDate.month]}`}
                        <DateRangeIcon />
                    </p>
                </div>

                <div className={`${optionSelected == "dateRange" ? "selectDateDateRangeSelected" : "hide"} selectDateInfo_pTag`}>
                    <div onClick={() => {
                        setRangeOptionSelected("from")
                    }} className={`${rangeOptionSelected == "from" ? "rangeOptionSelected" : ""}`}>
                        <p> From: </p>
                        <p className="selectDateTextDate">
                            {`${startDate.year} ${months[startDate.month]}`}
                            <DateRangeIcon />
                        </p>
                    </div>
                    <div onClick={() => {
                        setRangeOptionSelected("to")
                    }} className={`${rangeOptionSelected == "to" ? "rangeOptionSelected" : ""}`}>
                        <p> To:</p>
                        <p className="selectDateTextDate">
                            {`${endDate.year} ${months[endDate.month]}`}
                            <DateRangeIcon />
                        </p>
                    </div>
                </div>
            </div>

            <div className="dateRangePickDate">
                <MonthSelect dateState={[inputDate, setInputDate]} />
            </div>
        </div>

    )
}

export default SelectDate
