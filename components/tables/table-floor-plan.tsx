'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence, PanInfo } from 'framer-motion'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'
// import { Table } from '@/app/(authenticated)/tables/page'
type Table = any
import { cn } from '@/lib/utils'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Users,
  Clock,
  DollarSign,
  UserCheck,
  XCircle,
  Sparkles,
  Calendar,
  ChefHat,
  Package,
  Edit3,
  Trash2,
  Copy,
  RotateCw,
  Square,
  Circle,
  RectangleHorizontal,
} from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'

interface TableFloorPlanProps {
  tables: Table[]
  selectedTable: Table | null
  onTableSelect: (table: Table) => void
  onTableMove?: (tableId: string, position: { x: number; y: number }) => void
  onTableAction: (action: string, table: Table) => void
  showGrid: boolean
  showLabels: boolean
  zoom: number
  isEditMode: boolean
}

// Status colors with gradients for visual appeal
const STATUS_STYLES = {
  AVAILABLE: {
    bg: 'bg-gradient-to-br from-green-50 to-green-100',
    border: 'border-green-400',
    shadow: 'shadow-green-200/50',
    icon: null,
    pulse: false,
  },
  OCCUPIED: {
    bg: 'bg-gradient-to-br from-blue-50 to-blue-100',
    border: 'border-blue-400',
    shadow: 'shadow-blue-200/50',
    icon: Users,
    pulse: false,
  },
  RESERVED: {
    bg: 'bg-gradient-to-br from-yellow-50 to-yellow-100',
    border: 'border-yellow-400',
    shadow: 'shadow-yellow-200/50',
    icon: Calendar,
    pulse: true,
  },
  CLEANING: {
    bg: 'bg-gradient-to-br from-gray-50 to-gray-100',
    border: 'border-gray-400',
    shadow: 'shadow-gray-200/50',
    icon: Sparkles,
    pulse: true,
  },
}

// Table shapes
const getTableShape = (shape: Table['shape'], size: Table['size']) => {
  const sizes = {
    SMALL: { w: 60, h: 60 },
    MEDIUM: { w: 80, h: 80 },
    LARGE: { w: 100, h: 100 },
  }

  const dimensions = sizes[size]

  switch (shape) {
    case 'ROUND':
      return { width: dimensions.w, height: dimensions.h, borderRadius: '50%' }
    case 'SQUARE':
      return { width: dimensions.w, height: dimensions.h, borderRadius: '12px' }
    case 'RECTANGLE':
      return { width: dimensions.w * 1.5, height: dimensions.h, borderRadius: '12px' }
    default:
      return { width: dimensions.w, height: dimensions.h, borderRadius: '12px' }
  }
}

