import {
    Axios as IAxios,
    AxiosPromise,
    AxiosRequestConfig,
    AxiosResponse,
    Method,
    RejectedFn,
    ResolvedFn
} from "../types";
import dispatchRequest, {transformURL} from "./dispatchRequest";
import mergeConfig from "./mergeConfig";
import InterceptorManager from "./InterceptorManager";

interface Interceptors {
    request: InterceptorManager<AxiosRequestConfig>;
    response: InterceptorManager<AxiosResponse>;
}

interface PromiseChainNode<T> {
    resolved: ResolvedFn<T> | ((config: AxiosRequestConfig) => AxiosPromise);
    rejected?: RejectedFn;
}

type PromiseChain<T> = PromiseChainNode<T>[];

export default class Axios implements IAxios {
    defaults: AxiosRequestConfig;
    interceptors: Interceptors;
    constructor(config: AxiosRequestConfig) {
        this.defaults = config;
        this.interceptors = {
            request: new InterceptorManager<AxiosRequestConfig>(),
            response: new InterceptorManager<AxiosResponse>()
        }

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


        const chain: PromiseChain<any> = [
            {
                resolved: dispatchRequest,
                rejected: void 0
            }
        ]

        this.interceptors.request.forEach(interceptor => chain.unshift(interceptor));
        this.interceptors.response.forEach(interceptor => chain.push(interceptor));

        let promise = Promise.resolve(config) as AxiosPromise<AxiosRequestConfig>;

        while(chain.length) {
            const {resolved, rejected} = chain.shift()!;

            promise = promise.then(resolved, resolved);
        }

        return promise;
    }

    getUri(config?: AxiosRequestConfig): string {
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