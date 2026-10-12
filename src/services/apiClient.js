// Python FastAPI Backend API Client
const API_BASE_URL = '/api';

/**
 * Helper to perform HTTP requests with graceful fallback
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const res = await fetch(url, config);
    if (!res.ok) {
      const errorText = await res.text();
      console.warn(`API Error [${res.status}] ${endpoint}:`, errorText);
      return { success: false, status: res.status, error: errorText };
    }
    const data = await res.json();
    return { success: true, data };
  } catch (err) {
    // Network or server offline
    console.info(`Python Backend offline or unreachable at ${endpoint}:`, err.message);
    return { success: false, error: err.message, isNetworkError: true };
  }
}

export const api = {
  // Health
  checkHealth: async () => {
    return request('/health');
  },

  // Sessions
  saveSession: async (sessionData) => {
    return request('/sessions', {
      method: 'POST',
      body: JSON.stringify(sessionData),
    });
  },

  getSessions: async ({ childId, userId } = {}) => {
    const params = new URLSearchParams();
    if (childId) params.append('childId', childId);
    if (userId) params.append('userId', userId);
    const query = params.toString() ? `?${params.toString()}` : '';
    return request(`/sessions${query}`);
  },

  getSessionById: async (sessionId) => {
    return request(`/sessions/${sessionId}`);
  },

  analyzeSession: async (sessionId) => {
    return request(`/sessions/${sessionId}/analyze`, {
      method: 'POST',
    });
  },

  // Diagnostics & Historical Categories
  getModelInfo: async () => {
    return request('/diagnostics/model-info');
  },

  evaluateSessionDiagnostics: async (sessionPayload) => {
    return request('/diagnostics/evaluate', {
      method: 'POST',
      body: JSON.stringify(sessionPayload),
    });
  },

  getSessionDiagnostics: async (sessionId) => {
    return request(`/diagnostics/session/${sessionId}`);
  },

  // Children
  getChildren: async (userId) => {
    const query = userId ? `?userId=${encodeURIComponent(userId)}` : '';
    return request(`/children${query}`);
  },

  saveChild: async (childData) => {
    return request('/children', {
      method: 'POST',
      body: JSON.stringify(childData),
    });
  },

  updateChild: async (childId, updates) => {
    return request(`/children/${childId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  // Progress
  getChildProgress: async (childId) => {
    return request(`/progress/${childId}`);
  },

  // Users
  saveUserProfile: async (userProfile) => {
    return request('/users/profile', {
      method: 'POST',
      body: JSON.stringify(userProfile),
    });
  },

  getUserProfile: async (userId) => {
    return request(`/users/${userId}`);
  },
};

export default api;

