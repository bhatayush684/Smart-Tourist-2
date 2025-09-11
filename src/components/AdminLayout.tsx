import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search,
  BarChart3,
  Users,
  Bell,
  Activity,
  RefreshCw,
  Settings
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'iot-monitor', label: 'IoT Monitor', icon: Activity },
    { id: 'tourists', label: 'Tourists', icon: Users },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  return (
    <div className="min-h-screen bg-gradient-surface">
      {/* Top Navigation Bar */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-foreground">Admin Panel</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Button variant="outline" size="sm">
                <RefreshCw className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-white py-6">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-primary-foreground/80">
                <div className="w-6 h-6 rounded border border-primary-foreground/30 flex items-center justify-center">
                  <span className="text-xs font-bold">GOI</span>
                </div>
                <span className="text-sm">Government of India • Ministry of Tourism</span>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-2 text-sm text-primary-foreground/80">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>System Status: All systems operational</span>
                <span className="ml-4">11:21:24 PM</span>
              </div>
            </div>
          </div>
          
          <div className="mt-4">
            <h1 className="text-2xl font-bold mb-2">Tourist Safety Platform</h1>
            <p className="text-primary-foreground/90 text-base">
              Ensuring tourist safety through digital innovation, real-time monitoring, and seamless government integration.
            </p>
            
            <div className="flex items-center space-x-4 mt-4">
              <Button variant="secondary" size="sm">
                <BarChart3 className="w-4 h-4 mr-2" />
                Get Started
              </Button>
              <Button variant="outline" size="sm" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                <Activity className="w-4 h-4 mr-2" />
                View Analytics
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation - NOW BELOW HERO BANNER */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-6">
          <div className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto p-6">
        {children}
      </div>
    </div>
  );
};

export default AdminLayout;
