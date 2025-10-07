'use client'

import { useEffect, useState } from 'react'
import { useCartStore } from '@/store/cart'
import { Plus, Minus, Loader2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface MenuItem {
  id: string
  name: string
  description: string | null
  price: number
  categoryId: string
  category: {
    id: string
    name: string
  }
  isAvailable: boolean
  preparationTime: number
  dietary: string[]
  sizes: Array<{
    id: string
    name: string
    price: number
    isDefault: boolean
  }>
  options: Array<{
    id: string
    name: string
    price: number
  }>
}

interface MenuGridProps {
  selectedCategory: string
}

export function MenuGrid({ selectedCategory }: MenuGridProps) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [quantities, setQuantities] = useState<Record<string, number>>({})

  const addItem = useCartStore((state) => state.addItem)
  const orderType = useCartStore((state) => state.orderType)

  useEffect(() => {
    fetchMenuItems()
  }, [selectedCategory])

  const fetchMenuItems = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (selectedCategory && selectedCategory !== 'all') {
        params.append('categoryId', selectedCategory)
      }

      const response = await fetch(`/api/menu?${params}`)

      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = '/login'
          return
        }
        throw new Error('Failed to fetch menu items')
      }

      const data = await response.json()
      setMenuItems(data)

      // Initialize quantities
      const initialQuantities: Record<string, number> = {}
      data.forEach((item: MenuItem) => {
        initialQuantities[item.id] = 1
      })
      setQuantities(initialQuantities)
    } catch (err) {
      console.error('Error fetching menu:', err)
      setError(err instanceof Error ? err.message : 'Failed to load menu items')
    } finally {
      setLoading(false)
    }
  }

  const updateQuantity = (itemId: string, delta: number) => {
    setQuantities((prev) => ({
      ...prev,
      [itemId]: Math.max(1, (prev[itemId] || 1) + delta),
    }))
  }

  const handleAddToCart = (item: MenuItem) => {
    if (!orderType) {
      toast.error('Please select an order type first')
      return
    }

    const quantity = quantities[item.id] || 1
    const defaultSize = item.sizes.find((s) => s.isDefault) || item.sizes[0]

    addItem({
      menuItemId: item.id,
      name: item.name,
      price: item.price,
      quantity,
      size: defaultSize?.name,
      sizePrice: defaultSize?.price,
      options: [],
      notes: '',
    })

    // Reset quantity after adding
    setQuantities((prev) => ({ ...prev, [item.id]: 1 }))
    toast.success(`Added ${quantity}x ${item.name} to cart`)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <AlertCircle className="h-12 w-12 text-gray-400" />
        <p className="text-gray-600">{error}</p>
        <Button onClick={fetchMenuItems} variant="outline">
          Try Again
        </Button>
      </div>
    )
  }

  if (menuItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <p className="text-gray-600">No menu items available</p>
        {selectedCategory !== 'all' && (
          <p className="text-sm text-gray-400">Try selecting a different category</p>
        )}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {menuItems.map((item) => (
        <div
          key={item.id}
          className={`bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-400 transition-all ${
            !item.isAvailable ? 'opacity-60' : ''
          }`}
        >
          <div className="flex flex-col h-full">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">{item.name}</h3>
              {item.description && (
                <p className="text-sm text-gray-500 mb-2 line-clamp-2">
                  {item.description}
                </p>
              )}
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg font-bold">{formatPrice(item.price)}</span>
                <span className="text-xs text-gray-400">{item.preparationTime} min</span>
              </div>
              {item.dietary.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {item.dietary.map((diet) => (
                    <Badge key={diet} variant="outline" className="text-xs">
                      {diet}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {item.isAvailable ? (
              <div className="flex items-center space-x-2 mt-3">
                <div className="flex items-center border rounded-lg">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => updateQuantity(item.id, -1)}
                    disabled={quantities[item.id] <= 1}
                    className="h-8 w-8 p-0"
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="px-3 text-sm font-medium">
                    {quantities[item.id] || 1}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => updateQuantity(item.id, 1)}
                    className="h-8 w-8 p-0"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                <Button
                  className="flex-1 bg-gray-900 hover:bg-gray-800 text-white"
                  size="sm"
                  onClick={() => handleAddToCart(item)}
                  disabled={!orderType}
                >
                  Add to Cart
                </Button>
              </div>
            ) : (
              <Button className="w-full mt-3" size="sm" disabled>
                Unavailable
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}