import {isFunction} from "../helpers/is";
import {AxiosPromise, AxiosRequestConfig} from "../types";

const isFetchAdapterSupported = typeof fetch !== 'undefined' && isFunction(fetch);

export default isFetchAdapterSupported && function fetchAdapter(config: AxiosRequestConfig): AxiosPromise {
    return new Promise((resolve, reject) => {
        return fetch(config.url, {
            method: config.method,
            body: config.data,
            headers: config.headers,
        })
    })
}
