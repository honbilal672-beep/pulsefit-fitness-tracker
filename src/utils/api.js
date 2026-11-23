import axios from "axios";
const API = axios.create({
  baseURL: "",
  headers: {
    "Content-Type": "application/json"
  }
});
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("pulsefit_token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (!error.config.url?.includes("/api/auth/login")) {
        localStorage.removeItem("pulsefit_token");
        localStorage.removeItem("pulsefit_user");
      }
    }
    return Promise.reject(error);
  }
);
var stdin_default = API;
export {
  API,
  stdin_default as default
};
