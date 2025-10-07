'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { VoidRefundModal } from '@/components/orders/void-refund-modal'
import { format } from 'date-fns'
import {
  Clock,
  CheckCircle,
  XCircle,
  ChefHat,
  Package,
  User,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  DollarSign,
  Calendar,
  Receipt,
  Printer,
  Download,
  AlertCircle,
  TrendingUp,
  History,
  Truck,
  Copy,
} from 'lucide-react'
import { toast } from 'sonner'

interface OrderItem {
  id: string
  menuItem: {
    name: string
    category?: {
      name: string
    }
  }
  quantity: number
  price: number
  size?: string
  options?: any
  notes?: string
}

interface Order {
  id: string
  orderNumber: number
  type: string
  status: string
  customer?: {
    id: string
    firstName: string
    lastName: string
    phone: string
    email?: string
  }
  table?: {
    number: number
    name: string
    section?: string
  }
  items: OrderItem[]
  subtotal: number
  tax: number
  tip?: number
  discount?: number
  total: number
  paymentMethod: string
  notes?: string
  createdAt: string
  updatedAt: string
  user?: {
    name: string
  }
}

interface OrderDetailsModalProps {
  order: Order
  isOpen: boolean
  onClose: () => void
  onStatusUpdate?: (status: string) => void
}

const statusColors = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  PREPARING: 'bg-blue-100 text-blue-800',
  READY: 'bg-green-100 text-green-800',
  COMPLETED: 'bg-gray-100 text-gray-800',
  CANCELLED: 'bg-red-100 text-red-800',
}

const statusIcons = {
  PENDING: Clock,
  PREPARING: ChefHat,
  READY: Package,
  COMPLETED: CheckCircle,
  CANCELLED: XCircle,
}

const typeIcons = {
  WALK_IN: User,
  TAKEAWAY: Package,
  DELIVERY: Truck,
  DINE_IN: User,
}

