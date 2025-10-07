'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCartStore, useFormattedPrices } from '@/store/cart'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Loader2, CreditCard, DollarSign, Phone, User, Receipt, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

interface CheckoutModalProps {
  isOpen: boolean
  onClose: () => void
}

// Customer form schema
const customerSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().regex(/^\d{10}$/, 'Phone must be 10 digits').optional().or(z.literal('')),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
})

type CustomerFormData = z.infer<typeof customerSchema>

// Payment calculation
interface PaymentDetails {
  method: 'CASH' | 'CARD'
  amountTendered?: number
  change?: number
}

export function CheckoutModal({ isOpen, onClose }: CheckoutModalProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('customer')
  const [isProcessing, setIsProcessing] = useState(false)
  const [orderComplete, setOrderComplete] = useState(false)
  const [orderNumber, setOrderNumber] = useState<number | null>(null)
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails>({
    method: 'CASH',
  })
  const [amountInput, setAmountInput] = useState('')

  const cart = useCartStore()
  const { subtotal, tax, total } = useFormattedPrices()
  const totalAmount = cart.getTotal()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
  })

  // Calculate change for cash payments
  const calculateChange = (tendered: number) => {
    const change = tendered - totalAmount
    setPaymentDetails({
      ...paymentDetails,
      amountTendered: tendered,
      change: change >= 0 ? change : 0
    })
  }

  // Quick cash buttons
  const quickCashAmounts = [20, 50, 100, 200]
  const suggestedAmount = Math.ceil(totalAmount / 10) * 10

  // Submit order
  const submitOrder = async (customerData?: CustomerFormData) => {
    if (!paymentDetails.method) {
      toast.error('Please select a payment method')
      return
    }

    if (paymentDetails.method === 'CASH' && (!paymentDetails.amountTendered || paymentDetails.amountTendered < totalAmount)) {
      toast.error('Insufficient payment amount')
      return
    }

    setIsProcessing(true)

    try {
      // Create or find customer
      let customerId = cart.customerId

      if (customerData?.phone) {
        const customerResponse = await fetch('/api/customers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(customerData),
        })

        if (customerResponse.ok) {
          const customer = await customerResponse.json()
          customerId = customer.id
          cart.setCustomerId(customer.id)
        }
      }

      // Create order
      const orderData = {
        type: cart.orderType,
        customerId,
        tableId: cart.tableId,
        items: cart.items.map(item => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          price: item.price,
          size: item.size,
          options: item.options,
          notes: item.notes,
        })),
        subtotal: cart.getSubtotal(),
        tax: cart.getTax(),
        total: totalAmount,
        paymentMethod: paymentDetails.method,
        notes: cart.items
          .filter(item => item.notes)
          .map(item => `${item.name}: ${item.notes}`)
          .join('; '),
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      })

      if (!response.ok) {
        throw new Error('Failed to create order')
      }

      const order = await response.json()

      // Show success
      setOrderNumber(order.orderNumber)
      setOrderComplete(true)

      // Clear cart
      cart.clearCart()

      // Success notification
      toast.success(`Order #${order.orderNumber} created successfully!`)

      // Close modal after delay
      setTimeout(() => {
        onClose()
        reset()
        setOrderComplete(false)
        setActiveTab('customer')
        setPaymentDetails({ method: 'CASH' })
        setAmountInput('')
      }, 3000)

    } catch (error) {
      console.error('Error creating order:', error)
      toast.error('Failed to create order. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const onCustomerSubmit = (data: CustomerFormData) => {
    setActiveTab('payment')
  }

  const handlePaymentComplete = () => {
    handleSubmit((data) => submitOrder(data))()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  if (orderComplete) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
            <h2 className="text-2xl font-bold">Order Successful!</h2>
            <p className="text-gray-600 text-center">
              Order #{orderNumber} has been created
            </p>
            {paymentDetails.method === 'CASH' && paymentDetails.change && paymentDetails.change > 0 && (
              <div className="bg-gray-100 rounded-lg p-4 w-full">
                <p className="text-center text-lg font-semibold">
                  Change Due: {formatCurrency(paymentDetails.change)}
                </p>
              </div>
            )}
            <Button onClick={() => window.print()} variant="outline">
              <Receipt className="h-4 w-4 mr-2" />
              Print Receipt
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Checkout</DialogTitle>
          <DialogDescription>
            Complete the order for {cart.getItemCount()} items
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="customer">Customer</TabsTrigger>
            <TabsTrigger value="payment">Payment</TabsTrigger>
            <TabsTrigger value="summary">Summary</TabsTrigger>
          </TabsList>

          {/* Customer Tab */}
          <TabsContent value="customer" className="space-y-4 mt-4">
            <form onSubmit={handleSubmit(onCustomerSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    placeholder="John"
                    {...register('firstName')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    placeholder="Doe"
                    {...register('lastName')}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">
                  Phone Number {cart.orderType === 'DELIVERY' && <span className="text-red-500">*</span>}
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="phone"
                    placeholder="1234567890"
                    className="pl-10"
                    {...register('phone', {
                      required: cart.orderType === 'DELIVERY'
                    })}
                  />
                </div>
                {errors.phone && (
                  <p className="text-sm text-red-500">{errors.phone.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email (Optional)</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  {...register('email')}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>

              {cart.orderType === 'DELIVERY' && (
                <div className="space-y-2">
                  <Label htmlFor="address">Delivery Address</Label>
                  <Textarea
                    id="address"
                    placeholder="Enter delivery address..."
                    className="h-20"
                  />
                </div>
              )}

              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit">
                  Continue to Payment
                </Button>
              </div>
            </form>
          </TabsContent>

          {/* Payment Tab */}
          <TabsContent value="payment" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div>
                <Label>Payment Method</Label>
                <RadioGroup
                  value={paymentDetails.method}
                  onValueChange={(value) => setPaymentDetails({ ...paymentDetails, method: value as any })}
                  className="mt-2"
                >
                  <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                    <RadioGroupItem value="CASH" id="cash" />
                    <Label htmlFor="cash" className="flex items-center cursor-pointer flex-1">
                      <DollarSign className="h-4 w-4 mr-2" />
                      Cash
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                    <RadioGroupItem value="CARD" id="card" />
                    <Label htmlFor="card" className="flex items-center cursor-pointer flex-1">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Card
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {paymentDetails.method === 'CASH' && (
                <div className="space-y-4">
                  <div>
                    <Label>Amount Due</Label>
                    <div className="text-2xl font-bold mt-1">{total}</div>
                  </div>

                  <div>
                    <Label htmlFor="amountTendered">Amount Tendered</Label>
                    <Input
                      id="amountTendered"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={amountInput}
                      onChange={(e) => {
                        setAmountInput(e.target.value)
                        const amount = parseFloat(e.target.value)
                        if (!isNaN(amount)) {
                          calculateChange(amount)
                        }
                      }}
                      className="text-lg"
                    />
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {quickCashAmounts.map((amount) => (
                      <Button
                        key={amount}
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setAmountInput(amount.toString())
                          calculateChange(amount)
                        }}
                      >
                        ${amount}
                      </Button>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setAmountInput(suggestedAmount.toString())
                        calculateChange(suggestedAmount)
                      }}
                    >
                      ${suggestedAmount}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setAmountInput(totalAmount.toFixed(2))
                        calculateChange(totalAmount)
                      }}
                    >
                      Exact
                    </Button>
                  </div>

                  {paymentDetails.change !== undefined && paymentDetails.change >= 0 && (
                    <div className="bg-gray-100 rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <span className="text-lg">Change Due:</span>
                        <span className="text-2xl font-bold">
                          {formatCurrency(paymentDetails.change)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <Separator />

              <div className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setActiveTab('customer')}
                >
                  Back
                </Button>
                <Button
                  onClick={handlePaymentComplete}
                  disabled={
                    isProcessing ||
                    (paymentDetails.method === 'CASH' && (!paymentDetails.amountTendered || paymentDetails.amountTendered < totalAmount))
                  }
                  className="bg-gray-900 hover:bg-gray-800"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Complete Order'
                  )}
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Summary Tab */}
          <TabsContent value="summary" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Order Type</h3>
                <Badge variant="secondary">{cart.orderType?.replace('_', ' ')}</Badge>
                {cart.tableId && (
                  <Badge variant="outline" className="ml-2">
                    Table {cart.tableId}
                  </Badge>
                )}
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-2">Items ({cart.getItemCount()})</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {cart.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <div>
                        <span>{item.quantity}x {item.name}</span>
                        {item.notes && (
                          <p className="text-xs text-gray-500 italic">Note: {item.notes}</p>
                        )}
                      </div>
                      <span className="font-medium">
                        ${cart.getItemTotal(item).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (8%)</span>
                  <span>{tax}</span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>{total}</span>
                </div>
              </div>

              <div className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setActiveTab('payment')}
                >
                  Back to Payment
                </Button>
                <Button
                  onClick={handlePaymentComplete}
                  disabled={isProcessing}
                  className="bg-gray-900 hover:bg-gray-800"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Confirm Order'
                  )}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}