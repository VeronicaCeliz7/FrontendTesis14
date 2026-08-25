import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from 'next-themes';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import LotesPage from './pages/LotesPage';
import LaboresPage from './pages/LaboresPage';
import CortesPage from './pages/CortesPage';
import AlertasPage from './pages/AlertasPage';
import TestLogin from './pages/TestLogin';
import TestPage from './pages/TestLogin';
import Layout from './components/layout/Layout';
import { useState } from 'react';
// ✅ IMPORTAR TOASTER
import { Toaster } from 'react-hot-toast';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function App() {
  // ✅ Estado para la búsqueda
  const [searchQuery, setSearchQuery] = useState('');

  // ✅ Función que se pasa al Layout
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    console.log('🔍 Buscando:', query);
  };

  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          {/* ✅ TOASTER GLOBAL - Disponible en toda la app */}
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
            <Route path="/test" element={<TestPage />} />
            <Route path="/test-login" element={<TestLogin />} />
            
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