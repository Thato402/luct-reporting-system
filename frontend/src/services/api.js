const API_BASE_URL = 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.token = localStorage.getItem('token');
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  removeToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (this.token) {
      config.headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      console.log(`API Request: ${config.method || 'GET'} ${url}`);
      const response = await fetch(url, config);
      
      // Handle non-JSON responses (like export)
      if (endpoint.includes('/export')) {
        if (!response.ok) {
          throw new Error(`Export failed: ${response.status}`);
        }
        return await response.blob();
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.details || `HTTP error! status: ${response.status}`);
      }

      console.log(`API Response:`, data);
      return data;
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
  }

  // Auth endpoints
  async register(userData) {
    return this.request('/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials) {
    const result = await this.request('/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    // Auto-set token after login
    if (result.token) {
      this.setToken(result.token);
    }
    return result;
  }

  // Test endpoints
  async testSimple() {
    return this.request('/test-simple');
  }

  async testAuth() {
    return this.request('/test-auth');
  }

  async healthCheck() {
    return this.request('/health');
  }

  // Report endpoints - UPDATED TO MATCH YOUR BACKEND
  async submitReport(reportData) {
    return this.request('/reports', {
      method: 'POST',
      body: JSON.stringify(reportData),
    });
  }

  // Use the main reports endpoint (not enhanced)
  async getReports(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/reports?${queryString}`);
  }

  // Alias for getReports to maintain compatibility
  async getEnhancedReports(params = {}) {
    console.log('Getting enhanced reports with params:', params);
    return this.getReports(params);
  }

  async getReport(id) {
    return this.request(`/reports/${id}`);
  }

  // Statistics endpoints
  async getReportStats() {
    return this.request('/reports/stats');
  }

  async getDashboardStats() {
    return this.request('/dashboard/stats');
  }

  async getDashboardData() {
    return this.request('/dashboard/data');
  }

  // Feedback endpoints
  async addFeedback(reportId, feedbackData) {
    return this.request(`/reports/${reportId}/feedback`, {
      method: 'POST',
      body: JSON.stringify(feedbackData),
    });
  }

  async getFeedback(reportId) {
    return this.request(`/reports/${reportId}/feedback`);
  }

 // In your services/api.js, update the ratings methods:

// Rating endpoints
async submitRating(ratingData) {
  return this.request('/ratings', {
    method: 'POST',
    body: JSON.stringify(ratingData),
  });
}

async getRatings(params = {}) {
  const queryString = new URLSearchParams(params).toString();
  return this.request(`/ratings?${queryString}`);
}

async getRatingStats() {
  return this.request('/ratings/stats');
}

  // Export endpoint
 // In your services/api.js, update the exportReports method:

async exportReports() {
  try {
    console.log('Starting export process...');
    
    const response = await fetch(`${API_BASE_URL}/reports/export`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Export response status:', response.status);

    if (!response.ok) {
      // Try to get error message from response
      let errorMessage = `Export failed: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.details || errorMessage;
      } catch (e) {
        // If response is not JSON, use status text
        errorMessage = response.statusText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    // Check if response is actually a blob (Excel file)
    const contentType = response.headers.get('content-type');
    console.log('Export content type:', contentType);
    
    if (contentType && contentType.includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')) {
      const blob = await response.blob();
      console.log('Export blob size:', blob.size);
      
      if (blob.size === 0) {
        throw new Error('Export file is empty');
      }
      
      return blob;
    } else {
      // If not a blob, it might be an error message
      const errorData = await response.json();
      throw new Error(errorData.error || 'Invalid export response');
    }

  } catch (error) {
    console.error('Export API error:', error);
    throw error;
  }
}
}

export default new ApiService();