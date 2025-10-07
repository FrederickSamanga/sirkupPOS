import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  id: string // Unique cart item ID
  menuItemId: string
  name: string
  price: number
  quantity: number
  size?: string
  sizePrice?: number
  options?: Array<{
    id: string
    name: string
    price: number
  }>
  notes?: string
}

interface CartStore {
  // State
  items: CartItem[]
  orderType: 'WALK_IN' | 'TAKE_AWAY' | 'DELIVERY' | 'DINE_IN' | null
  tableId: string | null
  customerId: string | null

  // Settings
  taxRate: number

  // Actions
  addItem: (item: Omit<CartItem, 'id'>) => void
  updateQuantity: (id: string, quantity: number) => void
  removeItem: (id: string) => void
  updateItemNotes: (id: string, notes: string) => void
  setOrderType: (type: CartStore['orderType']) => void
  setTableId: (tableId: string | null) => void
  setCustomerId: (customerId: string | null) => void
  clearCart: () => void

  // Computed values
  getItemTotal: (item: CartItem) => number
  getSubtotal: () => number
  getTax: () => number
  getTotal: () => number
  getItemCount: () => number

  // Validation
  canCheckout: () => boolean
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      // Initial state
      items: [],
      orderType: null,
      tableId: null,
      customerId: null,
      taxRate: 0.08, // 8% tax rate from restaurant settings

      // Add item to cart
      addItem: (item) => {
        const state = get()
        const cartId = `${item.menuItemId}-${Date.now()}-${Math.random()}`

        // Check if exact same item exists (same item, size, options)
        const existingItem = state.items.find(
          (cartItem) =>
            cartItem.menuItemId === item.menuItemId &&
            cartItem.size === item.size &&
            JSON.stringify(cartItem.options) === JSON.stringify(item.options)
        )

        if (existingItem) {
          // Increase quantity of existing item
          set((state) => ({
            items: state.items.map((cartItem) =>
              cartItem.id === existingItem.id
                ? { ...cartItem, quantity: cartItem.quantity + item.quantity }
                : cartItem
            ),
          }))
        } else {
          // Add as new item
          set((state) => ({
            items: [...state.items, { ...item, id: cartId }],
          }))
        }
      },

      // Update item quantity
      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id)
          return
        }

        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, quantity } : item
          ),
        }))
      },

      // Remove item from cart
      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }))
      },

      // Update item notes
      updateItemNotes: (id, notes) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, notes } : item
          ),
        }))
      },

      // Set order type
      setOrderType: (orderType) => {
        set({ orderType })
        // Clear table if not dine-in
        if (orderType !== 'DINE_IN') {
          set({ tableId: null })
        }
      },

      // Set table ID
      setTableId: (tableId) => {
        set({ tableId })
      },

      // Set customer ID
      setCustomerId: (customerId) => {
        set({ customerId })
      },

      // Clear entire cart
      clearCart: () => {
        set({
          items: [],
          orderType: null,
          tableId: null,
          customerId: null,
        })
      },

      // Calculate item total (with size and options)
      getItemTotal: (item) => {
        const basePrice = item.sizePrice || item.price
        const optionsTotal = item.options?.reduce((sum, opt) => sum + opt.price, 0) || 0
        return (basePrice + optionsTotal) * item.quantity
      },

      // Calculate subtotal
      getSubtotal: () => {
        const state = get()
        return state.items.reduce((sum, item) => sum + state.getItemTotal(item), 0)
      },

      // Calculate tax
      getTax: () => {
        const state = get()
        return state.getSubtotal() * state.taxRate
      },

      // Calculate total
      getTotal: () => {
        const state = get()
        return state.getSubtotal() + state.getTax()
      },

      // Get total item count
      getItemCount: () => {
        const state = get()
        return state.items.reduce((sum, item) => sum + item.quantity, 0)
      },

      // Check if cart can be checked out
      canCheckout: () => {
        const state = get()
        return (
          state.items.length > 0 &&
          state.orderType !== null &&
          (state.orderType !== 'DINE_IN' || state.tableId !== null)
        )
      },
    }),
    {
      name: 'sirkupai-cart-storage', // localStorage key
      partialize: (state) => ({
        items: state.items,
        orderType: state.orderType,
        tableId: state.tableId,
        customerId: state.customerId,
      }), // Only persist cart data, not functions
    }
  )
)

// Helper hook to get formatted prices
export const useFormattedPrices = () => {
  const cart = useCartStore()

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  return {
    subtotal: formatPrice(cart.getSubtotal()),
    tax: formatPrice(cart.getTax()),
    total: formatPrice(cart.getTotal()),
  }
}