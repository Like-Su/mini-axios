import {AxiosPromise, AxiosRequestConfig, AxiosResponse} from "../types";
import {createError, ErrorCodes} from "./AxiosError";
import {buildURL, combineURL, isAbsolute} from "../helpers/url";
import {flattenHeaders} from "../helpers/headers";

// 门面模式
export default function dispatchRequest(config: AxiosRequestConfig): Promise<any> {
    processConfig(config);
    return xhr(config);
}

function processConfig(config: AxiosRequestConfig) {
    config.url = transformURL(config);
    // config.data = transform();
    config.headers = flattenHeaders(config.headers, config.method);
}

export function transformURL(config: AxiosRequestConfig): string {
    const { url, params, baseURL, paramsSerializer } = config;

    const fullPath = baseURL && !isAbsolute(url) ? combineURL(baseURL, url) : url;

    return buildURL(fullPath, params, paramsSerializer);
}

function xhr(config: AxiosRequestConfig): AxiosPromise {
    return new Promise((resolve, reject) => {
        const { url, method, data, headers = {} } = config;

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

        request.send(data as any);
    });
}

function settle(resolve: (value: AxiosResponse) => void, reject: (reason: any) => void, response: AxiosResponse) {
    const validateStatus = response.config.validateStatus;
    // response.status >= 200 && response.status < 300
    if(!response.status || !validateStatus || validateStatus(response.status)) {
        resolve(response);
    } else {
        // 400~499: ErrorCodes.ERR_BAD_REQUEST
        // 500~599: ErrorCodes.ERR_BAD_RESPONSE
        const codes = [ErrorCodes.ERR_BAD_REQUEST.value,ErrorCodes.ERR_BAD_RESPONSE.value];
        const codeSelect = Math.floor(response.status / 100) - 4;

        reject(createError(`Request failed with status code ${response.status}`, response.config, codes[codeSelect], response.request, response))
    }
}