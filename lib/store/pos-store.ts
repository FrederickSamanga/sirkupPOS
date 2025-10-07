import { create } from 'zustand'
import { MenuItem } from '@prisma/client'

export interface CartItem {
  id: string
  menuItemId: string
  name: string
  price: number
  quantity: number
  modifiers?: Record<string, any>
}

export interface POSState {
  cart: CartItem[]
  orderType: 'WALK_IN' | 'TAKEAWAY' | 'DELIVERY' | 'DINE_IN'
  selectedTable?: string
  customerPhone?: string
  
  // Actions
  addToCart: (item: MenuItem, quantity?: number) => void
  removeFromCart: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  setOrderType: (type: 'WALK_IN' | 'TAKEAWAY' | 'DELIVERY' | 'DINE_IN') => void
  setSelectedTable: (tableId?: string) => void
  setCustomerPhone: (phone?: string) => void
  
  // Computed
  getTotal: () => number
  getItemCount: () => number
}

export const usePOSStore = create<POSState>((set, get) => ({
  cart: [],
  orderType: 'WALK_IN',
  selectedTable: undefined,
  customerPhone: undefined,

  addToCart: (item, quantity = 1) => {
    const cart = get().cart
    const existingItem = cart.find(cartItem => cartItem.menuItemId === item.id)
    
    if (existingItem) {
      set({
        cart: cart.map(cartItem =>
          cartItem.menuItemId === item.id
            ? { ...cartItem, quantity: cartItem.quantity + quantity }
            : cartItem
        )
      })
    } else {
      set({
        cart: [...cart, {
          id: `${item.id}-${Date.now()}`,
          menuItemId: item.id,
          name: item.name,
          price: item.price,
          quantity
        }]
      })
    }
  },

  removeFromCart: (id) => {
    set({ cart: get().cart.filter(item => item.id !== id) })
  },

  updateQuantity: (id, quantity) => {
    if (quantity <= 0) {
      get().removeFromCart(id)
      return
    }
    
    set({
      cart: get().cart.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    })
  },

  clearCart: () => {
    set({ cart: [], selectedTable: undefined, customerPhone: undefined })
  },

  setOrderType: (type) => {
    set({ orderType: type })
  },

  setSelectedTable: (tableId) => {
    set({ selectedTable: tableId })
  },

  setCustomerPhone: (phone) => {
    set({ customerPhone: phone })
  },

  getTotal: () => {
    return get().cart.reduce((total, item) => total + (item.price * item.quantity), 0)
  },

  getItemCount: () => {
    return get().cart.reduce((count, item) => count + item.quantity, 0)
  }
}))