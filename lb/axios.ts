import type { AxiosRequestConfig, AxiosInstance } from "./types";
import Axios from './core/Axios';
import defaults from './defaults';

// 工厂模式
function createInstance(config: AxiosRequestConfig):AxiosInstance {
    const context = new Axios(config);

    return context as AxiosInstance;
}

const axios = createInstance(defaults);

export default axios;