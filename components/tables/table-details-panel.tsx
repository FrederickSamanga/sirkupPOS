'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
// import { Table } from '@/app/(authenticated)/tables/page'
type Table = any
import { motion } from 'framer-motion'
import { format, formatDistanceToNow } from 'date-fns'
import {
  X,
  Users,
  Clock,
  DollarSign,
  Calendar,
  Package,
  UserCheck,
  XCircle,
  Sparkles,
  ChefHat,
  Edit3,
  Save,
  RotateCw,
  Square,
  Circle,
  RectangleHorizontal,
  Maximize,
  Minimize,
  Hash,
  MapPin,
} from 'lucide-react'

interface TableDetailsPanelProps {
  table: Table
  onClose: () => void
  onAction: (action: string, table: Table) => void
  onUpdate: (updates: Partial<Table>) => void
  isEditMode: boolean
}

const STATUS_COLORS = {
  AVAILABLE: 'bg-green-100 text-green-800',
  OCCUPIED: 'bg-blue-100 text-blue-800',
  RESERVED: 'bg-yellow-100 text-yellow-800',
  CLEANING: 'bg-gray-100 text-gray-800',
}

export function TableDetailsPanel({
  table,
  onClose,
  onAction,
  onUpdate,
  isEditMode,
}: TableDetailsPanelProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    name: table.name,
    number: table.number,
    capacity: table.capacity,
    section: table.section,
    shape: table.shape,
    size: table.size,
    rotation: table.rotation,
  })

  const handleSaveEdit = () => {
    onUpdate(editForm)
    setIsEditing(false)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              {isEditing ? (
                <Input
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="h-8 w-20"
                />
              ) : (
                table.name
              )}
              <Badge className={STATUS_COLORS[table.status]}>
                {table.status}
              </Badge>
            </CardTitle>
            <CardDescription>
              Table {table.number} · {table.section} Section
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-4 overflow-y-auto">
        {/* Quick Actions */}
        {!isEditing && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 gap-2"
          >
            {table.status === 'AVAILABLE' && (
              <>
                <Button
                  onClick={() => onAction('occupy', table)}
                  className="bg-blue-600 hover:bg-blue-700"
                  size="sm"
                >
                  <Users className="h-4 w-4 mr-1" />
                  Assign
                </Button>
                <Button
                  onClick={() => onAction('reserve', table)}
                  variant="outline"
                  size="sm"
                >
                  <Calendar className="h-4 w-4 mr-1" />
                  Reserve
                </Button>
              </>
            )}

            {table.status === 'OCCUPIED' && (
              <>
                <Button
                  onClick={() => onAction('order', table)}
                  variant="outline"
                  size="sm"
                >
                  <Package className="h-4 w-4 mr-1" />
                  Order
                </Button>
                <Button
                  onClick={() => onAction('clear', table)}
                  className="bg-orange-600 hover:bg-orange-700"
                  size="sm"
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              </>
            )}

            {table.status === 'RESERVED' && (
              <>
                <Button
                  onClick={() => onAction('checkin', table)}
                  className="bg-green-600 hover:bg-green-700"
                  size="sm"
                >
                  <UserCheck className="h-4 w-4 mr-1" />
                  Check In
                </Button>
                <Button
                  onClick={() => onAction('cancel', table)}
                  variant="destructive"
                  size="sm"
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
              </>
            )}

            {table.status === 'CLEANING' && (
              <Button
                onClick={() => onAction('clean', table)}
                className="bg-purple-600 hover:bg-purple-700 col-span-2"
                size="sm"
              >
                <Sparkles className="h-4 w-4 mr-1" />
                Mark as Clean
              </Button>
            )}
          </motion.div>
        )}

        <Separator />

        {/* Table Info */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Capacity</span>
            {isEditing ? (
              <Input
                type="number"
                value={editForm.capacity}
                onChange={(e) => setEditForm({ ...editForm, capacity: parseInt(e.target.value) })}
                className="h-7 w-16"
                min={1}
                max={20}
              />
            ) : (
              <span className="font-medium">{table.capacity} guests</span>
            )}
          </div>

          {table.guestCount !== undefined && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Current Guests</span>
              <span className="font-medium">{table.guestCount} guests</span>
            </div>
          )}

          {isEditing && (
            <>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Table Number</span>
                <Input
                  type="number"
                  value={editForm.number}
                  onChange={(e) => setEditForm({ ...editForm, number: parseInt(e.target.value) })}
                  className="h-7 w-16"
                  min={1}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-gray-600">Section</Label>
                <Select
                  value={editForm.section}
                  onValueChange={(value) => setEditForm({ ...editForm, section: value as any })}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MAIN">Main Floor</SelectItem>
                    <SelectItem value="PATIO">Patio</SelectItem>
                    <SelectItem value="VIP">VIP</SelectItem>
                    <SelectItem value="BAR">Bar</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-gray-600">Shape</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    type="button"
                    variant={editForm.shape === 'SQUARE' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setEditForm({ ...editForm, shape: 'SQUARE' })}
                  >
                    <Square className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant={editForm.shape === 'ROUND' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setEditForm({ ...editForm, shape: 'ROUND' })}
                  >
                    <Circle className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant={editForm.shape === 'RECTANGLE' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setEditForm({ ...editForm, shape: 'RECTANGLE' })}
                  >
                    <RectangleHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-gray-600">Size</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    type="button"
                    variant={editForm.size === 'SMALL' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setEditForm({ ...editForm, size: 'SMALL' })}
                  >
                    <Minimize className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant={editForm.size === 'MEDIUM' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setEditForm({ ...editForm, size: 'MEDIUM' })}
                  >
                    <Hash className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant={editForm.size === 'LARGE' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setEditForm({ ...editForm, size: 'LARGE' })}
                  >
                    <Maximize className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm text-gray-600">Rotation</Label>
                  <span className="text-sm">{editForm.rotation}°</span>
                </div>
                <Slider
                  value={[editForm.rotation]}
                  onValueChange={([value]) => setEditForm({ ...editForm, rotation: value })}
                  max={360}
                  step={15}
                  className="w-full"
                />
              </div>
            </>
          )}
        </div>

        {/* Status-specific information */}
        {table.status === 'OCCUPIED' && (
          <>
            <Separator />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-3"
            >
              <h4 className="text-sm font-semibold">Current Session</h4>

              {table.occupiedAt && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Duration
                  </span>
                  <span className="font-medium">
                    {formatDistanceToNow(new Date(table.occupiedAt))}
                  </span>
                </div>
              )}

              {table.orderId && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 flex items-center gap-1">
                    <Package className="h-3 w-3" />
                    Order
                  </span>
                  <Button
                    variant="link"
                    size="sm"
                    className="h-auto p-0"
                    onClick={() => onAction('viewOrder', table)}
                  >
                    #{table.orderId}
                  </Button>
                </div>
              )}

              {table.orderTotal && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    Bill
                  </span>
                  <span className="font-medium">
                    {formatCurrency(table.orderTotal)}
                  </span>
                </div>
              )}
            </motion.div>
          </>
        )}

        {table.status === 'RESERVED' && (
          <>
            <Separator />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-3"
            >
              <h4 className="text-sm font-semibold">Reservation Details</h4>

              {table.reservationName && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Guest Name</span>
                  <span className="font-medium">{table.reservationName}</span>
                </div>
              )}

              {table.reservationTime && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Time</span>
                  <span className="font-medium">
                    {format(new Date(table.reservationTime), 'h:mm a')}
                  </span>
                </div>
              )}
            </motion.div>
          </>
        )}

        {/* Edit Actions */}
        {isEditMode && (
          <>
            <Separator />
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button
                    onClick={handleSaveEdit}
                    className="flex-1"
                    size="sm"
                  >
                    <Save className="h-4 w-4 mr-1" />
                    Save Changes
                  </Button>
                  <Button
                    onClick={() => {
                      setIsEditing(false)
                      setEditForm({
                        name: table.name,
                        number: table.number,
                        capacity: table.capacity,
                        section: table.section,
                        shape: table.shape,
                        size: table.size,
                        rotation: table.rotation,
                      })
                    }}
                    variant="outline"
                    size="sm"
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => setIsEditing(true)}
                  variant="outline"
                  className="flex-1"
                  size="sm"
                >
                  <Edit3 className="h-4 w-4 mr-1" />
                  Edit Table
                </Button>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}