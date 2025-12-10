import axios from "axios";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "./useAuth";

const axiosSecure = axios.create({
    baseURL: "https://hospitam-crm-server.vercel.app",
})
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