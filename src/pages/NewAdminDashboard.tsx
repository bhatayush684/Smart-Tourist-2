import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  MapPin, 
  AlertTriangle, 
  Activity,
  Search,
  Download,
  Eye,
  FileText,
  Zap,
  Clock,
  BarChart3,
  Bell,
  RefreshCw,
  Settings
} from 'lucide-react';

interface Tourist {
  id: string;
  name: string;
  nationality: string;
  safetyScore: number;
  lastLocation: string;
  status: 'safe' | 'warning' | 'alert';
  lastSeen: string;
  alerts: number;
}

const NewAdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'iot-monitor', label: 'IoT Monitor', icon: Activity },
    { id: 'tourists', label: 'Tourists', icon: Users },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  const [tourists] = useState<Tourist[]>([
    {
      id: 'TST-2024-INB-7829',
      name: 'John Smith',
      nationality: 'USA',
      safetyScore: 87,
      lastLocation: 'India Gate, New Delhi',
      status: 'safe',
      lastSeen: '2 minutes ago',
      alerts: 0
    },
    {
      id: 'TST-2024-INB-7830',
      name: 'Emma Johnson',
      nationality: 'UK',
      safetyScore: 45,
      lastLocation: 'Chandni Chowk, Delhi',
      status: 'warning',
      lastSeen: '15 minutes ago',
      alerts: 2
    },
    {
      id: 'TST-2024-INB-7831',
      name: 'Robert Chen',
      nationality: 'Canada',
      safetyScore: 12,
      lastLocation: 'Unknown - Last seen: Karol Bagh',
      status: 'alert',
      lastSeen: '2 hours ago',
      alerts: 5
    },
  ]);

  const [realtimeAlerts] = useState([
    {
      id: 1,
      type: 'anomaly',
      message: 'Tourist Robert Chen - Sudden location drop-off detected',
      time: '2 minutes ago',
      severity: 'high'
    },
    {
      id: 2,
      type: 'geofence',
      message: 'Tourist Emma Johnson entered high-risk zone',
      time: '15 minutes ago',
      severity: 'medium'
    },
  ]);

  const stats = [
    { label: 'Total Active Tourists', value: '12,847', change: '+234 today', icon: Users, color: 'text-primary' },
    { label: 'High Risk Zones', value: '23', change: '2 new alerts', icon: MapPin, color: 'text-warning' },
    { label: 'Emergency Alerts', value: '8', change: 'Last 24 hours', icon: AlertTriangle, color: 'text-emergency' },
    { label: 'IoT Devices Online', value: '8,934', change: '99.2% uptime', icon: Activity, color: 'text-safety' },
  ];

  const filteredTourists = tourists.filter(tourist => {
    const matchesSearch = tourist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tourist.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || tourist.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'safe': return 'text-safety bg-safety/10 border-safety/20';
      case 'warning': return 'text-warning bg-warning/10 border-warning/20';
      case 'alert': return 'text-emergency bg-emergency/10 border-emergency/20';
      default: return 'text-muted-foreground bg-muted/10 border-border';
    }
  };

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

      {/* Hero Banner - COMPACT SIZE */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-white py-4">
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
                <span className="ml-4">11:36 PM</span>
              </div>
            </div>
          </div>
          
          <div className="mt-3">
            <h1 className="text-xl font-bold mb-1">Tourist Safety Platform</h1>
            <p className="text-primary-foreground/90 text-sm">
              Ensuring tourist safety through digital innovation and real-time monitoring.
            </p>
          </div>
        </div>
      </div>

      {/* Tab Navigation - POSITIONED BELOW HERO BANNER */}
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
        <div className="space-y-6">
          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index} className="shadow-card-custom border-card-border">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          {stat.label}
                        </p>
                        <p className="text-2xl font-bold">{stat.value}</p>
                        <p className="text-xs text-muted-foreground">{stat.change}</p>
                      </div>
                      <Icon className={`w-8 h-8 ${stat.color}`} />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Real-time Alerts */}
          <Card className="shadow-government border-warning/20">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="w-6 h-6 text-warning" />
                <span>Real-time Anomaly Alerts</span>
              </CardTitle>
              <CardDescription>
                Live monitoring of tourist safety anomalies and geo-fencing violations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {realtimeAlerts.map((alert) => (
                  <div 
                    key={alert.id}
                    className={`p-4 rounded-lg border-l-4 ${
                      alert.severity === 'high' ? 'bg-emergency/10 border-emergency' :
                      alert.severity === 'medium' ? 'bg-warning/10 border-warning' :
                      'bg-primary/10 border-primary'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{alert.message}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Clock className="w-3 h-3 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">{alert.time}</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-3 h-3" />
                          View
                        </Button>
                        <Button variant="destructive" size="sm">
                          Generate E-FIR
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tourist Monitoring */}
          <Card className="shadow-card-custom">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-6 h-6 text-primary" />
                <span>Tourist Monitoring</span>
              </CardTitle>
              <CardDescription>
                Real-time tracking of all registered tourists
              </CardDescription>
              
              {/* Search and Filter Controls */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name or ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant={selectedFilter === 'all' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setSelectedFilter('all')}
                  >
                    All
                  </Button>
                  <Button 
                    variant={selectedFilter === 'safe' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setSelectedFilter('safe')}
                  >
                    Safe
                  </Button>
                  <Button 
                    variant={selectedFilter === 'warning' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setSelectedFilter('warning')}
                  >
                    Warning
                  </Button>
                  <Button 
                    variant={selectedFilter === 'alert' ? 'destructive' : 'outline'} 
                    size="sm"
                    onClick={() => setSelectedFilter('alert')}
                  >
                    Alert
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredTourists.map((tourist) => (
                  <div 
                    key={tourist.id}
                    className="p-4 border rounded-lg hover:shadow-card-custom transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(tourist.status)}`}>
                          {tourist.status.toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-semibold text-lg">{tourist.name}</h4>
                          <p className="text-sm text-muted-foreground">ID: {tourist.id}</p>
                          <p className="text-sm text-muted-foreground">Nationality: {tourist.nationality}</p>
                        </div>
                      </div>
                      
                      <div className="text-right space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-muted-foreground">Safety Score:</span>
                          <span className={`font-bold ${
                            tourist.safetyScore >= 70 ? 'text-green-600' :
                            tourist.safetyScore >= 40 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {tourist.safetyScore}%
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">Last seen: {tourist.lastSeen}</p>
                        {tourist.alerts > 0 && (
                          <p className="text-sm text-red-600 font-medium">
                            {tourist.alerts} active alerts
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-primary" />
                        <span className="text-sm">{tourist.lastLocation}</span>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-3 h-3" />
                          Track
                        </Button>
                        <Button variant="default" size="sm">
                          <FileText className="w-3 h-3" />
                          Details
                        </Button>
                        {tourist.status === 'alert' && (
                          <Button variant="destructive" size="sm">
                            Generate E-FIR
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default NewAdminDashboard;
