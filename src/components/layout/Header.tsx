import { ThemeToggle } from '@/components/ui/theme-toggle';
import { UserNav } from './UserNav';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

export function Header() {
  return (
    <header className="h-16 border-b bg-white dark:bg-gray-900 flex items-center justify-between px-6">
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Buscar lote o campo..."
            className="pl-9 bg-gray-50 dark:bg-gray-800"
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <ThemeToggle />
        <UserNav />
      </div>
    </header>
  );
}