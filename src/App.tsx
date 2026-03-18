import { BrowserRouter, Routes, Route } from 'react-router-dom';
import DashboardLayout from './components/layout/DashboardLayout';
import Index from './pages/Index';
import ProjectDetails from './pages/projects/ProjectDetails';
import ProjectDetailPage from './pages/projects/ProjectDetailPage';
import Machinery from './pages/resources/Machinery';
import Material from './pages/resources/Material';
import Login from './pages/Login';
import { AuthProvider } from './contexts/AuthContext';
import Dashboard from './pages/Dashboard';
import Activities from './pages/projects/Activities';
import Deliveries from './pages/projects/Deliveries';
import Schedules from './pages/projects/Schedules';
import Documents from './pages/projects/Documents';
import Issues from './pages/projects/Issues';
import Settings from './pages/Settings';
import Manpower from './pages/resources/Manpower';
import ClockInOut from './pages/resources/ClockInOut';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/projects" element={<ProjectDetails />} />
          <Route path="/projects/:id" element={<ProjectDetailPage />} />
          <Route path="/projects/activities" element={<Activities />} />
          <Route path="/projects/deliveries" element={<Deliveries />} />
          <Route path="/projects/schedules" element={<Schedules />} />
          <Route path="/projects/documents" element={<Documents />} />
          <Route path="/projects/issues" element={<Issues />} />
          <Route path="/machinery" element={<Machinery />} />
          <Route path="/material" element={<Material />} />
          <Route path="/resources/manpower" element={<Manpower />} />
          <Route path="/resources/clock-in-out" element={<ClockInOut />} />
          <Route path="/resources/material" element={<Material />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;