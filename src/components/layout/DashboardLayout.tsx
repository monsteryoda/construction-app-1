"use client";

import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Building2,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Calendar,
  AlertCircle,
  X,
  Settings,
  User,
  BookOpen,
  HelpCircle,
  FileSpreadsheet,
  Link as LinkIcon,
  Users,
  Hammer,
  Box,
  Clock,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface NavItem {
  label: string;
  icon: React.ReactNode;
  path?: string;
  children?: { label: string; path: string; icon: React.ReactNode }[];
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    icon: <LayoutDashboard className="w-5 h-5" />,
    path: '/dashboard',
  },
  {
    label: 'Projects',
    icon: <Building2 className="w-5 h-5" />,
    children: [
      { label: 'Project Details', path: '/projects', icon: <FileText className="w-4 h-4" /> },
      { label: 'Activities', path: '/projects/activities', icon: <ClipboardList className="w-4 h-4" /> },
      { label: 'Deliveries', path: '/projects/deliveries', icon: <Package className="w-4 h-4" /> },
      { label: 'Schedules', path: '/projects/schedules', icon: <Calendar className="w-4 h-4" /> },
      { label: 'Documents', path: '/projects/documents', icon: <FileText className="w-4 h-4" /> },
      { label: 'Issues', path: '/projects/issues', icon: <AlertCircle className="w-4 h-4" /> },
    ],
  },
  {
    label: 'Resources',
    icon: <BookOpen className="w-5 h-5" />,
    children: [
      { label: 'Manpower', path: '/resources/manpower', icon: <Users className="w-4 h-4" /> },
      { label: 'Clock In/Out', path: '/resources/clock-in-out', icon: <Clock className="w-4 h-4" /> },
      { label: 'Machinery', path: '/resources/machinery', icon: <Hammer className="w-4 h-4" /> },
      { label: 'Material', path: '/resources/material', icon: <Box className="w-4 h-4" /> },
    ],
  },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut, user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [projectExpanded, setProjectExpanded] = useState(true);
  const [resourcesExpanded, setResourcesExpanded] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside
        className={`${sidebarOpen ? 'w-64' : 'w-0'} bg-slate-900 text-white transition-all duration-300 flex flex-col overflow-hidden`}
      >
        <div className="p-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
              <img src="/logo.png" alt="BEENA Logo" className="w-full h-full object-contain" />
            </div>
            <div className="overflow-hidden whitespace-nowrap">
              <h1 className="font-bold text-lg">BEENA</h1>
              <p className="text-xs text-slate-400">Construction & Development</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {navItems.map((item) => (
              <li key={item.label}>
                {!item.children ? (
                  <button
                    onClick={() => item.path && navigate(item.path)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${isActive(item.path || '') ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
                  >
                    {item.icon}
                    <span className="font-medium whitespace-nowrap">{item.label}</span>
                  </button>
                ) : (
                  <div>
                    <button
                      onClick={() => item.label === 'Projects' ? setProjectExpanded(!projectExpanded) : setResourcesExpanded(!resourcesExpanded)}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-all duration-200"
                    >
                      <div className="flex items-center gap-3">
                        {item.icon}
                        <span className="font-medium whitespace-nowrap">{item.label}</span>
                      </div>
                      {item.label === 'Projects' ? (projectExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />) : (resourcesExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />)}
                    </button>
                    {(item.label === 'Projects' ? projectExpanded : resourcesExpanded) && (
                      <ul className="mt-1 ml-4 space-y-1 border-l-2 border-slate-700 pl-3">
                        {item.children.map((child) => (
                          <li key={child.path}>
                            <button
                              onClick={() => navigate(child.path)}
                              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${isActive(child.path) ? 'bg-blue-600/20 text-blue-400 border-l-2 border-blue-500' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                            >
                              {child.icon}
                              <span className="whitespace-nowrap">{child.label}</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-3 px-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-medium text-white">
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-white truncate">{user?.email}</p>
              <p className="text-xs text-slate-400">Administrator</p>
            </div>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-slate-400 hover:text-white hover:bg-slate-800"
            onClick={handleSignOut}
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-slate-600 hover:text-slate-900"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
            <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>
            <nav className="hidden sm:flex items-center gap-2 text-sm text-slate-500">
              <span>Home</span>
              <ChevronRight className="w-4 h-4" />
              <span className="text-slate-900 font-medium capitalize">
                {location.pathname === '/dashboard' ? 'Dashboard' : location.pathname.split('/').pop()?.replace('-', ' ')}
              </span>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                    <span className="text-sm font-medium text-white">
                      {user?.email?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => navigate('/settings')} className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/settings')} className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut} className="text-red-600 cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}