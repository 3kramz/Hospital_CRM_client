import axios from "axios";

const LOCAL_URL = "http://localhost:5000";
const REMOTE_URL = "https://hospitam-crm-server.vercel.app";

export const axiosPublic = axios.create({
  baseURL: window.location.hostname.includes("localhost") ? LOCAL_URL : REMOTE_URL,
  // Short timeout so a dead local server fails in 2 s instead of ~30 s.
  // The failover interceptor below raises it to 15 s for the remote call.
  timeout: 2000,
});

// Failover Interceptor
axiosPublic.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Network error OR our 2-second timeout — fail over to remote quickly
    if (
      (error.code === "ERR_NETWORK" ||
        error.code === "ECONNABORTED" ||
        error.message === "Network Error") &&
      !originalRequest._retry &&
      axiosPublic.defaults.baseURL === LOCAL_URL
    ) {
      originalRequest._retry = true;
      console.warn("Local server unreachable, switching to Remote Server...");

      // Give the remote (Vercel) server enough time for a cold start
      axiosPublic.defaults.timeout = 15000;
      axiosPublic.defaults.baseURL = REMOTE_URL;
      originalRequest.baseURL = REMOTE_URL;
      originalRequest.timeout = 15000;
      return axiosPublic(originalRequest);
    }

    return Promise.reject(error);
  }
);

const useAxios = () => {
  return axiosPublic;
};

export default useAxios;
