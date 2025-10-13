import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import HomePage from './pages/HomePage';
import Dashboard from './pages/Dashboard';
import PostRidePage from './pages/PostRidePage';
import FindRidePage from './pages/FindRidePage';
import MyRidesPage from './pages/MyRidesPage';
import MessagesPage from './pages/MessagesPage';
import ProfilePage from './pages/ProfilePage';

function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/post-ride" element={<PostRidePage />} />
          <Route path="/find-ride" element={<FindRidePage />} />
          <Route path="/my-rides" element={<MyRidesPage />} />
          <Route path="/messages" element={<MessagesPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
