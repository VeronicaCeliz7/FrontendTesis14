import { useState, useEffect, useRef } from 'react';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { UserNav } from './UserNav';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface HeaderProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
}

export function Header({ onSearch, placeholder = "Buscar lote o campo..." }: HeaderProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce para buscar después de dejar de escribir
  useEffect(() => {
    console.log('🔍 Header useEffect: query cambió a:', query);
    console.log('🔍 Header useEffect: onSearch existe?', !!onSearch);
    
    const timer = setTimeout(() => {
      console.log('📤 Header: ejecutando onSearch con:', query);
      if (onSearch) {
        onSearch(query);
      } else {
        console.warn('⚠️ Header: onSearch NO está definido');
      }
    }, 300);

    return () => {
      console.log('🧹 Header: limpiando timeout para:', query);
      clearTimeout(timer);
    };
  }, [query, onSearch]);

  const handleClear = () => {
    console.log('❌ Header: limpiando búsqueda');
    setQuery('');
    if (onSearch) {
      onSearch('');
    }
    inputRef.current?.focus();
  };

  return (
    <header className="h-16 border-b bg-white dark:bg-gray-950 flex items-center justify-between px-4 sm:px-6 gap-4">
      {/* Buscador */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className={cn(
            "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors",
            isFocused ? "text-green-600 dark:text-green-400" : "text-gray-400"
          )} />
          
          <Input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              console.log('✏️ Header: usuario escribió:', e.target.value);
              setQuery(e.target.value);
            }}
            onFocus={() => {
              console.log('👀 Header: input enfocado');
              setIsFocused(true);
            }}
            onBlur={() => {
              console.log('👀 Header: input desenfocado');
              setIsFocused(false);
            }}
            placeholder={placeholder}
            className={cn(
              "pl-9 pr-9 h-10 text-base bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700",
              "focus:border-green-500 focus:ring-green-500/20",
              "transition-all duration-200 placeholder:text-gray-400",
              isFocused && "bg-white dark:bg-gray-800 shadow-lg shadow-green-500/5"
            )}
          />

          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Acciones derecha */}
      <div className="flex items-center gap-2 sm:gap-4">
        <ThemeToggle />
        <UserNav />
      </div>
    </header>
  );
}