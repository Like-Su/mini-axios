import {AxiosPromise, AxiosRequestConfig, AxiosResponse, Cancel, CancelExecutor} from "../types";
import {createError, ErrorCodes} from "../core/AxiosError";
import settle from "../core/settle";
import CancelError from "@/cancel/CancelError.ts";
import {parseHeaders} from "@/helpers/headers.ts";
import {isFromData, isNil} from "@/helpers/is.ts";
import {isURLSameOrigin} from "@/helpers/url.ts";
import { cookie } from '@/helpers/cookie.ts';

const isXhrAdapterSupported = typeof XMLHttpRequest !== 'undefined';

export default isXhrAdapterSupported && function xhr(config: AxiosRequestConfig): AxiosPromise {
    return new Promise((resolve, reject) => {
        const {
            url,
            method,
            data,
            timeout,
            headers,
            auth,
            responseType,
            cancelToken ,
            withCredentials,
            signal,
            xsrfCookieName,
            xsrfHeaderName,
            onDownloadProProgress,
            onUploadProgress
        } = config;

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

        if(onDownloadProProgress) {
            request.onprogress = onDownloadProProgress;
        }

        if(onUploadProgress) {
            request.upload.onprogress = onUploadProgress;
        }

        if(responseType) {
            request.responseType = responseType;
        }

        if(timeout) {
            request.timeout = timeout;
        }

        // 跨域请求
        if(withCredentials) {
            request.withCredentials = withCredentials;
        }

        if(cancelToken || signal) {
            cancelToken && cancelToken.subscribe(onCancel);
            if(signal) {
                config.signal?.aborted ? onCancel() : signal?.addEventListener?.('abort', onCancel)
            }
        }

        // process headers
        if(isFromData(data)) {
            delete headers!['Content-Type'];
        }

        if((withCredentials || isURLSameOrigin(url!)) && xsrfCookieName) {
            // xsrf 处理
            const xsrfVal = cookie.read(xsrfCookieName);
            if(xsrfVal &&xsrfHeaderName) {
                headers![xsrfHeaderName] = xsrfVal;
            }
        }

        // 处理 auth
        if(auth) {
            headers!['Authorization'] = 'Basic ' + btoa(auth.username + ':' + auth.password);
        }

        Object.keys(headers!).forEach(name => {
            if(data === null && name.toLocaleLowerCase() === 'content-type') {
                delete headers![name];
            } else {
                request.setRequestHeader(name, headers![name]);
            }
        });

        request.send(data as any);
    });
}