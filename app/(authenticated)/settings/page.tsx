'use client'

import { useState } from 'react'
import { Navigation } from '@/components/ui/navigation'
import {
  User,
  Store,
  Bell,
  Shield,
  CreditCard,
  Database,
  Palette,
  Save
} from 'lucide-react'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general')

  const tabs = [
    { id: 'general', label: 'General', icon: Store },
    { id: 'users', label: 'Users', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'backup', label: 'Backup', icon: Database },
    { id: 'appearance', label: 'Appearance', icon: Palette },
  ]

  return (
    <div className="flex h-screen bg-gray-50">
      <Navigation />
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600 mt-2">Manage your restaurant settings and preferences</p>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="flex border-b">
              <div className="w-64 p-6 border-r">
                <nav className="space-y-2">
                  {tabs.map((tab) => {
                    const Icon = tab.icon
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                          activeTab === tab.id
                            ? 'bg-gray-100 text-gray-900 font-medium'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span>{tab.label}</span>
                      </button>
                    )
                  })}
                </nav>
              </div>

              <div className="flex-1 p-8">
                {activeTab === 'general' && (
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-6">General Settings</h2>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Restaurant Name
                        </label>
                        <input
                          type="text"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
                          defaultValue="Amaya Cafe"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tax Rate (%)
                        </label>
                        <input
                          type="number"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
                          defaultValue="8"
                          step="0.01"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Currency
                        </label>
                        <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900">
                          <option>USD</option>
                          <option>EUR</option>
                          <option>GBP</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Time Zone
                        </label>
                        <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900">
                          <option>America/New_York</option>
                          <option>America/Los_Angeles</option>
                          <option>Europe/London</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'users' && (
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-6">User Management</h2>
                    <div className="space-y-4">
                      {[
                        { name: 'Admin User', email: 'admin@amayacafe.com', role: 'Admin' },
                        { name: 'Cashier User', email: 'cashier@amayacafe.com', role: 'Cashier' },
                        { name: 'Kitchen Staff', email: 'kitchen@amayacafe.com', role: 'Kitchen' },
                      ].map((user) => (
                        <div key={user.email} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                          <div>
                            <div className="font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                              {user.role}
                            </span>
                            <button className="text-gray-500 hover:text-gray-700">Edit</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add content for other tabs as needed */}
                {activeTab !== 'general' && activeTab !== 'users' && (
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-6 capitalize">{activeTab} Settings</h2>
                    <p className="text-gray-600">Settings for {activeTab} will appear here.</p>
                  </div>
                )}

                {/* Save Button */}
                <div className="mt-8 flex justify-end">
                  <button className="flex items-center space-x-2 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors">
                    <Save className="h-5 w-5" />
                    <span>Save Changes</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}