'use client'

import { useEffect, useState } from 'react'
import { format } from 'date-fns'

interface Order {
  id: string
  orderNumber: number
  customer?: { firstName?: string; lastName?: string; phone: string }
  total: number
  status: string
  type: string
  createdAt: string
}

export function RecentOrders() {
  const [orders, setOrders] = useState<Order[]>([])

  useEffect(() => {
    fetchRecentOrders()
  }, [])

  const fetchRecentOrders = async () => {
    try {
      const response = await fetch('/api/orders?limit=10')
      if (response.ok) {
        const data = await response.json()
        setOrders(data)
      }
    } catch (error) {
      console.error('Error fetching recent orders:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-gray-100 text-gray-800'
      case 'PREPARING':
        return 'bg-gray-200 text-gray-900'
      case 'READY':
        return 'bg-gray-800 text-white'
      default:
        return 'bg-gray-50 text-gray-600'
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Recent Orders</h3>
      </div>
      <div className="divide-y divide-gray-200">
        {orders.length === 0 ? (
          <div className="px-6 py-8 text-center text-gray-500">
            No recent orders
          </div>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="px-6 py-4 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div>
                    <p className="font-medium text-gray-900">#{order.orderNumber}</p>
                    <p className="text-sm text-gray-500">
                      {order.customer 
                        ? `${order.customer.firstName || ''} ${order.customer.lastName || ''}`.trim() || order.customer.phone
                        : order.type.replace('_', ' ')
                      }
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                    {order.status.toLowerCase()}
                  </span>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">${order.total.toFixed(2)}</p>
                    <p className="text-sm text-gray-500">
                      {format(new Date(order.createdAt), 'HH:mm')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}