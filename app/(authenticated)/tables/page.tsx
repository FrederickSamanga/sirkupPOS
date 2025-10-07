'use client'

import { useState, useEffect } from 'react'
import { Navigation } from '@/components/ui/navigation'
import { Users, Clock, CheckCircle, AlertCircle } from 'lucide-react'

interface Table {
  id: string
  number: string
  capacity: number
  status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'CLEANING'
  section: string
  position: { x: number; y: number }
  guestCount?: number
  orderTotal?: number
  occupiedAt?: string
}

export default function TablesPage() {
  const [tables, setTables] = useState<Table[]>([])
  const [selectedSection, setSelectedSection] = useState('main')
  const [selectedTable, setSelectedTable] = useState<Table | null>(null)

  useEffect(() => {
    fetchTables()
  }, [])

  const fetchTables = async () => {
    try {
      // Mock data - replace with actual API call
      const mockTables: Table[] = [
        { id: '1', number: 'M1', capacity: 2, status: 'AVAILABLE', section: 'main', position: { x: 100, y: 100 } },
        { id: '2', number: 'M2', capacity: 4, status: 'OCCUPIED', section: 'main', position: { x: 250, y: 100 }, guestCount: 3, orderTotal: 45.50, occupiedAt: new Date().toISOString() },
        { id: '3', number: 'M3', capacity: 4, status: 'AVAILABLE', section: 'main', position: { x: 400, y: 100 } },
        { id: '4', number: 'M4', capacity: 6, status: 'RESERVED', section: 'main', position: { x: 100, y: 250 } },
        { id: '5', number: 'P1', capacity: 4, status: 'AVAILABLE', section: 'patio', position: { x: 100, y: 100 } },
        { id: '6', number: 'P2', capacity: 6, status: 'OCCUPIED', section: 'patio', position: { x: 250, y: 100 }, guestCount: 5, orderTotal: 120.00, occupiedAt: new Date().toISOString() },
        { id: '7', number: 'V1', capacity: 8, status: 'RESERVED', section: 'vip', position: { x: 100, y: 100 } },
        { id: '8', number: 'V2', capacity: 10, status: 'AVAILABLE', section: 'vip', position: { x: 300, y: 100 } },
      ]
      setTables(mockTables)
    } catch (error) {
      console.error('Error fetching tables:', error)
    }
  }

  const getTableColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-green-100 border-green-300 hover:bg-green-200'
      case 'OCCUPIED':
        return 'bg-red-100 border-red-300'
      case 'RESERVED':
        return 'bg-yellow-100 border-yellow-300'
      case 'CLEANING':
        return 'bg-gray-100 border-gray-300'
      default:
        return 'bg-gray-100 border-gray-300'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'OCCUPIED':
        return <Users className="h-4 w-4 text-red-600" />
      case 'RESERVED':
        return <Clock className="h-4 w-4 text-yellow-600" />
      case 'CLEANING':
        return <AlertCircle className="h-4 w-4 text-gray-600" />
      default:
        return null
    }
  }

  const handleTableClick = (table: Table) => {
    setSelectedTable(table)
  }

  const handleStatusChange = (tableId: string, newStatus: Table['status']) => {
    setTables(prev =>
      prev.map(table =>
        table.id === tableId ? { ...table, status: newStatus } : table
      )
    )
    if (selectedTable?.id === tableId) {
      setSelectedTable({ ...selectedTable, status: newStatus })
    }
  }

  const sections = ['main', 'patio', 'vip']
  const filteredTables = tables.filter(table => table.section === selectedSection)

  // Calculate statistics
  const stats = {
    available: tables.filter(t => t.status === 'AVAILABLE').length,
    occupied: tables.filter(t => t.status === 'OCCUPIED').length,
    reserved: tables.filter(t => t.status === 'RESERVED').length,
    totalRevenue: tables.filter(t => t.status === 'OCCUPIED').reduce((sum, t) => sum + (t.orderTotal || 0), 0)
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Navigation />
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Table Management</h1>
          <p className="text-gray-600 mt-1">Monitor and manage restaurant tables</p>
        </div>

        {/* Stats Bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="grid grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.available}</div>
              <div className="text-sm text-gray-500">Available</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.occupied}</div>
              <div className="text-sm text-gray-500">Occupied</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.reserved}</div>
              <div className="text-sm text-gray-500">Reserved</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">${stats.totalRevenue.toFixed(2)}</div>
              <div className="text-sm text-gray-500">Current Revenue</div>
            </div>
          </div>
        </div>

        {/* Section Tabs */}
        <div className="bg-white border-b border-gray-200 px-6 py-3">
          <div className="flex space-x-4">
            {sections.map((section) => (
              <button
                key={section}
                onClick={() => setSelectedSection(section)}
                className={`px-4 py-2 rounded-lg font-medium capitalize transition-colors ${
                  selectedSection === section
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {section} Floor
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex">
          {/* Floor Plan */}
          <div className="flex-1 p-6">
            <div className="bg-white rounded-lg border border-gray-200 h-full relative overflow-auto">
              <div className="min-h-full relative" style={{ width: '800px', height: '600px' }}>
                {filteredTables.map((table) => {
                  const isRound = table.capacity <= 4
                  const size = table.capacity <= 2 ? 110 : table.capacity <= 4 ? 130 : table.capacity <= 6 ? 150 : 170

                  return (
                    <div
                      key={table.id}
                      className="absolute cursor-pointer group"
                      style={{
                        left: `${table.position.x}px`,
                        top: `${table.position.y}px`,
                        width: `${size}px`,
                        height: `${size}px`,
                      }}
                      onClick={() => handleTableClick(table)}
                    >
                      {/* Table Shadow */}
                      <div
                        className="absolute inset-0 blur-md opacity-30 transition-all group-hover:opacity-50"
                        style={{
                          background: 'radial-gradient(circle, rgba(0,0,0,0.3) 0%, transparent 70%)',
                          transform: 'scale(0.95) translateY(10px)',
                        }}
                      />

                      {/* Table Top */}
                      <div
                        className={`absolute inset-0 transition-all duration-300 ${
                          isRound ? 'rounded-full' : 'rounded-2xl'
                        } ${
                          table.status === 'AVAILABLE'
                            ? 'bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-600 shadow-emerald-500/50'
                            : table.status === 'OCCUPIED'
                            ? 'bg-gradient-to-br from-rose-400 via-rose-500 to-rose-600 shadow-rose-500/50'
                            : table.status === 'RESERVED'
                            ? 'bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 shadow-amber-500/50'
                            : 'bg-gradient-to-br from-slate-300 via-slate-400 to-slate-500 shadow-slate-500/50'
                        } shadow-2xl border-4 ${
                          table.status === 'AVAILABLE'
                            ? 'border-emerald-300'
                            : table.status === 'OCCUPIED'
                            ? 'border-rose-300'
                            : table.status === 'RESERVED'
                            ? 'border-amber-300'
                            : 'border-slate-300'
                        } group-hover:scale-105 group-hover:shadow-3xl`}
                        style={{
                          boxShadow: `
                            0 20px 25px -5px rgba(0, 0, 0, 0.1),
                            0 10px 10px -5px rgba(0, 0, 0, 0.04),
                            inset 0 2px 4px 0 rgba(255, 255, 255, 0.3),
                            inset 0 -2px 4px 0 rgba(0, 0, 0, 0.2)
                          `,
                        }}
                      >
                        {/* Wood grain texture overlay */}
                        <div
                          className={`absolute inset-0 opacity-20 ${isRound ? 'rounded-full' : 'rounded-2xl'}`}
                          style={{
                            backgroundImage: `repeating-linear-gradient(
                              90deg,
                              rgba(0, 0, 0, 0.03) 0px,
                              rgba(0, 0, 0, 0.03) 1px,
                              transparent 1px,
                              transparent 2px
                            )`,
                          }}
                        />

                        {/* Glossy highlight */}
                        <div
                          className={`absolute inset-0 ${isRound ? 'rounded-full' : 'rounded-2xl'}`}
                          style={{
                            background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 50%)',
                          }}
                        />

                        {/* Table Content */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-3">
                          {/* Status indicator pulse */}
                          {(table.status === 'OCCUPIED' || table.status === 'RESERVED') && (
                            <div className="absolute top-2 right-2">
                              <div className={`w-3 h-3 rounded-full ${
                                table.status === 'OCCUPIED' ? 'bg-white' : 'bg-yellow-200'
                              } animate-pulse shadow-lg`} />
                            </div>
                          )}

                          {/* Table Number Badge */}
                          <div className={`
                            px-4 py-2 rounded-full font-bold text-xl mb-2
                            bg-white/90 backdrop-blur-sm shadow-lg
                            ${table.status === 'AVAILABLE' ? 'text-emerald-700' :
                              table.status === 'OCCUPIED' ? 'text-rose-700' :
                              table.status === 'RESERVED' ? 'text-amber-700' :
                              'text-slate-700'}
                            border-2 ${
                              table.status === 'AVAILABLE' ? 'border-emerald-300' :
                              table.status === 'OCCUPIED' ? 'border-rose-300' :
                              table.status === 'RESERVED' ? 'border-amber-300' :
                              'border-slate-300'
                            }
                          `}>
                            {table.number}
                          </div>

                          {/* Capacity */}
                          <div className="flex items-center gap-1 px-3 py-1 bg-white/80 backdrop-blur-sm rounded-full shadow-md mb-1">
                            <Users className="h-3.5 w-3.5 text-gray-700" />
                            <span className="text-sm font-semibold text-gray-800">
                              {table.guestCount || 0}/{table.capacity}
                            </span>
                          </div>

                          {/* Order Total */}
                          {table.orderTotal && (
                            <div className="px-3 py-1 bg-white/80 backdrop-blur-sm rounded-full shadow-md">
                              <span className="text-sm font-bold text-gray-900">
                                ${table.orderTotal.toFixed(2)}
                              </span>
                            </div>
                          )}

                          {/* Status Icon */}
                          <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
                            <div className="p-1.5 bg-white/90 backdrop-blur-sm rounded-full shadow-lg">
                              {getStatusIcon(table.status)}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Table Legs (for rectangular tables) */}
                      {!isRound && (
                        <>
                          {[...Array(4)].map((_, i) => (
                            <div
                              key={i}
                              className="absolute w-3 h-8 bg-gradient-to-b from-amber-700 to-amber-900 rounded-b-lg shadow-lg"
                              style={{
                                left: i % 2 === 0 ? '10%' : '80%',
                                top: i < 2 ? '-8px' : 'calc(100% + 8px)',
                                transform: 'perspective(100px) rotateX(10deg)',
                              }}
                            />
                          ))}
                        </>
                      )}

                      {/* Center pedestal (for round tables) */}
                      {isRound && (
                        <div
                          className="absolute left-1/2 top-full w-6 h-8 bg-gradient-to-b from-amber-700 to-amber-900 rounded-b-lg shadow-lg"
                          style={{
                            transform: 'translateX(-50%) perspective(100px) rotateX(10deg)',
                          }}
                        />
                      )}
                    </div>
                  )
                })}

                {filteredTables.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No tables in this section</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Side Panel */}
          {selectedTable && (
            <div className="w-80 p-6 bg-white border-l border-gray-200">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Table {selectedTable.number}</h3>
                  <p className="text-sm text-gray-500">Section: {selectedTable.section}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Status:</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      selectedTable.status === 'AVAILABLE' ? 'bg-green-100 text-green-800' :
                      selectedTable.status === 'OCCUPIED' ? 'bg-red-100 text-red-800' :
                      selectedTable.status === 'RESERVED' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedTable.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Capacity:</span>
                    <span className="text-sm font-medium">{selectedTable.capacity} guests</span>
                  </div>
                  {selectedTable.guestCount !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Current Guests:</span>
                      <span className="text-sm font-medium">{selectedTable.guestCount}</span>
                    </div>
                  )}
                  {selectedTable.orderTotal !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Order Total:</span>
                      <span className="text-sm font-medium">${selectedTable.orderTotal.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                <div className="pt-4 space-y-2">
                  <button
                    onClick={() => handleStatusChange(selectedTable.id, 'AVAILABLE')}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    disabled={selectedTable.status === 'AVAILABLE'}
                  >
                    Mark Available
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedTable.id, 'OCCUPIED')}
                    className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    disabled={selectedTable.status === 'OCCUPIED'}
                  >
                    Mark Occupied
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedTable.id, 'CLEANING')}
                    className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                    disabled={selectedTable.status === 'CLEANING'}
                  >
                    Mark for Cleaning
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}