export function OrderDetailsModal({ order, isOpen, onClose, onStatusUpdate }: OrderDetailsModalProps) {
  const [isPrinting, setIsPrinting] = useState(false)
  const [activeTab, setActiveTab] = useState('details')
  const [voidRefundModal, setVoidRefundModal] = useState<{
    isOpen: boolean
    mode: 'void' | 'refund'
  }>({ isOpen: false, mode: 'void' })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const getStatusIcon = (status: string) => {
    const Icon = statusIcons[status as keyof typeof statusIcons] || AlertCircle
    return <Icon className="h-4 w-4" />
  }

  const getTypeIcon = (type: string) => {
    const Icon = typeIcons[type as keyof typeof typeIcons] || Package
    return <Icon className="h-4 w-4" />
  }

  const handleVoidRefund = async (data: any) => {
    try {
      const endpoint = `/api/orders/${order.id}`
      const payload = data.mode === 'void'
        ? { status: 'CANCELLED', voidReason: data.reason }
        : { refundAmount: data.amount, refundReason: data.reason }

      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) throw new Error(`Failed to ${data.mode} order`)

      toast.success(
        data.mode === 'void'
          ? `Order #${order.orderNumber} has been voided`
          : `Refund of ${formatCurrency(data.amount)} processed`
      )

      setVoidRefundModal({ isOpen: false, mode: 'void' })
      onStatusUpdate?.(data.mode === 'void' ? 'CANCELLED' : order.status)
      onClose()
    } catch (error) {
      console.error('Error:', error)
      toast.error(`Failed to ${data.mode} order`)
    }
  }

  const duplicateOrder = async () => {
    toast.info('Order duplication feature coming soon!')
    // This feature would need the menuItemId to be included in the order items
    // from the API response, which isn't currently available
  }

  const handlePrintReceipt = async () => {
    setIsPrinting(true)
    try {
      // Create print-friendly content
      const printContent = `
        <html>
          <head>
            <title>Order #${order.orderNumber}</title>
            <style>
              body { font-family: monospace; max-width: 300px; margin: 0 auto; padding: 20px; }
              h1, h2 { text-align: center; }
              .divider { border-top: 1px dashed #000; margin: 10px 0; }
              .item { display: flex; justify-content: space-between; margin: 5px 0; }
              .total { font-weight: bold; font-size: 1.2em; }
              .footer { text-align: center; margin-top: 20px; font-size: 0.9em; }
            </style>
          </head>
          <body>
            <h1>AMAYA CAFE</h1>
            <h2>Order #${order.orderNumber}</h2>
            <div class="divider"></div>

            <div>Date: ${format(new Date(order.createdAt), 'MMM d, yyyy h:mm a')}</div>
            <div>Type: ${order.type.replace('_', ' ')}</div>
            ${order.table ? `<div>Table: ${order.table.number}</div>` : ''}
            ${order.customer ? `
              <div>Customer: ${order.customer.firstName} ${order.customer.lastName}</div>
              <div>Phone: ${order.customer.phone}</div>
            ` : ''}

            <div class="divider"></div>
            <h3>ITEMS</h3>

            ${order.items.map(item => `
              <div class="item">
                <span>${item.quantity}x ${item.menuItem.name}</span>
                <span>${formatCurrency(item.price * item.quantity)}</span>
              </div>
              ${item.notes ? `<div style="font-size: 0.9em; margin-left: 20px;">Note: ${item.notes}</div>` : ''}
            `).join('')}

            <div class="divider"></div>

            <div class="item">
              <span>Subtotal:</span>
              <span>${formatCurrency(order.subtotal)}</span>
            </div>
            <div class="item">
              <span>Tax:</span>
              <span>${formatCurrency(order.tax)}</span>
            </div>
            <div class="item total">
              <span>TOTAL:</span>
              <span>${formatCurrency(order.total)}</span>
            </div>

            <div class="divider"></div>

            <div>Payment: ${order.paymentMethod}</div>

            <div class="footer">
              <p>Thank you for your order!</p>
              <p>www.amayacafe.com</p>
            </div>
          </body>
        </html>
      `

      // Open print dialog
      const printWindow = window.open('', '', 'width=400,height=600')
      if (printWindow) {
        printWindow.document.write(printContent)
        printWindow.document.close()
        printWindow.print()
        printWindow.close()
      }

      toast.success('Receipt sent to printer')
    } catch (error) {
      console.error('Print error:', error)
      toast.error('Failed to print receipt')
    } finally {
      setIsPrinting(false)
    }
  }

  // Status timeline data
  const statusTimeline = [
    { status: 'PENDING', label: 'Order Placed', time: order.createdAt },
    { status: 'PREPARING', label: 'Preparing', time: null },
    { status: 'READY', label: 'Ready', time: null },
    { status: 'COMPLETED', label: 'Completed', time: null },
  ]

  const currentStatusIndex = statusTimeline.findIndex(s => s.status === order.status)

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl">
                Order #{order.orderNumber}
              </DialogTitle>
              <DialogDescription>
                {format(new Date(order.createdAt), 'MMMM d, yyyy h:mm a')}
              </DialogDescription>
            </div>
            <Badge className={statusColors[order.status as keyof typeof statusColors]}>
              <span className="flex items-center gap-1">
                {getStatusIcon(order.status)}
                {order.status}
              </span>
            </Badge>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="actions">Actions</TabsTrigger>
          </TabsList>

          {/* Details Tab */}
          <TabsContent value="details" className="space-y-4 mt-4">
            {/* Order Info */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3">Order Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">Created:</span>
                    <span>{format(new Date(order.createdAt), 'MMM d, h:mm a')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {getTypeIcon(order.type)}
                    <span className="text-gray-600">Type:</span>
                    <Badge variant="outline">{order.type.replace('_', ' ')}</Badge>
                  </div>
                  {order.table && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">Table:</span>
                      <Badge variant="secondary">Table {order.table.number}</Badge>
                    </div>
                  )}
                  {order.user && (
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">Cashier:</span>
                      <span>{order.user.name}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Customer Info */}
            {order.customer && (
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-3">Customer Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">Name:</span>
                      <span>{order.customer.firstName} {order.customer.lastName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">Phone:</span>
                      <span>{order.customer.phone}</span>
                    </div>
                    {order.customer.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">Email:</span>
                        <span>{order.customer.email}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Items */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3">Order Items</h3>
                <div className="space-y-3">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-start pb-2 border-b last:border-0">
                      <div className="flex-1">
                        <div className="font-medium">
                          {item.quantity}x {item.menuItem.name}
                        </div>
                        {item.size && (
                          <div className="text-sm text-gray-500">Size: {item.size}</div>
                        )}
                        {item.notes && (
                          <div className="text-sm text-gray-500 italic">Note: {item.notes}</div>
                        )}
                      </div>
                      <div className="font-medium">
                        {formatCurrency(item.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>

                <Separator className="my-4" />

                {/* Totals */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>{formatCurrency(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax</span>
                    <span>{formatCurrency(order.tax)}</span>
                  </div>
                  {order.tip && order.tip > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Tip</span>
                      <span>{formatCurrency(order.tip)}</span>
                    </div>
                  )}
                  {order.discount && order.discount > 0 && (
                    <div className="flex justify-between text-sm text-red-600">
                      <span>Discount</span>
                      <span>-{formatCurrency(order.discount)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>{formatCurrency(order.total)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3">Payment Information</h3>
                <div className="flex items-center gap-2">
                  {order.paymentMethod === 'CASH' ? (
                    <DollarSign className="h-4 w-4 text-gray-400" />
                  ) : (
                    <CreditCard className="h-4 w-4 text-gray-400" />
                  )}
                  <span className="text-gray-600">Method:</span>
                  <Badge variant="outline">{order.paymentMethod}</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            {order.notes && (
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-3">Order Notes</h3>
                  <p className="text-sm text-gray-600">{order.notes}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Timeline Tab */}
          <TabsContent value="timeline" className="mt-4">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Order Timeline</h3>
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-gray-200"></div>

                  {/* Timeline items */}
                  <div className="space-y-6">
                    {statusTimeline.map((item, index) => {
                      const isCompleted = index <= currentStatusIndex
                      const isCurrent = index === currentStatusIndex
                      const Icon = statusIcons[item.status as keyof typeof statusIcons] || Clock

                      return (
                        <div key={item.status} className="flex gap-4 relative">
                          {/* Icon */}
                          <div
                            className={`
                              w-8 h-8 rounded-full flex items-center justify-center z-10
                              ${isCompleted
                                ? isCurrent
                                  ? 'bg-gray-900 text-white'
                                  : 'bg-gray-200 text-gray-600'
                                : 'bg-white border-2 border-gray-200 text-gray-400'
                              }
                            `}
                          >
                            <Icon className="h-4 w-4" />
                          </div>

                          {/* Content */}
                          <div className="flex-1 pb-2">
                            <div className={`font-medium ${!isCompleted && 'text-gray-400'}`}>
                              {item.label}
                            </div>
                            {isCompleted && item.time && (
                              <div className="text-sm text-gray-500">
                                {format(new Date(item.time), 'h:mm a')}
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Actions Tab */}
          <TabsContent value="actions" className="space-y-4 mt-4">
            {/* Status Actions */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3">Update Status</h3>
                <div className="grid grid-cols-2 gap-2">
                  {order.status === 'PENDING' && (
                    <Button
                      onClick={() => onStatusUpdate?.('PREPARING')}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <ChefHat className="h-4 w-4 mr-2" />
                      Start Preparing
                    </Button>
                  )}

                  {order.status === 'PREPARING' && (
                    <Button
                      onClick={() => onStatusUpdate?.('READY')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Package className="h-4 w-4 mr-2" />
                      Mark Ready
                    </Button>
                  )}

                  {order.status === 'READY' && (
                    <Button
                      onClick={() => onStatusUpdate?.('COMPLETED')}
                      className="bg-gray-600 hover:bg-gray-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Complete Order
                    </Button>
                  )}

                  {(order.status === 'PENDING' || order.status === 'PREPARING') && (
                    <Button
                      onClick={() => onStatusUpdate?.('CANCELLED')}
                      variant="destructive"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Cancel Order
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Print Actions */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3">Print & Export</h3>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={handlePrintReceipt}
                    disabled={isPrinting}
                    variant="outline"
                  >
                    <Printer className="h-4 w-4 mr-2" />
                    {isPrinting ? 'Printing...' : 'Print Receipt'}
                  </Button>
                  <Button variant="outline">
                    <Receipt className="h-4 w-4 mr-2" />
                    Email Receipt
                  </Button>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                  <Button variant="outline">
                    <Printer className="h-4 w-4 mr-2" />
                    Print Kitchen Ticket
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Other Actions */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3">Order Management</h3>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    onClick={duplicateOrder}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Duplicate Order
                  </Button>
                  <Button variant="outline">
                    <History className="h-4 w-4 mr-2" />
                    View History
                  </Button>
                  {order.status === 'COMPLETED' && (
                    <>
                      <Button
                        variant="outline"
                        className="text-orange-600 border-orange-600 hover:bg-orange-50"
                        onClick={() => setVoidRefundModal({ isOpen: true, mode: 'refund' })}
                      >
                        <DollarSign className="h-4 w-4 mr-2" />
                        Process Refund
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setVoidRefundModal({ isOpen: true, mode: 'void' })}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Void Order
                      </Button>
                    </>
                  )}
                  {(order.status === 'PENDING' || order.status === 'PREPARING') && (
                    <Button
                      variant="outline"
                      className="text-red-600 border-red-600 hover:bg-red-50"
                      onClick={() => setVoidRefundModal({ isOpen: true, mode: 'void' })}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Void Order
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>

      {/* Void/Refund Modal */}
      {voidRefundModal.isOpen && (
        <VoidRefundModal
          isOpen={voidRefundModal.isOpen}
          onClose={() => setVoidRefundModal({ isOpen: false, mode: 'void' })}
          order={{
            id: order.id,
            orderNumber: order.orderNumber,
            total: order.total,
            status: order.status,
            paymentMethod: order.paymentMethod,
          }}
          mode={voidRefundModal.mode}
          onConfirm={handleVoidRefund}
        />
      )}
    </>
  )
}