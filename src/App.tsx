import { BrowserRouter, Routes, Route } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Index from '@/pages/Index';
import Projects from '@/pages/projects/Projects';
import ProjectDetail from '@/pages/projects/ProjectDetail';
import Activities from '@/pages/resources/Activities';
import Deliveries from '@/pages/resources/Deliveries';
import Schedules from '@/pages/resources/Schedules';
import Issues from '@/pages/resources/Issues';
import Documents from '@/pages/resources/Documents';
import Manpower from '@/pages/resources/Manpower';
import AddWorker from '@/pages/resources/AddWorker';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/projects/:id" element={<ProjectDetail />} />
        <Route path="/resources/activities" element={<Activities />} />
        <Route path="/resources/deliveries" element={<Deliveries />} />
        <Route path="/resources/schedules" element={<Schedules />} />
        <Route path="/resources/issues" element={<Issues />} />
        <Route path="/resources/documents" element={<Documents />} />
        <Route path="/resources/manpower" element={<Manpower />} />
        <Route path="/resources/manpower/add" element={<AddWorker />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;