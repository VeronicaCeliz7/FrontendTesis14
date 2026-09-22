import { NavLink } from 'react-router-dom';
import { Home, Map, Calendar, AlertCircle, Sprout, Settings, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

const navItems = [
  { path: '/', label: 'Dashboard', icon: Home },
  { path: '/lotes', label: 'Mis Lotes', icon: Map },
  { path: '/labores', label: 'Labores', icon: Sprout },
  { path: '/cortes', label: 'Cortes', icon: Calendar },
  { path: '/alertas', label: 'Alertas', icon: AlertCircle, badge: 3 },
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
        "w-72 min-h-screen border-r bg-white dark:bg-gray-950 flex flex-col shadow-lg z-[9999]",
        "md:relative md:translate-x-0",
        "fixed top-0 left-0 h-full transition-transform duration-300 ease-in-out",
        abierto ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}
    >
      {/* Header del sidebar */}
      <div className="flex h-20 items-center gap-3 border-b px-6">
        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-600/20">
          <Sprout className="h-7 w-7 text-white" />
        </div>
        <div className="flex-1">
          <span className="block text-xl font-extrabold text-gray-900 dark:text-white">
            AlfalfaTrace
          </span>
          <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
            Sistema de gestión
          </span>
        </div>
        <button
          onClick={onCerrar}
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
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
                {item.badge && (
                  <Badge className="ml-auto bg-red-500 hover:bg-red-600 text-white border-0 px-3 py-1 text-sm font-bold">
                    {item.badge}
                  </Badge>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}