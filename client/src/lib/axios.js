import axios from "axios";
import { API_BASE_URL } from "../../env";

export const axiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  withCredentials: true,
});
