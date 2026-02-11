import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'https://video-detection-l8aa.onrender.com',
});

export default axiosInstance;
