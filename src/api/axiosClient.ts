import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// ✅ Add this request interceptor
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Keep your response interceptor (slightly cleaned)
API.interceptors.response.use(
  (res) => res,
  (err) => {
    const originalUrl = err.config?.url || "";

    if (
      err.response?.status === 401 &&
      !originalUrl.includes("/auth/login") &&
      !originalUrl.includes("/users/change-password")
    ) {
      localStorage.removeItem("token");
      window.location.href = `${import.meta.env.BASE_URL}login`;
    }

    return Promise.reject(err);
  }
);

export default API;
