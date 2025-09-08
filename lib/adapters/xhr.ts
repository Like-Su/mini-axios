import {AxiosPromise, AxiosRequestConfig, AxiosResponse, Cancel, CancelExecutor} from "../types";
import {createError, ErrorCodes} from "../core/AxiosError";
import settle from "../core/settle";
import CancelError from "@/cancel/CancelError.ts";
import {parseHeaders} from "@/helpers/headers.ts";

const isXhrAdapterSupported = typeof XMLHttpRequest !== 'undefined';

export default isXhrAdapterSupported && function xhr(config: AxiosRequestConfig): AxiosPromise {
    return new Promise((resolve, reject) => {
        const { url, method, data, timeout, responseType, cancelToken , signal } = config;

        const request = new XMLHttpRequest();


        const onCancel = (reason?: Cancel) => {
            reject(reason ?? new CancelError('canceled', config, request));
            request.abort();
        }

        const done = () => {
            if(cancelToken) {
                cancelToken.unsubscribe(onCancel);
            }
            if(signal) {
                signal.removeEventListener?.('abort', onCancel);
            }
        }

        request.open((method as string).toUpperCase(), url!, true);

        request.onreadystatechange = function () {
            if(request.readyState !== 4) return;
            if(request.status === 0) return;

            const responseHeaders = request.getAllResponseHeaders();

            const response: AxiosResponse = {
                data: request.response,
                status: request.status,
                statusText: request.statusText,
                headers: parseHeaders(responseHeaders),
                config,
                request
            }

            settle((val) => {
                done();
                resolve(val);
            }, (err) => {
                reject(err);
                done();
            }, response);
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

        if(cancelToken || signal) {
            cancelToken && cancelToken.subscribe(onCancel);
            if(signal) {
                config.signal?.aborted ? onCancel() : signal?.addEventListener?.('abort', onCancel)
            }
        }

        request.send(data as any);
    });
}