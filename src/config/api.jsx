import axios from "axios";

// Create axios instance with base configuration
const api = axios.create({
  baseURL:
    "https://theatre-app-backend-api-fuarhje3aceffkcu.centralindia-01.azurewebsites.net/api",
  timeout: 10000, // 10 seconds timeout
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Request interceptor for adding auth token if available
api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling global errors
api.interceptors.response.use(
  (response) => {
    // You can modify response data here before it's passed to the calling function
    return response;
  },
  (error) => {
    // Handle errors globally
    if (error.response) {
      // The request was made and the server responded with a status code
      switch (error.response.status) {
        case 401:
          // Handle unauthorized access (e.g., redirect to login)
          console.error("Unauthorized access - redirecting to login");
          window.location.href = "/login";
          break;
        case 403:
          // Handle forbidden access
          console.error("Forbidden access");
          break;
        case 404:
          // Handle not found errors
          console.error("Resource not found");
          break;
        case 500:
          // Handle server errors
          console.error("Server error", error.response.data);
          break;
        default:
          console.error("An error occurred");
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error("No response received from server");
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error("Error setting up request:", error.message);
    }

    return Promise.reject(error);
  }
);

// Generic GET request
const get = async (url, params = {}, headers = {}) => {
  try {
    const response = await api.get(url, { params, headers });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Generic POST request
const post = async (url, data = {}, headers = {}) => {
  try {
    const response = await api.post(url, data, { headers });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Generic PUT request
const put = async (url, data = {}, headers = {}) => {
  try {
    const response = await api.put(url, data, { headers });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Generic PATCH request
const patch = async (url, data = {}, headers = {}) => {
  try {
    const response = await api.patch(url, data, { headers });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Generic DELETE request
const del = async (url, data = {}, headers = {}) => {
  try {
    const response = await api.delete(url, { data, headers });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Export all methods
export default {
  get,
  post,
  put,
  patch,
  delete: del, // 'delete' is a reserved word, so we use 'del' and export as 'delete'

  // You can also expose the axios instance directly if needed
  axiosInstance: api,
};
