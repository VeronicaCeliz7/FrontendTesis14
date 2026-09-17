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
  const [sidebarAbierto, setSidebarAbierto] = useState(false);

  const handleSearch = (query: string) => {
    if (onSearch) onSearch(query);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Overlay oscuro (solo mobile, cuando el sidebar está abierto) */}
      {sidebarAbierto && (
        <div
          className="fixed inset-0 bg-black/50 z-[9998] md:hidden"
          onClick={() => setSidebarAbierto(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <Sidebar
        abierto={sidebarAbierto}
        onCerrar={() => setSidebarAbierto(false)}
      />

      {/* Contenido principal */}
      <div className="flex flex-1 flex-col min-w-0">
        <Header
          onSearch={handleSearch}
          placeholder={searchPlaceholder}
          onToggleSidebar={() => setSidebarAbierto(!sidebarAbierto)}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50/50 dark:bg-gray-950/50">
          {children}
        </main>
      </div>
    </div>
  );
}