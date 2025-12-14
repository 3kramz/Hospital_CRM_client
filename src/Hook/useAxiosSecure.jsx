import axios from "axios";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "./useAuth";

const LOCAL_URL = "http://localhost:5000";
const REMOTE_URL = "https://hospitam-crm-server.vercel.app";

const axiosSecure = axios.create({
    baseURL: window.location.hostname.includes("localhost") ? LOCAL_URL : REMOTE_URL,
});

// Failover Interceptor for Secure Client
axiosSecure.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;
        
        // Check if it's a network error (server down) and we haven't retried yet
        if (
            (error.code === "ERR_NETWORK" || error.message === "Network Error") &&
            !originalRequest._retry &&
            axiosSecure.defaults.baseURL === LOCAL_URL
        ) {
            originalRequest._retry = true;
            console.warn("Local server unreachable (Secure), switching to Remote Server...");

            // Switch the default base URL for this instance to the remote URL
            axiosSecure.defaults.baseURL = REMOTE_URL;
            
            // Update the baseURL of the failing request and retry
            originalRequest.baseURL = REMOTE_URL;
            return axiosSecure(originalRequest);
        }
        return Promise.reject(error);
    }
);
const useAxiosSecure = () => {
    const navigate = useNavigate();
    const { logOut } = useAuth();

    useEffect(() => {
        const requestInterceptor = axiosSecure.interceptors.request.use(function (config) {
            const token = localStorage.getItem('access-token')
            config.headers.Authorization = `Bearer ${token}`;
            return config;
        }, function (error) {
            return Promise.reject(error);
        });

        const responseInterceptor = axiosSecure.interceptors.response.use(function (response) {
            return response;
        }, async (error) => {
            const status = error.response.status;
            if (status === 401 || status === 403) {
                await logOut();
                navigate('/');
            }
            return Promise.reject(error);
        });

        return () => {
             axiosSecure.interceptors.request.eject(requestInterceptor);
             axiosSecure.interceptors.response.eject(responseInterceptor);
        }
    }, [logOut, navigate]);

    return axiosSecure;
};

export default useAxiosSecure;