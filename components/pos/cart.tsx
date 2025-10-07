'use client'

import { useCartStore, useFormattedPrices } from '@/store/cart'
import { Minus, Plus, Trash2, ShoppingCart, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useState } from 'react'
import { toast } from 'sonner'

interface CartProps {
  onCheckout: () => void
}

export function Cart({ onCheckout }: CartProps) {
  const [notesId, setNotesId] = useState<string | null>(null)
  const [tempNotes, setTempNotes] = useState('')

  const {
    items,
    orderType,
    tableId,
    updateQuantity,
    removeItem,
    updateItemNotes,
    setOrderType,
    clearCart,
    getItemTotal,
    getItemCount,
    canCheckout
  } = useCartStore()

  const { subtotal, tax, total } = useFormattedPrices()

  const orderTypes = [
    { value: 'WALK_IN', label: 'Walk-in', icon: '🚶' },
    { value: 'TAKE_AWAY', label: 'Takeaway', icon: '🥡' },
    { value: 'DELIVERY', label: 'Delivery', icon: '🚚' },
    { value: 'DINE_IN', label: 'Dine-in', icon: '🍽️' }
  ] as const

  const handleNotesEdit = (itemId: string, currentNotes: string) => {
    setNotesId(itemId)
    setTempNotes(currentNotes || '')
  }

  const saveNotes = (itemId: string) => {
    updateItemNotes(itemId, tempNotes)
    setNotesId(null)
    setTempNotes('')
    toast.success('Notes updated')
  }

  const handleRemoveItem = (itemId: string, itemName: string) => {
    removeItem(itemId)
    toast.info(`Removed ${itemName} from cart`)
  }

  const handleClearCart = () => {
    if (confirm('Are you sure you want to clear the cart?')) {
      clearCart()
      toast.info('Cart cleared')
    }
  }

  const handleCheckout = () => {
    if (!canCheckout()) {
      if (!orderType) {
        toast.error('Please select an order type')
      } else if (orderType === 'DINE_IN' && !tableId) {
        toast.error('Please select a table for dine-in orders')
      }
      return
    }
    onCheckout()
  }

  return (
    <div className="bg-white border-l border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <ShoppingCart className="h-5 w-5 mr-2" />
            Current Order
          </h2>
          <Badge variant="secondary" className="text-sm">
            {getItemCount()} items
          </Badge>
        </div>

        {/* Order Type Selection */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Order Type <span className="text-red-500">*</span>
          </label>
          <Select value={orderType || ''} onValueChange={(value) => setOrderType(value as any)}>
            <SelectTrigger className={!orderType ? 'border-red-300' : ''}>
              <SelectValue placeholder="Select order type..." />
            </SelectTrigger>
            <SelectContent>
              {orderTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  <span className="flex items-center">
                    <span className="mr-2">{type.icon}</span>
                    {type.label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {!orderType && (
            <p className="text-xs text-red-500 flex items-center">
              <AlertCircle className="h-3 w-3 mr-1" />
              Order type is required
            </p>
          )}
        </div>

        {/* Table Selection for Dine-in */}
        {orderType === 'DINE_IN' && (
          <div className="mt-3 space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Table Number <span className="text-red-500">*</span>
            </label>
            <Select value={tableId || ''} onValueChange={(value) => useCartStore.setState({ tableId: value })}>
              <SelectTrigger className={!tableId ? 'border-red-300' : ''}>
                <SelectValue placeholder="Select table..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="M1">Table M1 (Main - 4 seats)</SelectItem>
                <SelectItem value="M2">Table M2 (Main - 4 seats)</SelectItem>
                <SelectItem value="M3">Table M3 (Main - 6 seats)</SelectItem>
                <SelectItem value="P1">Table P1 (Patio - 4 seats)</SelectItem>
                <SelectItem value="V1">Table V1 (VIP - 6 seats)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {items.length === 0 ? (
          <div className="text-center text-gray-500 py-12">
            <ShoppingCart className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="font-medium">Your cart is empty</p>
            <p className="text-sm mt-1">Add items from the menu to get started</p>
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="border border-gray-200 rounded-lg p-3 hover:border-gray-300 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{item.name}</h4>
                  {item.size && (
                    <span className="text-xs text-gray-500">Size: {item.size}</span>
                  )}
                  {item.options && item.options.length > 0 && (
                    <div className="text-xs text-gray-500">
                      Options: {item.options.map(opt => opt.name).join(', ')}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleRemoveItem(item.id, item.name)}
                  className="text-gray-400 hover:text-red-500 p-1 transition-colors"
                  title="Remove item"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">
                  ${item.price.toFixed(2)} each
                </span>

                <div className="flex items-center space-x-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                    className="h-7 w-7 p-0"
                  >
                    <Minus className="h-3 w-3" />
                  </Button>

                  <span className="w-10 text-center font-medium text-sm">
                    {item.quantity}
                  </span>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="h-7 w-7 p-0"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {/* Notes Section */}
              {notesId === item.id ? (
                <div className="space-y-2">
                  <Textarea
                    value={tempNotes}
                    onChange={(e) => setTempNotes(e.target.value)}
                    placeholder="Add special instructions..."
                    className="text-xs h-16"
                    maxLength={200}
                  />
                  <div className="flex justify-end space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setNotesId(null)}
                      className="h-7 text-xs"
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => saveNotes(item.id)}
                      className="h-7 text-xs bg-gray-900 hover:bg-gray-800"
                    >
                      Save
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-center">
                  {item.notes ? (
                    <p className="text-xs text-gray-500 italic flex-1 mr-2">"{item.notes}"</p>
                  ) : (
                    <button
                      onClick={() => handleNotesEdit(item.id, item.notes || '')}
                      className="text-xs text-gray-400 hover:text-gray-600"
                    >
                      Add notes
                    </button>
                  )}
                  <span className="font-semibold text-gray-900">
                    ${getItemTotal(item).toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Order Summary & Checkout */}
      {items.length > 0 && (
        <div className="border-t border-gray-200 p-4 space-y-4 bg-gray-50">
          {/* Summary */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span className="text-gray-900 font-medium">{subtotal}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tax (8%)</span>
              <span className="text-gray-900">{tax}</span>
            </div>
            <div className="border-t border-gray-300 pt-2">
              <div className="flex justify-between font-bold text-lg">
                <span className="text-gray-900">Total</span>
                <span className="text-gray-900">{total}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <Button
              onClick={handleCheckout}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold"
              disabled={!canCheckout()}
            >
              Proceed to Checkout
            </Button>

            <Button
              onClick={handleClearCart}
              variant="outline"
              className="w-full border-gray-300 text-gray-700 hover:bg-white"
            >
              Clear Cart
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}