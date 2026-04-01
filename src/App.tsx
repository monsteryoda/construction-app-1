"use client";

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProjectProvider } from './contexts/ProjectContext';
import DashboardLayout from './components/layout/DashboardLayout';
import ProjectDetails from './pages/projects/ProjectDetails';
import Login from './pages/Login';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ProjectProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/*" element={
              <DashboardLayout>
                <Routes>
                  <Route path="/projects" element={<ProjectDetails />} />
                  {/* Add more routes here */}
                </Routes>
              </DashboardLayout>
            } />
          </Routes>
        </ProjectProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;