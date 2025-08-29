import {Axios as IAxios, AxiosRequestConfig} from "../types";
import dispatchRequest from "./dispatchRequest";
import mergeConfig from "./mergeConfig";

export default class Axios implements IAxios {
    defaults: AxiosRequestConfig;
    constructor(config: AxiosRequestConfig) {
        this.defaults = config;
    }

    request(url: string | AxiosRequestConfig, config: AxiosRequestConfig = {}): Promise<any> {
        if(typeof url === 'string') {
            config.url = url;
        } else {
            // 传对象
            config = url;
        }

        config = mergeConfig(this.defaults, config);

        return dispatchRequest(config);
    }
}