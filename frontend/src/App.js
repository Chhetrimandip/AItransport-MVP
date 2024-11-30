import React from 'react';
import { BrowserRouter as Router, Routes as RouterRoutes, Route, Navigate } from 'react-router-dom';
import { ColorModeScript, Box } from '@chakra-ui/react';
import Login from './pages/Login';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Header from './components/layout/Header';
import theme from './theme';
import { useAuth } from './context/AuthContext';
import { AuthProvider } from './context/AuthContext';
import RoutesPage from './pages/RoutesPage';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <AuthProvider>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <Router>
        <Box display="flex" flexDirection="column" minHeight="100vh">
          <Header />
          <Box flex="1">
            <RouterRoutes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<Navigate to="/home" replace />} />
              <Route path="/home" element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              <Route path="/routes" element={<RoutesPage />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </RouterRoutes>
          </Box>
        </Box>
      </Router>
    </AuthProvider>
  );
}

export default App;
