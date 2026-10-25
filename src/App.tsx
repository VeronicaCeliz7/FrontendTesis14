import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from 'next-themes';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UpdatePasswordPage from './pages/UpdatePasswordPage';
import DashboardPage from './pages/DashboardPage';
import LotesPage from './pages/LotesPage';
import LaboresPage from './pages/LaboresPage';
import CortesPage from './pages/CortesPage';
import AlertasPage from './pages/AlertasPage';
import Layout from './components/layout/Layout';
import { useState } from 'react';
import { Toaster } from 'react-hot-toast';

// 👇 NUEVA FUNCIÓN PARA DETECTAR BOTS
const isBot = () => {
  if (typeof navigator === 'undefined') return false;
  return /bot|whatsapp|facebook|twitter|telegram|linkedin|slack|discord|preview|skype/i.test(navigator.userAgent);
};

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  
  // 👇 SI ES UN BOT, LO DEJAMOS PASAR A LEER EL INDEX.HTML
  if (!isAuthenticated && isBot()) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#064e3b', color: 'white' }}>
        <h1>AlfaTrace - Trazabilidad digital</h1>
      </div>
    );
  }

  // Si es humano y no está logueado, al login
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function App() {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    console.log('🔍 Buscando:', query);
  };

  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#363636',
                color: '#fff',
                padding: '16px',
                borderRadius: '8px',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#22c55e',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 4000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
          
          <Routes>
            {/* Rutas públicas */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/registro" element={<RegisterPage />} />
            <Route path="/update-password" element={<UpdatePasswordPage />} />
            {/* Rutas protegidas */}
            <Route path="/" element={
              <ProtectedRoute>
                <Layout onSearch={handleSearch}>
                  <DashboardPage />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/lotes" element={
              <ProtectedRoute>
                <Layout onSearch={handleSearch}>
                  <LotesPage searchQuery={searchQuery} />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/labores" element={
              <ProtectedRoute>
                <Layout onSearch={handleSearch}>
                  <LaboresPage />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/cortes" element={
              <ProtectedRoute>
                <Layout onSearch={handleSearch}>
                  <CortesPage />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/alertas" element={
              <ProtectedRoute>
                <Layout onSearch={handleSearch}>
                  <AlertasPage />
                </Layout>
              </ProtectedRoute>
            } />
          </Routes>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;