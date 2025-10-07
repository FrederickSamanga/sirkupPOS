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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { AlertCircle, XCircle, DollarSign, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

interface VoidRefundModalProps {
  isOpen: boolean
  onClose: () => void
  order: {
    id: string
    orderNumber: number
    total: number
    status: string
    paymentMethod: string
  }
  mode: 'void' | 'refund'
  onConfirm: (data: VoidRefundData) => void
}

interface VoidRefundData {
  mode: 'void' | 'refund'
  reason: string
  amount?: number
  refundType?: 'full' | 'partial'
  notes?: string
}

const voidSchema = z.object({
  reason: z.string().min(5, 'Please provide a reason (at least 5 characters)'),
  notes: z.string().optional(),
})

const refundSchema = z.object({
  refundType: z.enum(['full', 'partial']),
  amount: z.number().positive('Amount must be positive').optional(),
  reason: z.string().min(5, 'Please provide a reason (at least 5 characters)'),
  notes: z.string().optional(),
})

type VoidFormData = z.infer<typeof voidSchema>
type RefundFormData = z.infer<typeof refundSchema>

const COMMON_VOID_REASONS = [
  'Customer cancelled order',
  'Wrong items ordered',
  'Duplicate order',
  'Kitchen unable to prepare',
  'Customer left',
  'Payment declined',
  'Test order',
]

const COMMON_REFUND_REASONS = [
  'Food quality issue',
  'Wrong order received',
  'Long wait time',
  'Customer complaint',
  'Missing items',
  'Overcharged',
  'Service issue',
]

export function VoidRefundModal({
  isOpen,
  onClose,
  order,
  mode,
  onConfirm,
}: VoidRefundModalProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [refundType, setRefundType] = useState<'full' | 'partial'>('full')
  const [customAmount, setCustomAmount] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<VoidFormData | RefundFormData>({
    resolver: zodResolver(mode === 'void' ? voidSchema : refundSchema),
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const handleReasonClick = (reason: string) => {
    setValue('reason', reason)
  }

  const onSubmit = async (data: VoidFormData | RefundFormData) => {
    setIsProcessing(true)

    try {
      const submitData: VoidRefundData = {
        mode,
        reason: data.reason,
        notes: data.notes,
      }

      if (mode === 'refund') {
        const refundData = data as RefundFormData
        submitData.refundType = refundType
        submitData.amount = refundType === 'partial'
          ? parseFloat(customAmount)
          : order.total
      }

      await onConfirm(submitData)

      toast.success(
        mode === 'void'
          ? `Order #${order.orderNumber} has been voided`
          : `Refund processed for Order #${order.orderNumber}`
      )

      reset()
      onClose()
    } catch (error) {
      console.error('Error processing:', error)
      toast.error(`Failed to ${mode} order`)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {mode === 'void' ? (
              <>
                <XCircle className="h-5 w-5 text-red-500" />
                Void Order #{order.orderNumber}
              </>
            ) : (
              <>
                <DollarSign className="h-5 w-5 text-orange-500" />
                Refund Order #{order.orderNumber}
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {mode === 'void'
              ? 'This action will cancel the order and cannot be undone.'
              : 'Process a refund for this completed order.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          {/* Warning Alert */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-yellow-800">
                {mode === 'void' ? 'Void Warning' : 'Refund Notice'}
              </p>
              <p className="text-yellow-700 mt-1">
                {mode === 'void'
                  ? 'Voiding will permanently cancel this order. The order status will be updated to CANCELLED.'
                  : `This will initiate a ${refundType} refund to the customer\'s original payment method.`}
              </p>
            </div>
          </div>

          {/* Order Details */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Order Total:</span>
              <span className="font-medium">{formatCurrency(order.total)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Payment Method:</span>
              <Badge variant="outline">{order.paymentMethod}</Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Current Status:</span>
              <Badge variant="secondary">{order.status}</Badge>
            </div>
          </div>

          {/* Refund Type (for refund mode only) */}
          {mode === 'refund' && (
            <div className="space-y-3">
              <Label>Refund Type</Label>
              <RadioGroup
                value={refundType}
                onValueChange={(value) => {
                  setRefundType(value as 'full' | 'partial')
                  if (value === 'full') {
                    setCustomAmount('')
                  }
                }}
              >
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                  <RadioGroupItem value="full" id="full" />
                  <Label htmlFor="full" className="flex-1 cursor-pointer">
                    <div className="font-medium">Full Refund</div>
                    <div className="text-sm text-gray-500">
                      Refund the entire amount: {formatCurrency(order.total)}
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                  <RadioGroupItem value="partial" id="partial" />
                  <Label htmlFor="partial" className="flex-1 cursor-pointer">
                    <div className="font-medium">Partial Refund</div>
                    <div className="text-sm text-gray-500">
                      Refund a specific amount
                    </div>
                  </Label>
                </div>
              </RadioGroup>

              {refundType === 'partial' && (
                <div className="space-y-2">
                  <Label htmlFor="amount">Refund Amount</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      className="pl-10"
                      max={order.total}
                      required
                    />
                  </div>
                  {parseFloat(customAmount) > order.total && (
                    <p className="text-sm text-red-500">
                      Amount cannot exceed order total
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">
              Reason <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="reason"
              placeholder={`Enter ${mode} reason...`}
              className="h-20"
              {...register('reason')}
            />
            {errors.reason && (
              <p className="text-sm text-red-500">{errors.reason.message}</p>
            )}

            {/* Quick Reasons */}
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Common reasons:</p>
              <div className="flex flex-wrap gap-2">
                {(mode === 'void' ? COMMON_VOID_REASONS : COMMON_REFUND_REASONS).map(
                  (reason) => (
                    <Button
                      key={reason}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleReasonClick(reason)}
                    >
                      {reason}
                    </Button>
                  )
                )}
              </div>
            </div>
          </div>

          {/* Additional Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Enter any additional notes..."
              className="h-16"
              {...register('notes')}
            />
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isProcessing || (refundType === 'partial' && !customAmount)}
              className={
                mode === 'void'
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-orange-600 hover:bg-orange-700'
              }
            >
              {isProcessing ? (
                <>Processing...</>
              ) : mode === 'void' ? (
                <>
                  <XCircle className="h-4 w-4 mr-2" />
                  Confirm Void
                </>
              ) : (
                <>
                  <DollarSign className="h-4 w-4 mr-2" />
                  Process Refund
                  {refundType === 'partial' && customAmount &&
                    ` (${formatCurrency(parseFloat(customAmount))})`}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}