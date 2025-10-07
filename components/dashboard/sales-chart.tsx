'use client'

import { useEffect, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts'

interface SalesData {
  hour: string
  sales: number
}

export function SalesChart() {
  const [data, setData] = useState<SalesData[]>([])

  useEffect(() => {
    // Generate sample data for hourly sales
    const generateSampleData = () => {
      const hours = []
      for (let i = 8; i <= 22; i++) {
        hours.push({
          hour: `${i}:00`,
          sales: Math.floor(Math.random() * 500) + 100
        })
      }
      return hours
    }

    setData(generateSampleData())
  }, [])

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900">Today's Sales</h3>
        <p className="text-sm text-gray-500">Hourly breakdown</p>
      </div>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="hour" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6b7280', fontSize: 12 }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6b7280', fontSize: 12 }}
            />
            <Line 
              type="monotone" 
              dataKey="sales" 
              stroke="#111827" 
              strokeWidth={2}
              dot={{ fill: '#111827', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#111827', strokeWidth: 2, fill: '#fff' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}