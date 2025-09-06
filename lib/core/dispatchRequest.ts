import { AxiosRequestConfig } from "../types";
import {buildURL, combineURL, isAbsolute} from "../helpers/url";
import {flattenHeaders} from "../helpers/headers";
import adapters from '../adapters'
import defaults from "../defaults";

// 门面模式
export default function dispatchRequest(config: AxiosRequestConfig): Promise<any> {
    throwIfCancellationRequested(config);
    processConfig(config);
    const adapter = adapters.getAdapter(config?.adapter || defaults.adapter);
    return adapter(config);
}

function processConfig(config: AxiosRequestConfig) {
    config.url = transformURL(config);
    // config.data = transform();
    config.headers = flattenHeaders(config.headers, config.method!);
}

export function transformURL(config: AxiosRequestConfig): string {
    const { url, params, baseURL, paramsSerializer } = config;

    const fullPath = baseURL && !isAbsolute(url!) ? combineURL(baseURL, url) : url;

    return buildURL(fullPath!, params, paramsSerializer);
}

function throwIfCancellationRequested(config: AxiosRequestConfig) {
    if(config.cancelToken) {
        config.cancelToken.throwIfRequested();
    }
}