import { AxiosRequestConfig } from "./types";
import { transformRequest, transformResponse } from "@/helpers/transform.ts";
import { processHeaders } from "@/helpers/headers.ts";

export default {
    method: 'GET',
    headers: {
        common: {
            Accept: 'application/json, text/plain, */*'
        }
    },
    timeout: 0,
    adapter: 'xhr',
    xsrfCookieName: 'XSRF-TOKEN',
    xsrfHeaderName: 'X-XSRF-TOKEN',
    // 请求数据转换
    transformRequest: [
        function (data, headers ) {
            processHeaders(headers!, data);
            return transformRequest(data);
        }
    ],
    transformResponse: [
        function (data, headers) {
            return transformResponse(data);
        }
    ],
    validateStatus(status) {
        return status >= 200 && status < 300;
    }
} as AxiosRequestConfig