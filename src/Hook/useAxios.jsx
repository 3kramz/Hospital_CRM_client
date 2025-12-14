import axios from "axios";

// Constants for URLs
const LOCAL_URL = "http://localhost:5000";
const REMOTE_URL = "https://hospitam-crm-server.vercel.app";

export const axiosPublic = axios.create({
  baseURL: window.location.hostname.includes("localhost") ? LOCAL_URL : REMOTE_URL,
});

// Failover Interceptor
axiosPublic.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Check if it's a network error (server down) and we haven't retried yet
    // ERR_NETWORK is the standard Axios error code for connection refused/network down
    if (
      (error.code === "ERR_NETWORK" || error.message === "Network Error") &&
      !originalRequest._retry &&
      axiosPublic.defaults.baseURL === LOCAL_URL
    ) {
      originalRequest._retry = true;
      console.warn("Local server unreachable, switching to Remote Server...");

      // Switch the default base URL for this instance to the remote URL
      axiosPublic.defaults.baseURL = REMOTE_URL;
      
      // Update the baseURL of the failing request and retry
      originalRequest.baseURL = REMOTE_URL;
      return axiosPublic(originalRequest);
    }
    return Promise.reject(error);
  }
);

const useAxios = () => {
  return axiosPublic;
};

export default useAxios;
