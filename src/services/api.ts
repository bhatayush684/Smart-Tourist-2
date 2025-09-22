import type {
  AuthResponse,
  TokenVerificationResponse,
  TouristProfile,
  TouristListResponse,
  Device,
  DeviceListResponse,
  Alert,
  AlertListResponse,
  DashboardOverview,
  StatisticsData,
  Notification,
  Activity,
  ApiResponse,
  LoginRequest,
  RegisterRequest,
  LocationUpdateRequest,
  EmergencyRequest,
  DeviceVitalsRequest,
  DeviceLocationRequest,
  AlertActionRequest,
  AlertResolutionRequest,
  BroadcastRequest,
} from '../types/api';
import config from '../config/environment';

const API_URL = config.apiUrl;

class ApiService {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string = API_URL) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    // Demo mode: return minimal mock responses to keep UI functional without backend
    if (config.demoMode) {
      const method = (options.method || 'GET').toUpperCase();
      // Simple router for common endpoints used by dashboards
      const respond = <R,>(data: R, delay = 200) =>
        new Promise<R>((resolve) => setTimeout(() => resolve(data), delay));

      // Generic success shapes
      const ok: any = { success: true };

      if (endpoint.startsWith('/api/admin/dashboard')) {
        return respond<any>({
          success: true,
          data: {
            totalTourists: 12847,
            activeTourists: 9680,
            totalDevices: 2450,
            activeDevices: 2310,
            activeAlerts: 12,
            criticalAlerts: 1,
            systemHealth: 'healthy',
          },
        }) as unknown as T;
      }
      if (endpoint.startsWith('/api/dashboard/overview')) {
        return respond<any>({ success: true, data: {
          totalTourists: 12847,
          activeTourists: 9680,
          totalDevices: 2450,
          activeDevices: 2310,
          activeAlerts: 12,
          criticalAlerts: 1,
          systemHealth: 'healthy',
        } }) as unknown as T;
      }
      if (endpoint.startsWith('/api/dashboard/statistics')) {
        return respond<any>({ success: true, data: {
          period: '7d',
          tourists: { total: 12847, active: 9680, new: 120, byNationality: { IN: 5400, US: 1200, UK: 800 } },
          devices: { total: 2450, active: 2310, offline: 140, byType: { smart_band: 1200, tracker: 800, sensor: 400, camera: 50 } },
          alerts: { total: 340, active: 12, resolved: 320, byType: { emergency: 10, medical: 20, security: 300, device: 5, system: 5 }, bySeverity: { low: 200, medium: 100, high: 35, critical: 5 } },
        } }) as unknown as T;
      }
      if (endpoint.startsWith('/api/dashboard/notifications')) {
        return respond<any>({ success: true, data: [
          { id: 'n1', type: 'info', title: 'System Update', message: 'Background sync completed', read: false, createdAt: new Date().toISOString() },
          { id: 'n2', type: 'warning', title: 'Device Offline', message: 'Tracker #A-102 went offline', read: false, createdAt: new Date().toISOString() },
        ] }) as unknown as T;
      }
      if (endpoint.startsWith('/api/dashboard/activity')) {
        return respond<any>({ success: true, data: [
          { id: 'a1', type: 'login', description: 'Admin logged in', createdAt: new Date().toISOString() },
          { id: 'a2', type: 'alert', description: 'Emergency alert acknowledged', createdAt: new Date().toISOString() },
        ] }) as unknown as T;
      }
      if (endpoint.startsWith('/api/alerts/critical/active')) {
        return respond<any>({ success: true, data: [] }) as unknown as T;
      }

      // Fallbacks: return ok with empty data to prevent crashes
      if (method === 'GET') {
        return respond<any>({ success: true, data: [] }) as unknown as T;
      }
      return respond<any>(ok) as unknown as T;
    }

    const url = `${this.baseURL}${endpoint}`;

    const requestConfig: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, requestConfig);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth methods
  async login(email: string, password: string): Promise<AuthResponse> {
    if (config.demoMode) {
      const role = (email.includes('admin') ? 'admin' : email.includes('police') ? 'police' : email.includes('issuer') ? 'id_issuer' : 'tourist') as any;
      const mock: AuthResponse = {
        success: true,
        token: 'demo-token',
        refreshToken: 'demo-refresh-token',
        user: {
          id: 'demo-' + role,
          name: role.charAt(0).toUpperCase() + role.slice(1) + ' Demo',
          email,
          role,
          status: 'active',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as any,
      };
      this.token = mock.token;
      localStorage.setItem('token', mock.token);
      localStorage.setItem('refreshToken', mock.refreshToken);
      localStorage.setItem('demoUser', JSON.stringify(mock.user));
      return new Promise(resolve => setTimeout(() => resolve(mock), 200));
    }

    const response = await this.request<AuthResponse>('/api/simple-auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.success) {
      this.token = response.token;
      localStorage.setItem('token', response.token);
      localStorage.setItem('refreshToken', response.refreshToken);
    }

    return response;
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    if (config.demoMode) {
      const mock: AuthResponse = {
        success: true,
        token: 'demo-token',
        refreshToken: 'demo-refresh-token',
        user: {
          id: 'demo-' + userData.role,
          name: userData.name,
          email: userData.email,
          role: userData.role as any,
          status: 'active',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as any,
      };
      this.token = mock.token;
      localStorage.setItem('token', mock.token);
      localStorage.setItem('refreshToken', mock.refreshToken);
      localStorage.setItem('demoUser', JSON.stringify(mock.user));
      return new Promise(resolve => setTimeout(() => resolve(mock), 200));
    }

    const response = await this.request<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    if (response.success) {
      this.token = response.token;
      localStorage.setItem('token', response.token);
      localStorage.setItem('refreshToken', response.refreshToken);
    }

    return response;
  }

  async logout(): Promise<void> {
    try {
      if (config.demoMode) {
        return new Promise((resolve) => setTimeout(resolve, 100));
      }
      await this.request('/api/auth/logout', { method: 'POST' });
    } finally {
      this.token = null;
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    }
  }

  async verifyToken(): Promise<TokenVerificationResponse> {
    if (config.demoMode) {
      const demo = localStorage.getItem('demoUser');
      const user = demo ? JSON.parse(demo) : null;
      return new Promise(resolve => setTimeout(() => resolve({ success: !!user, user }), 100));
    }
    return this.request<TokenVerificationResponse>('/api/simple-auth/verify');
  }

  async refreshToken(): Promise<AuthResponse> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) throw new Error('No refresh token available');

    if (config.demoMode) {
      const mock: AuthResponse = {
        success: true,
        token: 'demo-token',
        refreshToken: 'demo-refresh-token',
        user: JSON.parse(localStorage.getItem('demoUser') || '{}') as any,
      };
      this.token = mock.token;
      localStorage.setItem('token', mock.token);
      localStorage.setItem('refreshToken', mock.refreshToken);
      return new Promise(resolve => setTimeout(() => resolve(mock), 200));
    }

    const response = await this.request<AuthResponse>('/api/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
    
    if (response.success) {
      this.token = response.token;
      localStorage.setItem('token', response.token);
      localStorage.setItem('refreshToken', response.refreshToken);
    }
    
    return response;
  }

  // Tourist methods
  async getTourists(params?: {
    page?: number;
    limit?: number;
    status?: string;
    riskLevel?: string;
    search?: string;
  }): Promise<TouristListResponse> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) queryParams.append(key, value.toString());
      });
    }
    
    return this.request<TouristListResponse>(`/api/tourists?${queryParams.toString()}`);
  }

  async getTouristProfile(): Promise<ApiResponse<TouristProfile>> {
    return this.request<ApiResponse<TouristProfile>>('/api/tourists/me');
  }

  async updateTouristProfile(data: Partial<TouristProfile>): Promise<ApiResponse<TouristProfile>> {
    return this.request<ApiResponse<TouristProfile>>('/api/tourists/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async updateLocation(locationData: LocationUpdateRequest): Promise<ApiResponse<TouristProfile>> {
    return this.request<ApiResponse<TouristProfile>>('/api/tourists/me/location', {
      method: 'POST',
      body: JSON.stringify(locationData),
    });
  }

  async getTouristDevices(): Promise<ApiResponse<Device[]>> {
    return this.request<ApiResponse<Device[]>>('/api/tourists/me/devices');
  }

  async getTouristAlerts(params?: {
    page?: number;
    limit?: number;
    status?: string;
    type?: string;
  }): Promise<AlertListResponse> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) queryParams.append(key, value.toString());
      });
    }
    
    return this.request<AlertListResponse>(`/api/tourists/me/alerts?${queryParams.toString()}`);
  }

  async triggerEmergency(emergencyData: EmergencyRequest): Promise<ApiResponse<Alert>> {
    return this.request<ApiResponse<Alert>>('/api/tourists/me/emergency', {
      method: 'POST',
      body: JSON.stringify(emergencyData),
    });
  }

  async getTouristStatistics(): Promise<ApiResponse<StatisticsData>> {
    return this.request<ApiResponse<StatisticsData>>('/api/tourists/me/statistics');
  }

  // Device methods
  async getDevices(params?: {
    page?: number;
    limit?: number;
    status?: string;
    deviceType?: string;
    search?: string;
  }): Promise<DeviceListResponse> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) queryParams.append(key, value.toString());
      });
    }
    
    return this.request<DeviceListResponse>(`/devices?${queryParams.toString()}`);
  }

  async getDeviceStatistics(): Promise<ApiResponse<StatisticsData>> {
    return this.request<ApiResponse<StatisticsData>>('/devices/statistics');
  }

  async getDevice(id: string): Promise<ApiResponse<Device>> {
    return this.request<ApiResponse<Device>>(`/devices/${id}`);
  }

  async createDevice(deviceData: {
    deviceType: string;
    manufacturer: string;
    model: string;
    serialNumber: string;
    touristId?: string;
  }): Promise<ApiResponse<Device>> {
    return this.request<ApiResponse<Device>>('/api/devices', {
      method: 'POST',
      body: JSON.stringify(deviceData),
    });
  }

  async updateDevice(id: string, data: Partial<Device>): Promise<ApiResponse<Device>> {
    return this.request<ApiResponse<Device>>(`/devices/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async updateDeviceVitals(id: string, vitals: DeviceVitalsRequest): Promise<ApiResponse<Device>> {
    return this.request<ApiResponse<Device>>(`/devices/${id}/vitals`, {
      method: 'POST',
      body: JSON.stringify(vitals),
    });
  }

  async updateDeviceLocation(id: string, location: DeviceLocationRequest): Promise<ApiResponse<Device>> {
    return this.request<ApiResponse<Device>>(`/devices/${id}/location`, {
      method: 'POST',
      body: JSON.stringify(location),
    });
  }

  async triggerDeviceAlert(id: string, alertType: string, data?: Record<string, unknown>): Promise<ApiResponse<Alert>> {
    return this.request<ApiResponse<Alert>>(`/devices/${id}/alert`, {
      method: 'POST',
      body: JSON.stringify({ alertType, data }),
    });
  }

  // Alert methods
  async getAlerts(params?: {
    page?: number;
    limit?: number;
    status?: string;
    type?: string;
    severity?: string;
    touristId?: string;
  }): Promise<AlertListResponse> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) queryParams.append(key, value.toString());
      });
    }
    
    return this.request<AlertListResponse>(`/api/alerts?${queryParams.toString()}`);
  }

  async getAlertStatistics(): Promise<ApiResponse<StatisticsData>> {
    return this.request<ApiResponse<StatisticsData>>('/api/alerts/statistics');
  }

  async getAlert(id: string): Promise<ApiResponse<Alert>> {
    return this.request<ApiResponse<Alert>>(`/alerts/${id}`);
  }

  async acknowledgeAlert(id: string, notes?: string): Promise<ApiResponse<Alert>> {
    return this.request<ApiResponse<Alert>>(`/alerts/${id}/acknowledge`, {
      method: 'PUT',
      body: JSON.stringify({ notes }),
    });
  }

  async resolveAlert(id: string, resolutionData: AlertResolutionRequest): Promise<ApiResponse<Alert>> {
    return this.request<ApiResponse<Alert>>(`/alerts/${id}/resolve`, {
      method: 'PUT',
      body: JSON.stringify(resolutionData),
    });
  }

  async markAlertFalseAlarm(id: string, reason?: string): Promise<ApiResponse<Alert>> {
    return this.request<ApiResponse<Alert>>(`/alerts/${id}/false-alarm`, {
      method: 'PUT',
      body: JSON.stringify({ reason }),
    });
  }

  async addAlertAction(id: string, actionData: AlertActionRequest): Promise<ApiResponse<Alert>> {
    return this.request<ApiResponse<Alert>>(`/alerts/${id}/actions`, {
      method: 'POST',
      body: JSON.stringify(actionData),
    });
  }

  async escalateAlert(id: string, escalatedTo: string[], reason?: string): Promise<ApiResponse<Alert>> {
    return this.request<ApiResponse<Alert>>(`/alerts/${id}/escalate`, {
      method: 'POST',
      body: JSON.stringify({ escalatedTo, reason }),
    });
  }

  async getCriticalAlerts(): Promise<ApiResponse<Alert[]>> {
    return this.request<ApiResponse<Alert[]>>('/api/alerts/critical/active');
  }

  // Admin methods
  async getAdminDashboard(): Promise<ApiResponse<DashboardOverview>> {
    return this.request<ApiResponse<DashboardOverview>>('/api/admin/dashboard');
  }

  async getUsers(params?: {
    page?: number;
    limit?: number;
    role?: string;
    search?: string;
  }): Promise<ApiResponse<unknown[]>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) queryParams.append(key, value.toString());
      });
    }
    
    return this.request<ApiResponse<unknown[]>>(`/api/admin/users?${queryParams.toString()}`);
  }

  async updateUserStatus(id: string, isActive: boolean): Promise<ApiResponse<unknown>> {
    return this.request<ApiResponse<unknown>>(`/api/admin/users/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ isActive }),
    });
  }

  async getTouristAnalytics(params?: { startDate?: string; endDate?: string }): Promise<ApiResponse<StatisticsData>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) queryParams.append(key, value);
      });
    }
    
    return this.request<ApiResponse<StatisticsData>>(`/api/admin/tourists/analytics?${queryParams.toString()}`);
  }

  async getDeviceAnalytics(): Promise<ApiResponse<StatisticsData>> {
    return this.request<ApiResponse<StatisticsData>>('/api/admin/devices/analytics');
  }

  async getAlertAnalytics(params?: { startDate?: string; endDate?: string }): Promise<ApiResponse<StatisticsData>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) queryParams.append(key, value);
      });
    }
    
    return this.request<ApiResponse<StatisticsData>>(`/api/admin/alerts/analytics?${queryParams.toString()}`);
  }

  async sendBroadcast(broadcastData: BroadcastRequest): Promise<ApiResponse<unknown>> {
    return this.request<ApiResponse<unknown>>('/api/admin/broadcast', {
      method: 'POST',
      body: JSON.stringify(broadcastData),
    });
  }

  async getSystemHealth(): Promise<ApiResponse<unknown>> {
    return this.request<ApiResponse<unknown>>('/api/admin/system/health');
  }

  // Dashboard methods
  async getDashboardOverview(): Promise<ApiResponse<DashboardOverview>> {
    return this.request<ApiResponse<DashboardOverview>>('/api/dashboard/overview');
  }

  async getDashboardStatistics(period?: string): Promise<ApiResponse<StatisticsData & { period: string }>> {
    const queryParams = new URLSearchParams();
    if (period) queryParams.append('period', period);
    
    return this.request<ApiResponse<StatisticsData & { period: string }>>(`/api/dashboard/statistics?${queryParams.toString()}`);
  }

  async getDashboardNotifications(limit?: number): Promise<ApiResponse<Notification[]>> {
    const queryParams = new URLSearchParams();
    if (limit) queryParams.append('limit', limit.toString());
    
    return this.request<ApiResponse<Notification[]>>(`/api/dashboard/notifications?${queryParams.toString()}`);
  }

  async getDashboardActivity(limit?: number): Promise<ApiResponse<Activity[]>> {
    const queryParams = new URLSearchParams();
    if (limit) queryParams.append('limit', limit.toString());
    
    return this.request<ApiResponse<Activity[]>>(`/api/dashboard/activity?${queryParams.toString()}`);
  }

  // Utility methods
  setToken(token: string): void {
    this.token = token;
    localStorage.setItem('token', token);
  }

  getToken(): string | null {
    return this.token;
  }

  clearToken(): void {
    this.token = null;
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  }
}

export const apiService = new ApiService();
export default apiService;