import {AxiosPromise, AxiosRequestConfig, AxiosResponse} from "../types";
import {createError, ErrorCodes} from "../core/AxiosError";
import settle from "../core/settle";

const isXhrAdapterSupported = typeof XMLHttpRequest !== 'undefined';

export default isXhrAdapterSupported && function xhr(config: AxiosRequestConfig): AxiosPromise {
    return new Promise((resolve, reject) => {
        const { url, method, data, headers = {}, timeout, responseType } = config;

        const request = new XMLHttpRequest();

        request.open(method.toUpperCase(), url!, true);

        request.onreadystatechange = function () {
            if(request.readyState !== 4) return;
            if(request.status === 0) return;

            const response: AxiosResponse = {
                data: request.response,
                status: request.status,
                statusText: request.statusText,
                headers,
                config,
                request
            }

            settle(resolve, reject, response);
        }

        request.onerror = function () {
            reject(createError('Network Error', config, null, request))
        }

        request.ontimeout = function handleTimeout() {
            reject(createError('Timeout Error', config, ErrorCodes.ETIMEDOUT.value, request))
        }

        if(responseType) {
            request.responseType = responseType;
        }

        if(timeout) {
            request.timeout = timeout;
        }

        request.send(data as any);
    });
}