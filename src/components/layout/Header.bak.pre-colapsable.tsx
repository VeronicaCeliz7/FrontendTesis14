import { useState, useEffect, useRef } from 'react';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { UserNav } from './UserNav';
import { Search, X, Menu } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface HeaderProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
  onToggleSidebar?: () => void;
}

export function Header({
  onSearch,
  placeholder = "Buscar lote o campo...",
  onToggleSidebar,
}: HeaderProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (onSearch) onSearch(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, onSearch]);

  const handleClear = () => {
    setQuery('');
    inputRef.current?.focus();
  };

  return (
    <header className="flex h-16 items-center gap-3 border-b bg-white dark:bg-gray-950 px-4 sm:px-6 flex-shrink-0">
      {/* Botón hamburguesa (solo mobile) */}
      <button
        onClick={onToggleSidebar}
        className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex-shrink-0"
        aria-label="Abrir menú"
      >
        <Menu className="h-6 w-6 text-gray-700 dark:text-gray-300" />
      </button>

      {/* Buscador */}
      <div className="flex-1 max-w-2xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
           className={cn(
  "pl-9 pr-9 h-10 text-base bg-secondary border-border",
  "focus:border-ring focus:ring-ring/20",
  "transition-all duration-200 placeholder:text-muted-foreground",
  isFocused && "bg-card shadow-sm"
)}
          />

          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              aria-label="Limpiar búsqueda"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Acciones derecha */}
      <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
        <ThemeToggle />
        <UserNav />
      </div>
    </header>
  );
}