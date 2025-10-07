import { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string
  icon?: LucideIcon
  trend?: number
  change?: string
  changeType?: 'positive' | 'negative'
}

export function StatsCard({ title, value, icon: Icon, trend, change, changeType }: StatsCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-3xl font-semibold text-gray-900 mt-1">{value}</p>
        </div>
      </div>
      {change && (
        <div className="mt-4">
          <span className={`text-sm ${
            changeType === 'positive' ? 'text-gray-600' : 'text-gray-400'
          }`}>
            {change} from yesterday
          </span>
        </div>
      )}
    </div>
  )
}