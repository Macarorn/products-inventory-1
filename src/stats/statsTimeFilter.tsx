import React, { useState, useEffect, useRef } from 'react'
import "./statsTimeFilter.scss"
import { updateDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../auth/authContext'
import { getISOyear, getISOyearMonth, months, useClickOutside, constrain, regex } from '../utils'
import SwitchButton from '../components/switchButton'
import SelectHeader from '../components/selectHeader'
import FilterAltIcon from '@mui/icons-material/FilterAlt';

function StatsTimeFilter({ dataState, titleState }: any) {
    const [timeFilterOption, setTimeFilterOption] = useState("current")
    const [title, setTitle] = titleState
    const [useTimeFilter, setUseTimeFilter] = useState(false)
    const [useMonthFilter, setUseMonthFilter] = useState(false)
    const [dbTimeFilter, setDbTimeFilter] = useState("")
    const date = new Date()
    const [timeFilterYearInput, setTimeFilterYearInput] = useState(date.getFullYear())
    const [showMonths, setShowMonths] = useState(false)
    const [timeFilterMonth, setTimeFilterMonth] = useState(date.getMonth())
    const [timeFilterYear, setTimeFilterYear] = useState(date.getFullYear())
    const [statsData, setStatsData] = dataState
    const { currentUser, dbUser } = useAuth()

    const searchAllTime = async () => {
        const allTimeRef = doc(db, "users", currentUser.uid, "stats", "allTime")
        const allTimeSnap = await getDoc(allTimeRef)

        if (allTimeSnap.exists()) {
            setStatsData(allTimeSnap.data())
            return
        }
        setStatsData({})
    }
    const searchCurrentDate = async (option: string) => {
        const userLastSeen = dbUser?.lastSeen
        const userLastSeenDate = userLastSeen?.toDate() || new Date()

        const statsID = option == "year" ? getISOyear(userLastSeenDate) : getISOyearMonth(userLastSeenDate)

        const currentDateRef = doc(db, "users", currentUser.uid, "stats", statsID)
        const currentDateSnap = await getDoc(currentDateRef)
        if (currentDateSnap.exists()) {
            setStatsData(currentDateSnap.data())
            return
        }
        setStatsData({})

    }

    const searchCustomDate = async () => {
        const inputMonth = timeFilterMonth + 1
        const isoMonth = inputMonth < 10 ? `0${inputMonth}` : `${inputMonth}`

        const statsID = useMonthFilter ? isoMonth + timeFilterYear : `${timeFilterYear}`


        const customDateRef = doc(db, "users", currentUser.uid, "stats", statsID)
        const customDateSnap = await getDoc(customDateRef)
        if (customDateSnap.exists()) {
            setStatsData(customDateSnap.data())
            return
        }
        setStatsData({})
    }

    const searchData = async (statsTitle: string) => {
        await updateDoc(doc(db, "users", currentUser.uid), {
            lastSeen: serverTimestamp()
        })
        switch (statsTitle) {
            case "All Time":
                searchAllTime()
                break;
            case "Current Month":
                searchCurrentDate("month")
                break
            case "Current Year":
                searchCurrentDate("year")
                break
            default:
                searchCustomDate()
                break;
        }
    }

    useEffect(() => {
        if (!useTimeFilter) {
            setTitle("All Time")
            setDbTimeFilter("")
            return
        }

        if (timeFilterOption !== 'customDate') return
        setTitle(`${useMonthFilter ? months[timeFilterMonth] : ""} ${timeFilterYear}`)


    }, [timeFilterOption, useMonthFilter, timeFilterYear, timeFilterMonth, useTimeFilter])

    useEffect(() => {
        searchData(title)
    }, [title])

    const monthsPickerRef = useRef(null)
    useClickOutside(monthsPickerRef, () => { setShowMonths(false) })
    return (<>
        <div className={`${showMonths ? "modal" : "hide"}`}>
            <div ref={monthsPickerRef} className="statsMonthPicker">
                {months.map((month: string, key: number) => (
                    <div key={key} onClick={() => { setTimeFilterMonth(key) }} >
                        {`${month}`}
                    </div>
                ))}
            </div>
        </div>
        <div className="statsTimeFilter">
            <span>
                <FilterAltIcon />
                <p>Apply Time filter</p>
            </span>
            <SwitchButton state={[useTimeFilter, setUseTimeFilter]} />
        </div>
        <div className={`${useTimeFilter ? "statsTimeFilterOptions" : "hide"}`}>
            <div className="flex">

                <div className={`${timeFilterOption == 'current' ? "timeFilterSelected" : ""} statsTimeFilterButton`} onClick={() => { setTimeFilterOption("current") }}>  Current...  </div>


                <div className={`${timeFilterOption == 'customDate' ? "timeFilterSelected" : ""} statsTimeFilterButton`} onClick={() => { setTimeFilterOption("customDate") }}> Custom Date  </div>

            </div>

            <div className={`${timeFilterOption == "current" ? "statsTimeFilterCurrent" : "hide"}`}>
                <p className={`${dbTimeFilter == "currentMonth" ? "timeFilterSelected" : ""} statsTimeFilterButton`} onClick={() => {
                    setDbTimeFilter("currentMonth")
                    setTitle("Current Month")
                }}>
                    Current Month
                            </p>
                <p className={`${dbTimeFilter == "currentYear" ? "timeFilterSelected" : ""} statsTimeFilterButton`} onClick={() => {
                    setDbTimeFilter("currentYear")
                    setTitle("Current Year")
                }}>
                    Current Year
                            </p>
            </div>
            <div className={`${timeFilterOption == "customDate" ? "statsTimeFilterCustom" : "hide"}`} >
                <label className="statsTimeFilterCustomOption">
                    <p className="asdf">Year</p>
                    <input type="text" value={timeFilterYearInput} onChange={e => {
                        let regexInput = e.target.value.replace(regex, "")
                        let yearInput = parseInt(regexInput.slice(0, 4))
                        yearInput = Math.max(yearInput, 20)
                        // 
                        setTimeFilterYearInput(yearInput)
                        setTimeFilterYear(constrain(yearInput, 2000, Infinity))
                    }} />
                </label>

                <div className="statsTimeFilterCustomOption">
                    <span>
                        <p className="asdf">Month</p>
                        <SwitchButton state={[useMonthFilter, setUseMonthFilter]} />
                    </span>

                    <SelectHeader className={`${useMonthFilter ? "" : "hide"}`} title={months[timeFilterMonth]} state={[showMonths, setShowMonths]} />
                </div>

            </div>
        </div>
    </>)
}

export default StatsTimeFilter
