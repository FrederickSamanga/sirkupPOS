'use client'

import { useState, useEffect } from 'react'
import { Navigation } from '@/components/ui/navigation'
import { MenuGrid } from '@/components/pos/menu-grid'
import { Cart } from '@/components/pos/cart'
import { usePOSStore } from '@/lib/store/pos-store'

export default function POSPage() {
  const { cart, addToCart, removeFromCart, clearCart } = usePOSStore()
  const [selectedCategory, setSelectedCategory] = useState('all')

  return (
    <div className="flex h-screen bg-gray-50">
      <Navigation />
      <div className="flex-1 flex">
        {/* Menu Section */}
        <div className="flex-1 p-6">
          <div className="bg-white rounded-lg shadow-sm h-full flex flex-col">
            {/* Category Tabs */}
            <div className="border-b border-gray-200 p-4">
              <div className="flex space-x-2">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedCategory === 'all'
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All Items
                </button>
                <button
                  onClick={() => setSelectedCategory('appetizers')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedCategory === 'appetizers'
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Appetizers
                </button>
                <button
                  onClick={() => setSelectedCategory('main')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedCategory === 'main'
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Main Course
                </button>
                <button
                  onClick={() => setSelectedCategory('desserts')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedCategory === 'desserts'
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Desserts
                </button>
                <button
                  onClick={() => setSelectedCategory('beverages')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedCategory === 'beverages'
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Beverages
                </button>
              </div>
            </div>

            {/* Menu Grid */}
            <div className="flex-1 overflow-auto p-4">
              <MenuGrid selectedCategory={selectedCategory} />
            </div>
          </div>
        </div>

        {/* Cart Section */}
        <div className="w-96 p-6">
          <Cart onCheckout={() => {}} />
        </div>
      </div>
    </div>
  )
}