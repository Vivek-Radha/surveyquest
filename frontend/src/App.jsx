import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import { useEffect } from 'react';
import { io } from 'socket.io-client';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CreateSurvey from './pages/CreateSurvey';
import EditSurvey from './pages/EditSurvey';
import SurveyResults from './pages/SurveyResults';
import TakeSurvey from './pages/TakeSurvey';
import AdminDashboard from './pages/AdminDashboard';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const userRaw = localStorage.getItem('user') || sessionStorage.getItem('user');
  const user = userRaw ? JSON.parse(userRaw) : null;

  if (!user) {
    toast.error('Access Denied: Please log in first');
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && user.role !== 'admin') {
    toast.error('Access Denied: Admin privileges required');
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000');


function App() {
  useEffect(() => {
    socket.on('newSurvey', (survey) => {
      // Only notify logged-in users
      const userRaw = localStorage.getItem('user') || sessionStorage.getItem('user');
      if (userRaw) {
        toast('📢 New Survey Available: ' + survey.title, {
          duration: 6000,
          style: { background: '#2563eb', color: '#fff' }
        });
      }
    });

    return () => {
      socket.off('newSurvey');
    };
  }, []);

  return (
    <Router>
      <Toaster position="top-right" toastOptions={{ duration: 4000, style: { background: '#1e293b', color: '#fff', padding: '16px', borderRadius: '12px' } }} />
      <div className="min-h-screen bg-transparent flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8 relative z-10">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />

            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/create-survey" element={
              <ProtectedRoute>
                <CreateSurvey />
              </ProtectedRoute>
            } />
            <Route path="/edit-survey" element={
              <ProtectedRoute>
                <EditSurvey />
              </ProtectedRoute>
            } />
            <Route path="/results" element={
              <ProtectedRoute>
                <SurveyResults />
              </ProtectedRoute>
            } />

            <Route path="/admin" element={
              <ProtectedRoute requireAdmin={true}>
                <AdminDashboard />
              </ProtectedRoute>
            } />

            <Route path="/survey/:shareLink" element={<TakeSurvey />} />

            {/* 404 Route */}
            <Route path="*" element={
              <div className="flex flex-col items-center justify-center h-[60vh]">
                <h1 className="text-6xl font-bold text-gray-300 dark:text-gray-700">404</h1>
                <p className="text-xl mt-4 text-gray-500">Node not found in the grid.</p>
              </div>
            } />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
