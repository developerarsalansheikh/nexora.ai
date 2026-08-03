import axios from 'axios';

// Instantiate pre-configured Axios instance
const apiClient = axios.create({
  baseURL: 'https://nexora-ai-93tu.onrender.com/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // Timeout after 15s
  withCredentials: true, // Crucial for reading/sending HttpOnly cookies (refreshToken)
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request interceptor to attach JWT token & organization ID
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('nexora_jwt_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    const orgId = localStorage.getItem('nexora_org_id');
    if (orgId && !config.headers['x-organization-id']) {
      config.headers['x-organization-id'] = orgId;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle system failures and RTR
apiClient.interceptors.response.use(
  (response) => {
    // Return the envelope data directly if present
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    const formattedError = {
      message: error.response?.data?.message || 'A network error occurred. Please check your connection.',
      status: error.response?.status || 500,
      code: error.response?.data?.code || 'UNEXPECTED_ERROR',
      original: error,
    };

    // If unauthorized, attempt to perform RTR (except for login/register/logout paths)
    if (
      formattedError.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes('/auth/login') &&
      !originalRequest.url.includes('/auth/register') &&
      !originalRequest.url.includes('/auth/refresh')
    ) {
      if (isRefreshing) {
        try {
          const token = await new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          });
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        } catch (err) {
          return Promise.reject(err);
        }
      }

      originalRequest._retry = true;
      isRefreshing = true;

      return new Promise((resolve, reject) => {
        apiClient.post('/auth/refresh')
          .then((res) => {
            // Note: res is already the full envelope {statusCode, success, message, data}
            // because the success response interceptor returns response.data
            const accessToken = res?.data?.accessToken;
            if (accessToken) {
              localStorage.setItem('nexora_jwt_token', accessToken);
              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
              processQueue(null, accessToken);
              resolve(apiClient(originalRequest));
            } else {
              throw new Error('Refresh response did not contain an access token.');
            }
          })
          .catch((err) => {
            processQueue(err, null);
            localStorage.removeItem('nexora_jwt_token');
            // Notify UI layer to force log out
            window.dispatchEvent(new Event('nexora-unauthorized'));
            reject(err);
          })
          .finally(() => {
            isRefreshing = false;
          });
      });
    }

    return Promise.reject(formattedError);
  }
);

export default apiClient;
