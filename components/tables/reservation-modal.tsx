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
import { Calendar } from '@/components/ui/calendar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
// import { Table } from '@/app/(authenticated)/tables/page'
type Table = any
import { motion, AnimatePresence } from 'framer-motion'
import { format, addMinutes, setHours, setMinutes } from 'date-fns'
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Users,
  Phone,
  Mail,
  MessageSquare,
  CheckCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

interface ReservationModalProps {
  table: Table
  isOpen: boolean
  onClose: () => void
  onConfirm: (data: any) => void
}

const reservationSchema = z.object({
  reservationName: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().regex(/^\d{10}$/, 'Phone must be 10 digits'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  partySize: z.number().min(1).max(20),
  notes: z.string().optional(),
})

type ReservationFormData = z.infer<typeof reservationSchema>

// Generate time slots
const generateTimeSlots = () => {
  const slots = []
  const now = new Date()
  const startHour = 11 // 11 AM
  const endHour = 22 // 10 PM

  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const time = setMinutes(setHours(new Date(), hour), minute)
      if (time > now) {
        slots.push({
          value: time.toISOString(),
          label: format(time, 'h:mm a'),
        })
      }
    }
  }

  return slots
}

export function ReservationModal({
  table,
  isOpen,
  onClose,
  onConfirm,
}: ReservationModalProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [duration, setDuration] = useState<string>('90')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const timeSlots = generateTimeSlots()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<ReservationFormData>({
    resolver: zodResolver(reservationSchema),
    defaultValues: {
      partySize: table.capacity,
    },
  })

  const onSubmit = async (data: ReservationFormData) => {
    if (!selectedTime) {
      toast.error('Please select a reservation time')
      return
    }

    setIsSubmitting(true)

    try {
      const reservationTime = new Date(selectedTime)
      const endTime = addMinutes(reservationTime, parseInt(duration))

      const reservationData = {
        ...data,
        reservationTime: reservationTime.toISOString(),
        estimatedEndTime: endTime.toISOString(),
        duration: parseInt(duration),
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      onConfirm(reservationData)
      setShowSuccess(true)

      setTimeout(() => {
        reset()
        setSelectedTime('')
        setShowSuccess(false)
        onClose()
      }, 2000)
    } catch (error) {
      console.error('Error creating reservation:', error)
      toast.error('Failed to create reservation')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (showSuccess) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center justify-center py-8 space-y-4"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
            >
              <CheckCircle className="h-16 w-16 text-green-500" />
            </motion.div>
            <h2 className="text-xl font-bold">Reservation Confirmed!</h2>
            <p className="text-gray-600 text-center">
              Table {table.name} has been reserved
            </p>
          </motion.div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Reserve Table {table.name}</DialogTitle>
          <DialogDescription>
            Create a reservation for {table.name} (Capacity: {table.capacity} guests)
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Guest Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm">Guest Information</h3>

              <div className="space-y-2">
                <Label htmlFor="reservationName">
                  Name <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="reservationName"
                    placeholder="John Smith"
                    className="pl-10"
                    {...register('reservationName')}
                  />
                </div>
                {errors.reservationName && (
                  <p className="text-sm text-red-500">{errors.reservationName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">
                  Phone <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="phone"
                    placeholder="1234567890"
                    className="pl-10"
                    {...register('phone')}
                  />
                </div>
                {errors.phone && (
                  <p className="text-sm text-red-500">{errors.phone.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email (Optional)</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    className="pl-10"
                    {...register('email')}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="partySize">
                  Party Size <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Users className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="partySize"
                    type="number"
                    min={1}
                    max={table.capacity}
                    className="pl-10"
                    {...register('partySize', { valueAsNumber: true })}
                  />
                </div>
                {errors.partySize && (
                  <p className="text-sm text-red-500">{errors.partySize.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Special Requests</Label>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Textarea
                    id="notes"
                    placeholder="Birthday celebration, dietary restrictions, etc."
                    className="pl-10 h-20"
                    {...register('notes')}
                  />
                </div>
              </div>
            </div>

            {/* Date & Time Selection */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm">Date & Time</h3>

              <div className="space-y-2">
                <Label>Select Date</Label>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                  className="rounded-md border"
                />
              </div>

              <div className="space-y-2">
                <Label>Select Time</Label>
                <Select value={selectedTime} onValueChange={setSelectedTime}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a time slot">
                      {selectedTime && (
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          {format(new Date(selectedTime), 'h:mm a')}
                        </div>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {timeSlots.map((slot) => (
                      <SelectItem key={slot.value} value={slot.value}>
                        {slot.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Duration</Label>
                <Select value={duration} onValueChange={setDuration}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="90">1.5 hours</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                    <SelectItem value="150">2.5 hours</SelectItem>
                    <SelectItem value="180">3 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {selectedTime && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-50 rounded-lg p-3 space-y-2"
                >
                  <h4 className="text-sm font-semibold">Reservation Summary</h4>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date:</span>
                      <span>{format(selectedDate, 'MMM d, yyyy')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Time:</span>
                      <span>{format(new Date(selectedTime), 'h:mm a')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duration:</span>
                      <span>{parseInt(duration) / 60} hours</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Table:</span>
                      <Badge variant="secondary">{table.name}</Badge>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          <Separator />

          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !selectedTime}
              className="bg-gray-900 hover:bg-gray-800"
            >
              {isSubmitting ? (
                <>Creating Reservation...</>
              ) : (
                <>
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  Confirm Reservation
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}