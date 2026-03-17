import { BrowserRouter, Routes, Route } from 'react-router-dom';
import DashboardLayout from './components/layout/DashboardLayout';
import Index from './pages/Index';
import Projects from './pages/projects/Projects';
import ProjectDetails from './pages/projects/ProjectDetails';
import ProjectDetailPage from './pages/projects/ProjectDetailPage';
import Machinery from './pages/resources/Machinery';
import Material from './pages/resources/Material';
import Workers from './pages/resources/Workers';
import Login from './pages/Login';
import { SessionContextProvider } from './contexts/SessionContext';

function App() {
  return (
    <SessionContextProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Index />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:id" element={<ProjectDetailPage />} />
          <Route path="/machinery" element={<Machinery />} />
          <Route path="/material" element={<Material />} />
          <Route path="/workers" element={<Workers />} />
        </Routes>
      </BrowserRouter>
    </SessionContextProvider>
  );
}

export default App;