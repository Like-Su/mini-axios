import defaults from '@/defaults.ts';
import type {AxiosRequestConfig, AxiosResponse, AxiosTransformer} from "@/types.ts";

export function transformData(this: AxiosRequestConfig, fns: AxiosTransformer[] , response?: AxiosResponse) {
    const config = this || defaults;
    const context = response || config;
    const headers = config.headers;

    let data = context.data;

    fns.forEach(fn => {
        data = fn.call(config, data, headers, response?.status);
    });

    return data;
}