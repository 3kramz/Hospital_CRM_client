import axios from "axios";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "./useAuth";

const LOCAL_URL = "http://localhost:5000";
const REMOTE_URL = "https://hospitam-crm-server.vercel.app";

const axiosSecure = axios.create({
    baseURL: window.location.hostname.includes("localhost") ? LOCAL_URL : REMOTE_URL,
});

const useAxiosSecure = () => {
    const navigate = useNavigate();
    const { logOut } = useAuth();

    useEffect(() => {
        // Request interceptor: attach JWT Bearer token
        const requestInterceptor = axiosSecure.interceptors.request.use(function (config) {
            const token = localStorage.getItem('access-token');
            if (token && token !== 'null' && token !== 'undefined') {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        }, function (error) {
            return Promise.reject(error);
        });

        // Response interceptor: handle auth errors + local→remote failover
        const responseInterceptor = axiosSecure.interceptors.response.use((response) => {
            return response;
        }, async (error) => {
            const originalRequest = error.config || {};
            const status = error.response?.status;

            // Failover: if local server is down and we haven't retried yet, switch to remote
            if (
                (error.code === "ERR_NETWORK" || error.message === "Network Error") &&
                !originalRequest._retry &&
                axiosSecure.defaults.baseURL === LOCAL_URL
            ) {
                originalRequest._retry = true;
                console.warn("Local server unreachable (Secure), switching to Remote Server...");
                axiosSecure.defaults.baseURL = REMOTE_URL;
                originalRequest.baseURL = REMOTE_URL;
                return axiosSecure(originalRequest);
            }

            // Auth error: log out and redirect to login
            if (status === 401 || status === 403) {
                await logOut();
                navigate('/');
            }

            return Promise.reject(error);
        });

        return () => {
             axiosSecure.interceptors.request.eject(requestInterceptor);
             axiosSecure.interceptors.response.eject(responseInterceptor);
             // Reset baseURL back to local when the component unmounts
             // so the next mount starts fresh (relevant in dev with local server)
             if (window.location.hostname.includes("localhost")) {
                 axiosSecure.defaults.baseURL = LOCAL_URL;
             }
        }
    }, [logOut, navigate]);

    return axiosSecure;
};

export default useAxiosSecure;