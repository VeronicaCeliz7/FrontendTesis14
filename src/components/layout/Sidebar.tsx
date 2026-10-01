import { NavLink } from 'react-router-dom';
import { Home, Map, Calendar, AlertCircle, Sprout, Settings, X } from 'lucide-react';
import { cn } from '@/lib/utils';


const navItems = [
  { path: '/', label: 'Dashboard', icon: Home },
  { path: '/lotes', label: 'Mis Lotes', icon: Map },
  { path: '/labores', label: 'Labores', icon: Sprout },
  { path: '/cortes', label: 'Cortes', icon: Calendar },
  { path: '/alertas', label: 'Alertas', icon: AlertCircle }, 
  { path: '/configuracion', label: 'Configuración', icon: Settings },
];

interface SidebarProps {
  abierto?: boolean;
  onCerrar?: () => void;
}

export function Sidebar({ abierto = false, onCerrar }: SidebarProps) {
  return (
    <aside
      className={cn(
        "w-72 md:w-64 h-full border-r bg-white dark:bg-gray-950 flex flex-col shadow-lg z-[9999]",
        "fixed top-0 left-0 transition-transform duration-300 ease-in-out",
        abierto ? "translate-x-0" : "-translate-x-full"
      )}
    >
      {/* Header del sidebar */}
      <div className="flex h-16 items-center gap-3 border-b px-4 flex-shrink-0">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-600/20 flex-shrink-0">
          <Sprout className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <span className="block text-lg font-extrabold text-gray-900 dark:text-white truncate">
            AlfalfaTrace
          </span>
          <span className="block text-xs font-medium text-gray-600 dark:text-gray-300 truncate">
            Sistema de gestión
          </span>
        </div>
        <button
          onClick={onCerrar}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex-shrink-0"
          aria-label="Cerrar menú"
        >
          <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
        </button>
      </div>

      {/* Menú */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => onCerrar?.()}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-4 rounded-xl px-5 py-4 text-base font-semibold transition-all duration-200",
                isActive
                  ? "bg-secondary text-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon
                  className={cn(
                    "h-6 w-6 transition-colors stroke-[2.5]",
                    isActive ? "text-[hsl(var(--success))]" : "text-muted-foreground"
                  )}
                />
                <span className="text-base font-semibold">{item.label}</span>
               
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}