import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Index from '@/pages/Index';
import Dashboard from '@/pages/Dashboard';
import Login from '@/pages/Login';
import Settings from '@/pages/Settings';
import ProjectDetails from '@/pages/projects/ProjectDetails';
import Activities from '@/pages/projects/Activities';
import Deliveries from '@/pages/projects/Deliveries';
import Schedules from '@/pages/projects/Schedules';
import Issues from '@/pages/projects/Issues';
import Documents from '@/pages/projects/Documents';
import Manpower from '@/pages/resources/Manpower';
import AddWorker from '@/pages/resources/AddWorker';
import Machinery from '@/pages/resources/Machinery';
import Material from '@/pages/resources/Material';
import Documentation from '@/pages/resources/Documentation';
import Help from '@/pages/resources/Help';
import Reports from '@/pages/resources/Reports';
import Links from '@/pages/resources/Links';
import NotFound from '@/pages/NotFound';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/projects/details" element={<ProjectDetails />} />
        <Route path="/projects/activities" element={<Activities />} />
        <Route path="/projects/deliveries" element={<Deliveries />} />
        <Route path="/projects/schedules" element={<Schedules />} />
        <Route path="/projects/issues" element={<Issues />} />
        <Route path="/projects/documents" element={<Documents />} />
        <Route path="/resources/manpower" element={<Manpower />} />
        <Route path="/resources/manpower/add" element={<AddWorker />} />
        <Route path="/resources/machinery" element={<Machinery />} />
        <Route path="/resources/material" element={<Material />} />
        <Route path="/resources/documentation" element={<Documentation />} />
        <Route path="/resources/help" element={<Help />} />
        <Route path="/resources/reports" element={<Reports />} />
        <Route path="/resources/links" element={<Links />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;