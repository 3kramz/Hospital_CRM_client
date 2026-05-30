import axios from "axios";
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "./useAuth";

const LOCAL_URL = "http://localhost:5000";
const REMOTE_URL = "https://hospitam-crm-server.vercel.app";

const axiosSecure = axios.create({
    baseURL: window.location.hostname.includes("localhost") ? LOCAL_URL : REMOTE_URL,
    // Fail fast on localhost; failover interceptor raises this to 15 s for remote
    timeout: 2000,
});

const useAxiosSecure = () => {
    const navigate = useNavigate();
    const { logOut } = useAuth();

    // Store callbacks in refs so interceptors never need to be torn down and
    // re-added just because logOut/navigate got a new reference.
    const logOutRef = useRef(logOut);
    const navigateRef = useRef(navigate);

    useEffect(() => {
        logOutRef.current = logOut;
        navigateRef.current = navigate;
    }, [logOut, navigate]);

    useEffect(() => {
        // Request interceptor — attach JWT Bearer token
        const requestInterceptor = axiosSecure.interceptors.request.use(
            (config) => {
                const token = localStorage.getItem("access-token");
                if (token && token !== "null" && token !== "undefined") {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        // Response interceptor — fast failover + auth error handling
        const responseInterceptor = axiosSecure.interceptors.response.use(
            (response) => response,
            async (error) => {
                const originalRequest = error.config || {};
                const status = error.response?.status;

                // Failover: localhost down → switch to remote quickly (2 s timeout)
                if (
                    (error.code === "ERR_NETWORK" ||
                        error.code === "ECONNABORTED" ||
                        error.message === "Network Error") &&
                    !originalRequest._retry &&
                    axiosSecure.defaults.baseURL === LOCAL_URL
                ) {
                    originalRequest._retry = true;
                    console.warn("Local server unreachable (Secure), switching to Remote Server...");
                    axiosSecure.defaults.timeout = 15000; // cold-start headroom
                    axiosSecure.defaults.baseURL = REMOTE_URL;
                    originalRequest.baseURL = REMOTE_URL;
                    originalRequest.timeout = 15000;
                    return axiosSecure(originalRequest);
                }

                // Auth error → log out and redirect
                if (status === 401 || status === 403) {
                    await logOutRef.current?.();
                    navigateRef.current?.("/");
                }

                return Promise.reject(error);
            }
        );

        return () => {
            axiosSecure.interceptors.request.eject(requestInterceptor);
            axiosSecure.interceptors.response.eject(responseInterceptor);
            // Reset to local on unmount so the next mount starts fresh
            if (window.location.hostname.includes("localhost")) {
                axiosSecure.defaults.baseURL = LOCAL_URL;
                axiosSecure.defaults.timeout = 2000;
            }
        };
    }, []); // ← empty deps: refs keep callbacks current without re-running effect

    return axiosSecure;
};

export default useAxiosSecure;