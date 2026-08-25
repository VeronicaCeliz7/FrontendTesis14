import { ReactNode, useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

interface LayoutProps {
  children: ReactNode;
  onSearch?: (query: string) => void;
  searchPlaceholder?: string;
}

export default function Layout({ 
  children, 
  onSearch, 
  searchPlaceholder = "Buscar lote o campo..." 
}: LayoutProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (onSearch) {
      onSearch(query);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      
      <div className="flex flex-1 flex-col min-w-0">
        <Header 
          onSearch={handleSearch} 
          placeholder={searchPlaceholder}
        />
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50/50 dark:bg-gray-950/50">
          {children}
        </main>
      </div>
    </div>
  );
}