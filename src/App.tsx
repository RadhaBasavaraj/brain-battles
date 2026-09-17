import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from './lib/AuthContext';


// Add component imports here
import {Toaster} from './components/ui/toaster';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from './components/ProtectedRoute';

// Add page imports here
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Battle from './pages/Battle';
import Practice from './pages/Practice';
import Leaderboard from './pages/Leaderboard';
import AppLayout from './components/AppLayout';

const BrainBattlesApp = () => {
  const { isLoadingAuth } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if ( isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Render the main app
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}> 
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/battle" element={<Battle />} />
          <Route path="/practice" element={<Practice />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
        </Route>
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {


  return (
    <AuthProvider>
        <Router>
          <ScrollToTop />
          <BrainBattlesApp />
        </Router>
        <Toaster />
    </AuthProvider>
  )
}

export default App