import { NavLink } from 'react-router-dom';
import { Home, Map, Calendar, AlertCircle, Sprout, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/', label: 'Dashboard', icon: Home },
  { path: '/lotes', label: 'Mis Lotes', icon: Map },
  { path: '/labores', label: 'Labores', icon: Sprout },
  { path: '/cortes', label: 'Cortes', icon: Calendar },
  { path: '/alertas', label: 'Alertas', icon: AlertCircle },
  { path: '/configuracion', label: 'Configuración', icon: Settings },
];

export function Sidebar() {
  return (
    <aside className="w-64 border-r bg-white dark:bg-gray-900 flex flex-col">
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <Sprout className="h-6 w-6 text-green-600" />
        <span className="font-bold text-lg">AlfalfaTrace</span>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
              )
            }
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}