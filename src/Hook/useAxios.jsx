import axios from "axios";

export const axiosPublic = axios.create({
  baseURL: "http://localhost:5080",
});


const useAxios = () => {
  return axiosPublic;
};

export default useAxios;
