import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { Layout } from './components/UI';
import Login from './pages/Login';
import { Dashboard, StudentsPage, LabsPage, AttendancePage, PracticalsPage, AnalyticsPage, ProfilePage } from './pages/Pages';
function Shell() {
  const {
      user,
      logout
    } = useAuth(),
    navigate = useNavigate();
  if (!user) return <Routes><Route path="/login" element={<Login />} /><Route path="*" element={<Navigate to="/login" replace />} /></Routes>;
  return <Layout user={user} onLogout={() => {
    logout();
    navigate('/login');
  }}><Routes><Route path="/" element={<Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'} replace />} /><Route path="/profile" element={<ProfilePage />} /><Route element={<ProtectedRoute role="admin" />}><Route path="/admin/dashboard" element={<Dashboard />} /><Route path="/admin/students" element={<StudentsPage />} /><Route path="/admin/labs" element={<LabsPage admin />} /><Route path="/admin/attendance" element={<AttendancePage admin />} /><Route path="/admin/practicals" element={<PracticalsPage admin />} /><Route path="/admin/analytics" element={<AnalyticsPage admin />} /></Route><Route element={<ProtectedRoute role="student" />}><Route path="/student/dashboard" element={<Dashboard />} /><Route path="/student/labs" element={<LabsPage />} /><Route path="/student/attendance" element={<AttendancePage />} /><Route path="/student/practicals" element={<PracticalsPage />} /><Route path="/student/analytics" element={<AnalyticsPage />} /></Route><Route path="*" element={<Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'} replace />} /></Routes></Layout>;
}
export default function App() {
  return <AuthProvider><BrowserRouter><Shell /></BrowserRouter></AuthProvider>;
}
