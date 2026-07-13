import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { User, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function UserNav() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm">
        <User className="h-4 w-4" />
        <span className="font-medium">{user?.nombre || 'Usuario'}</span>
      </div>
      <Button variant="ghost" size="icon" onClick={handleLogout} title="Cerrar sesión">
        <LogOut className="h-4 w-4" />
      </Button>
    </div>
  );
}