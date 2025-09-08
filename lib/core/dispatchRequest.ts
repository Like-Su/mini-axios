import {AxiosRequestConfig, AxiosResponse} from "../types";
import {buildURL, combineURL, isAbsolute} from "../helpers/url";
import {flattenHeaders} from "../helpers/headers";
import { transformData } from "@/core/transformData.ts";
import adapters from '../adapters'
import defaults from "../defaults";
import {isArray} from "@/helpers/is.ts";

// 门面模式
export default function dispatchRequest(config: AxiosRequestConfig): Promise<any> {
    throwIfCancellationRequested(config);
    processConfig(config);
    const adapter = adapters.getAdapter(config?.adapter || defaults.adapter);
    return adapter(config).then((res:AxiosResponse) => transformResponseData(res))
}

function processConfig(config: AxiosRequestConfig) {
    config.url = transformURL(config);
    config.data = transformData.call(config, isArray(config.transformRequest) ? config.transformRequest : [config.transformRequest!]);
    config.headers = flattenHeaders(config.headers, config.method!);
}

export function transformURL(config: AxiosRequestConfig): string {
    const {url, params, baseURL, paramsSerializer} = config;

    const fullPath = baseURL && !isAbsolute(url!) ? combineURL(baseURL, url) : url;

    return buildURL(fullPath!, params, paramsSerializer);
}

function transformResponseData(res:AxiosResponse) {
    const transformResponse = res.config.transformResponse;
    res.data = transformData.call(res, isArray(transformResponse) ? transformResponse : [transformResponse!]);
    return res;
}

function throwIfCancellationRequested(config: AxiosRequestConfig) {
    if(config.cancelToken) {
        config.cancelToken.throwIfRequested();
    }
}