import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import DashboardLayout from './components/layout/DashboardLayout';
import Index from './pages/Index';
import Login from './pages/Login';
import Projects from './pages/projects/Projects';
import Inspection from './pages/projects/Inspection';
import Activities from './pages/projects/Activities';
import Deliveries from './pages/projects/Deliveries';
import Schedules from './pages/projects/Schedules';
import Documents from './pages/projects/Documents';
import Issues from './pages/projects/Issues';
import Manpower from './pages/resources/Manpower';
import ClockInOut from './pages/resources/ClockInOut';
import Machinery from './pages/resources/Machinery';
import Material from './pages/resources/Material';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<DashboardLayout><Index /></DashboardLayout>} />
          <Route path="/dashboard" element={<DashboardLayout><Index /></DashboardLayout>} />
          <Route path="/projects" element={<DashboardLayout><Projects /></DashboardLayout>} />
          <Route path="/projects/inspection" element={<DashboardLayout><Inspection /></DashboardLayout>} />
          <Route path="/projects/inspection/:id" element={<DashboardLayout><Inspection /></DashboardLayout>} />
          <Route path="/projects/activities" element={<DashboardLayout><Activities /></DashboardLayout>} />
          <Route path="/projects/deliveries" element={<DashboardLayout><Deliveries /></DashboardLayout>} />
          <Route path="/projects/schedules" element={<DashboardLayout><Schedules /></DashboardLayout>} />
          <Route path="/projects/documents" element={<DashboardLayout><Documents /></DashboardLayout>} />
          <Route path="/projects/issues" element={<DashboardLayout><Issues /></DashboardLayout>} />
          <Route path="/resources/manpower" element={<DashboardLayout><Manpower /></DashboardLayout>} />
          <Route path="/resources/clock-in-out" element={<DashboardLayout><ClockInOut /></DashboardLayout>} />
          <Route path="/resources/machinery" element={<DashboardLayout><Machinery /></DashboardLayout>} />
          <Route path="/resources/material" element={<DashboardLayout><Material /></DashboardLayout>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;