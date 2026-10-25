import { createContext, useState, ReactNode } from 'react';

interface AuthContextType {
  token: string | null;
  user: any | null;
  isAuthenticated: boolean;
  loading: boolean; // 👈 Declarado en la interfaz
  login: (token: string, user: any) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem('token')
  );
  const [user, setUser] = useState<any | null>(
    () => {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    }
  );
  
  // 👇 ACÁ CREAMOS EL ESTADO QUE FALTABA
  const [loading, _setLoading] = useState(false); // 👈 El guion bajo silencia la advertencia

  const login = (token: string, user: any) => {
    setToken(token);
    setUser(user);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const isAuthenticated = !!token;

  return (
    // 👇 ACÁ LO PASAMOS EN EL VALUE
    <AuthContext.Provider value={{ token, user, isAuthenticated, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};