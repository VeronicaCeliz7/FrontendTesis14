import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from 'next-themes';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import LotesPage from './pages/LotesPage';
import LaboresPage from './pages/LaboresPage';
import CortesPage from './pages/CortesPage';
import AlertasPage from './pages/AlertasPage';
import Layout from './components/layout/Layout';
import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import UpdatePasswordPage from './pages/UpdatePasswordPage';
import { CookieBanner } from "./components/common/CookieBanner";

// 👇 1. DETECCIÓN DE BOTS (Para WhatsApp)
const isBot = () => {
  if (typeof navigator === 'undefined') return false;
  return /bot|whatsapp|facebook|twitter|telegram|linkedin|slack|discord|preview|skype/i.test(navigator.userAgent);
};

// 👇 2. PROTECTED ROUTE CON "LOADING"
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();

  // Si está cargando, mostramos un cartel para no patear al usuario
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-50 dark:bg-gray-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0f7a50]"></div>
      </div>
    );
  }

  if (!isAuthenticated && isBot()) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#064e3b', color: 'white' }}>
        <h1>AlfaTrace - Trazabilidad digital</h1>
      </div>
    );
  }

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
              style: { background: '#363636', color: '#fff', padding: '16px', borderRadius: '8px' },
              success: { duration: 3000, iconTheme: { primary: '#22c55e', secondary: '#fff' } },
              error: { duration: 4000, iconTheme: { primary: '#ef4444', secondary: '#fff' } },
            }}
          />
          
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/registro" element={<RegisterPage />} />
            <Route path="/update-password" element={<UpdatePasswordPage />} />
            
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
          
                 <CookieBanner />
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;