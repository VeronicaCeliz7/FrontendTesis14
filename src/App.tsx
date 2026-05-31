import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import LotesPage from './pages/LotesPage';
import LaboresPage from './pages/LaboresPage';
import CortesPage from './pages/CortesPage';
import AlertasPage from './pages/AlertasPage';
import Layout from './components/layout/Layout';

// Componente para rutas protegidas
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              <Layout>
                <DashboardPage />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/lotes" element={
            <ProtectedRoute>
              <Layout>
                <LotesPage />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/labores" element={
            <ProtectedRoute>
              <Layout>
                <LaboresPage />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/cortes" element={
            <ProtectedRoute>
              <Layout>
                <CortesPage />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/alertas" element={
            <ProtectedRoute>
              <Layout>
                <AlertasPage />
              </Layout>
            </ProtectedRoute>
          } />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
