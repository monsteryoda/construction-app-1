import { BrowserRouter, Routes, Route } from 'react-router-dom';
import DashboardLayout from './components/layout/DashboardLayout';
import Index from './pages/Index';
import ProjectDetails from './pages/projects/ProjectDetails';
import ProjectDetailPage from './pages/projects/ProjectDetailPage';
import Machinery from './pages/resources/Machinery';
import Material from './pages/resources/Material';
import Login from './pages/Login';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Index />} />
          <Route path="/projects" element={<ProjectDetails />} />
          <Route path="/projects/:id" element={<ProjectDetailPage />} />
          <Route path="/machinery" element={<Machinery />} />
          <Route path="/material" element={<Material />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;