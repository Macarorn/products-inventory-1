import React, { useState, useEffect } from 'react'
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Legend, Bar, PieChart, Pie, Cell } from 'recharts';
import { useAuth } from '../auth/authContext';
import { convertObjectToArray, capEachWord } from '../utils';

function StatsCharts({ dataState }: any) {
    const [salesByCategory, setSalesByCategory] = useState<any>([])
    const [purchasesByCategory, setPurchasesByCategory] = useState<any>([])
    const [salesPurchases, setSalesPurchases] = useState<any>([])
    const [income_invested, setIncomeInvested] = useState<any>([])
    const [statsData] = dataState
    const { dbUser } = useAuth()

    const colors = [
        "#088eff",
        "#ff0000",
        "#2ec900",
        "#ff9900",
    ]



    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
            <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    const handleEventByCategory = (dataKey: string, stateSetter: React.Dispatch<any>) => {
        const dbByCategory = statsData[dataKey] || {}
        const ByCategoryConverted = convertObjectToArray(dbByCategory)


        const pieByCategory: any = []
        ByCategoryConverted.forEach((event: any) => {
            pieByCategory.push({ name: capEachWord(dbUser.categories[event.id]) || "", value: event.value })
        });
        stateSetter(pieByCategory)
    }


    useEffect(() => {
        if (!statsData || !dbUser) return

        handleEventByCategory("salesByCategory", setSalesByCategory)

        handleEventByCategory("purchasesByCategory", setPurchasesByCategory)


        setIncomeInvested([
            { name: "Income", Income: statsData.income || 0 },
            { name: "Invested", Invested: statsData.invested || 0 }
        ])
        setSalesPurchases([
            { name: "Sales", Sales: statsData.sales || 0 },
            { name: "Purchases", Purchases: statsData.purchases || 0 }
        ])

    }, [statsData])


    return (
        <div className="statsChartsBody">
            <div className="statsDataChart">

                <ResponsiveContainer width="99%" aspect={2}>
                    <BarChart data={salesPurchases}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        {/* <Tooltip active="true" title="test" children={<p>test</p>}/> */}
                        <Legend />
                        <Bar dataKey="Sales" fill={`${colors[1]}`} label={{ fill: "white" }} />
                        <Bar dataKey="Purchases" fill={`${colors[0]}`} label={{ fill: "white" }} />
                    </BarChart>
                </ResponsiveContainer>


                <ResponsiveContainer width="99%" aspect={2}>
                    <BarChart data={income_invested}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        {/* <Tooltip content={<p>aaa</p>}/> */}
                        <Legend />
                        <Bar dataKey="Income" fill={`${colors[1]}`} label={{ fill: "white" }} />
                        <Bar dataKey="Invested" fill={`${colors[0]}`} color="white" label={{ fill: "white" }} />
                    </BarChart>
                </ResponsiveContainer>
                
            </div>




            <div className="statsDataChart">


                <ResponsiveContainer width="99%" aspect={1}>
                    <PieChart>
                        <Legend />
                        <Pie
                            data={purchasesByCategory}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            labelLine={false}
                            label={renderCustomizedLabel}
                        >
                            {purchasesByCategory.map((entry: any, key: number) => (
                                <Cell key={`cell-${key}`}
                                    fill={colors[key % colors.length]} />
                            ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>


                <ResponsiveContainer width="99%" aspect={1}>
                    <PieChart>
                        <Legend />
                        <Pie
                            data={salesByCategory}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            labelLine={false}
                            label={renderCustomizedLabel}
                        >
                            {salesByCategory.map((entry: any, key: number) => (
                                <Cell key={`cell-${key}`}
                                    fill={colors[key % colors.length]} />
                            ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>

            </div>

        </div>
    )
}

export default StatsCharts
