import { NavLink } from 'react-router-dom'
import { Package, Home } from 'lucide-react'

export default function Sidebar() {
  return (
    <div className="hidden md:block w-64 bg-white shadow-sm">
      <div className="h-full px-3 py-4 overflow-y-auto">
        <ul className="space-y-2 font-medium">
          <li>
            <NavLink
              to="/orders"
              className={({ isActive }) =>
                `flex items-center p-3 text-gray-900 rounded-lg hover:bg-gray-100 ${
                  isActive ? 'bg-blue-50 text-blue-700' : ''
                }`
              }
            >
              <Package className="w-5 h-5" />
              <span className="ml-3">Orders</span>
            </NavLink>
          </li>
        </ul>
      </div>
    </div>
  )
}