export function TableFloorPlan({
  tables,
  selectedTable,
  onTableSelect,
  onTableMove,
  onTableAction,
  showGrid,
  showLabels,
  zoom,
  isEditMode,
}: TableFloorPlanProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [draggedTable, setDraggedTable] = useState<string | null>(null)
  const [hoveredTable, setHoveredTable] = useState<string | null>(null)

  // Grid snapping
  const snapToGrid = (value: number, gridSize: number = 25) => {
    return Math.round(value / gridSize) * gridSize
  }

  // Handle drag end
  const handleDragEnd = useCallback((tableId: string, info: PanInfo) => {
    if (!onTableMove || !containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const x = snapToGrid(info.point.x - rect.left)
    const y = snapToGrid(info.point.y - rect.top)

    onTableMove(tableId, { x, y })
    setDraggedTable(null)
  }, [onTableMove])

  // Render individual table
  const renderTable = (table: Table) => {
    const status = STATUS_STYLES[table.status]
    const dimensions = getTableShape(table.shape, table.size)
    const isSelected = selectedTable?.id === table.id
    const isHovered = hoveredTable === table.id
    const isDragging = draggedTable === table.id

    const Icon = status.icon

    return (
      <motion.div
        key={table.id}
        drag={isEditMode}
        dragMomentum={false}
        dragElastic={0}
        onDragStart={() => setDraggedTable(table.id)}
        onDragEnd={(e, info) => handleDragEnd(table.id, info)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={{
          x: table.position.x,
          y: table.position.y,
          rotate: table.rotation,
        }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 25,
        }}
        style={{
          position: 'absolute',
          ...dimensions,
          cursor: isEditMode ? 'move' : 'pointer',
          zIndex: isDragging ? 50 : isSelected ? 20 : isHovered ? 10 : 1,
        }}
        onMouseEnter={() => setHoveredTable(table.id)}
        onMouseLeave={() => setHoveredTable(null)}
        onClick={() => !isEditMode && onTableSelect(table)}
      >
        <ContextMenuTrigger>
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.div
                  className={cn(
                    'relative w-full h-full border-2 flex flex-col items-center justify-center transition-all',
                    status.bg,
                    status.border,
                    isSelected && 'ring-2 ring-gray-900 ring-offset-2',
                    isDragging && 'opacity-50',
                    'hover:shadow-lg',
                    status.shadow
                  )}
                  style={{
                    borderRadius: dimensions.borderRadius,
                    boxShadow: isHovered || isSelected ? `0 10px 25px -5px var(--tw-shadow-color)` : undefined,
                  }}
                >
                  {/* Pulse animation for reserved/cleaning */}
                  {status.pulse && (
                    <motion.div
                      className="absolute inset-0 rounded-full opacity-30"
                      style={{
                        background: `radial-gradient(circle, ${table.status === 'RESERVED' ? 'rgb(250 204 21)' : 'rgb(156 163 175)'} 0%, transparent 70%)`,
                        borderRadius: dimensions.borderRadius,
                      }}
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.1, 0.3],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                    />
                  )}

                  {/* Table Number */}
                  {showLabels && (
                    <div className="text-lg font-bold text-gray-900">
                      {table.name}
                    </div>
                  )}

                  {/* Status Icon */}
                  {Icon && (
                    <Icon className="h-5 w-5 text-gray-600 mt-1" />
                  )}

                  {/* Guest Count */}
                  {table.guestCount && (
                    <div className="absolute -top-2 -right-2 bg-gray-900 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                      {table.guestCount}
                    </div>
                  )}

                  {/* Time indicator for occupied tables */}
                  {table.occupiedAt && (
                    <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-600 whitespace-nowrap">
                      <Clock className="inline h-3 w-3 mr-1" />
                      {formatDistanceToNow(new Date(table.occupiedAt), { addSuffix: false })}
                    </div>
                  )}
                </motion.div>
              </TooltipTrigger>
              <TooltipContent side="top" className="bg-gray-900 text-white">
                <div className="space-y-1">
                  <div className="font-semibold">{table.name} - Table {table.number}</div>
                  <div className="text-xs">
                    Status: <span className="capitalize">{table.status.toLowerCase()}</span>
                  </div>
                  <div className="text-xs">Capacity: {table.capacity} guests</div>
                  {table.guestCount && (
                    <div className="text-xs">Current: {table.guestCount} guests</div>
                  )}
                  {table.orderTotal && (
                    <div className="text-xs">Order: ${table.orderTotal.toFixed(2)}</div>
                  )}
                  {table.reservationTime && (
                    <div className="text-xs">
                      Reserved: {format(new Date(table.reservationTime), 'h:mm a')}
                    </div>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </ContextMenuTrigger>

        <ContextMenu>
          <ContextMenuContent className="w-48">
            <ContextMenuLabel>{table.name} - Table {table.number}</ContextMenuLabel>
            <ContextMenuSeparator />

            {table.status === 'AVAILABLE' && (
              <>
                <ContextMenuItem onClick={() => onTableAction('occupy', table)}>
                  <Users className="h-4 w-4 mr-2" />
                  Assign Guests
                </ContextMenuItem>
                <ContextMenuItem onClick={() => onTableAction('reserve', table)}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Make Reservation
                </ContextMenuItem>
              </>
            )}

            {table.status === 'OCCUPIED' && (
              <>
                <ContextMenuItem onClick={() => onTableAction('order', table)}>
                  <Package className="h-4 w-4 mr-2" />
                  View Order
                </ContextMenuItem>
                <ContextMenuItem onClick={() => onTableAction('clear', table)}>
                  <XCircle className="h-4 w-4 mr-2" />
                  Clear Table
                </ContextMenuItem>
              </>
            )}

            {table.status === 'RESERVED' && (
              <>
                <ContextMenuItem onClick={() => onTableAction('checkin', table)}>
                  <UserCheck className="h-4 w-4 mr-2" />
                  Check In
                </ContextMenuItem>
                <ContextMenuItem onClick={() => onTableAction('cancel', table)}>
                  <XCircle className="h-4 w-4 mr-2" />
                  Cancel Reservation
                </ContextMenuItem>
              </>
            )}

            {table.status === 'CLEANING' && (
              <ContextMenuItem onClick={() => onTableAction('clean', table)}>
                <Sparkles className="h-4 w-4 mr-2" />
                Mark Clean
              </ContextMenuItem>
            )}

            {isEditMode && (
              <>
                <ContextMenuSeparator />
                <ContextMenuItem onClick={() => onTableAction('edit', table)}>
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit Properties
                </ContextMenuItem>
                <ContextMenuItem onClick={() => onTableAction('duplicate', table)}>
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate
                </ContextMenuItem>
                <ContextMenuItem onClick={() => onTableAction('rotate', table)}>
                  <RotateCw className="h-4 w-4 mr-2" />
                  Rotate
                </ContextMenuItem>
                <ContextMenuItem
                  onClick={() => onTableAction('delete', table)}
                  className="text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </ContextMenuItem>
              </>
            )}
          </ContextMenuContent>
        </ContextMenu>
      </motion.div>
    )
  }

  return (
    <TransformWrapper
      initialScale={zoom}
      minScale={0.5}
      maxScale={2}
      centerOnInit
      wheel={{ step: 0.1 }}
      disabled={isEditMode}
    >
      <TransformComponent>
        <div
          ref={containerRef}
          className="relative w-full h-full bg-gray-50 rounded-lg overflow-hidden"
          style={{
            backgroundImage: showGrid
              ? `linear-gradient(0deg, transparent 24%, rgba(0,0,0,.03) 25%, rgba(0,0,0,.03) 26%, transparent 27%, transparent 74%, rgba(0,0,0,.03) 75%, rgba(0,0,0,.03) 76%, transparent 77%, transparent),
                 linear-gradient(90deg, transparent 24%, rgba(0,0,0,.03) 25%, rgba(0,0,0,.03) 26%, transparent 27%, transparent 74%, rgba(0,0,0,.03) 75%, rgba(0,0,0,.03) 76%, transparent 77%, transparent)`
              : undefined,
            backgroundSize: showGrid ? '50px 50px' : undefined,
            minHeight: '600px',
            minWidth: '800px',
          }}
        >
          {/* Section Labels */}
          <div className="absolute top-4 left-4 text-sm text-gray-400 font-medium">
            Main Floor
          </div>
          <div className="absolute top-4 right-4 text-sm text-gray-400 font-medium">
            Bar Area
          </div>
          <div className="absolute bottom-4 left-4 text-sm text-gray-400 font-medium">
            Patio
          </div>
          <div className="absolute bottom-4 right-4 text-sm text-gray-400 font-medium">
            VIP Section
          </div>

          {/* Tables */}
          <AnimatePresence>
            {tables.map(renderTable)}
          </AnimatePresence>
        </div>
      </TransformComponent>
    </TransformWrapper>
  )
}