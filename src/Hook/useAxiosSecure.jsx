import axios from "axios";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "./useAuth";

const LOCAL_URL = "http://localhost:5000";
const REMOTE_URL = "https://hospitam-crm-server.vercel.app";

const axiosSecure = axios.create({
    baseURL: LOCAL_URL,
})

// Failover Interceptor used to switch to remote server if local server is down
axiosSecure.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

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