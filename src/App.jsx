import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import StepViewer from './components/StepViewer';
import Login from './pages/Login';
import { useAuthStore } from './store/useAuthStore';
import { useRegisterSW } from 'virtual:pwa-register/react';

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered:', r);
    },
    onRegisterError(error) {
      console.log('SW registration error', error);
    },
  });

  const closeBanner = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  return (
    <Router>
      {/* PWA Update Banner */}
      {(offlineReady || needRefresh) && (
        <div className="fixed top-0 left-0 w-full z-50 bg-emerald-600 text-white p-4 flex justify-between items-center shadow-lg">
          <div className="font-medium text-lg">
            {offlineReady
              ? 'Aplicación lista para uso sin conexión.'
              : 'Nueva actualización disponible. Haga clic para actualizar.'}
          </div>
          <div className="flex gap-4">
            {needRefresh && (
              <button
                className="bg-white text-emerald-700 px-6 py-2 rounded-xl font-bold hover:bg-slate-100"
                onClick={() => updateServiceWorker(true)}
              >
                Actualizar Ahora
              </button>
            )}
            <button
              className="bg-emerald-800 text-white px-6 py-2 rounded-xl font-medium hover:bg-emerald-900 border border-emerald-500"
              onClick={closeBanner}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/setup"
          element={
            <ProtectedRoute>
              <StepViewer />
            </ProtectedRoute>
          }
        />
        {/* Redirect root to dashboard, which will redirect to login if not authenticated */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
