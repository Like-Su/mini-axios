import {Axios as IAxios, AxiosRequestConfig, Method} from "../types";
import dispatchRequest, {transformURL} from "./dispatchRequest";
import mergeConfig from "./mergeConfig";

export default class Axios implements IAxios {
    defaults: AxiosRequestConfig;
    constructor(config: AxiosRequestConfig) {
        this.defaults = config;
        this._eachMethodNoData();
        this._eachMethodWithData();
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

    getUri(config: AxiosRequestConfig): string {
        return transformURL(mergeConfig(this.defaults, config));
    }

    private _eachMethodNoData(){
        const methods: Method[] = ['get', 'delete', 'head', 'options'];

        methods.forEach(method => {
            (Axios.prototype as Record<Method, any>)[method] = (url:string, config?: AxiosRequestConfig) => {
                return this.request(mergeConfig(config || {}, { method, url }))
            }
        })
    }

    private _eachMethodWithData() {
        const methods: Method[] = ['post', 'put', 'patch'];
        const genHttpMethod = (isForm: boolean, method: Method) => (url: string, data: unknown, config: AxiosRequestConfig) => {
            const headers = isForm ? { 'Content-Type': 'multipart/form-data' } : {};

            return this.request(mergeConfig(config || {}, {
                method,
                url,
                data,
                headers
            }))
        }
        methods.forEach(method => {
            (Axios.prototype as Record<Method, any>)[method] = genHttpMethod(false, method);
            (Axios.prototype as Record<Method, any>)[`${method}Form`] = genHttpMethod(true, method);
        })
    }
}