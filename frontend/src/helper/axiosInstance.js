import axios from 'axios';

const baseURL = import.meta.env.MODE === 'development'
    ? 'http://localhost:5000'
    : 'https://video-detection-l8aa.onrender.com';

const axiosInstance = axios.create({
    baseURL,
});

export default axiosInstance;
