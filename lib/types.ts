import CancelError from "@/cancel/CancelError.ts";
import AxiosClass from "@/core/Axios.ts";

export type Method = 'get' | 'GET' | 'post' | 'POST' | 'put' | 'PUT' | 'delete' | 'DELETE' | 'head' | 'HEAD' | 'options' | 'OPTIONS' | 'patch' | 'PATCH';

export type Params = Record<string, any>
export type IHeaders = Record<string, any>

export interface AxiosRequestConfig {
    method?: Method;
    url?: string;
    data?: unknown;
    params?: Params;
    headers?: IHeaders | void | null;
    baseURL?: string;
    responseType?: XMLHttpRequestResponseType;
    timeout?: number;

    // 自定义适配器
    adapter?: 'http' | 'xhr' | 'fetch' | ((config: AxiosRequestConfig) => AxiosPromise);

    transformRequest?: AxiosTransformer | AxiosTransformer[];
    transformResponse?: AxiosTransformer | AxiosTransformer[];

    // 取消请求
    cancelToken?: CancelToken;
    signal?: GenericAboutSignal;

    // 根据状态码判断请求是否成功
    validateStatus?: (status: number) => boolean;

    // 自定义参数序列化函数
    paramsSerializer?: (params: Params) => string;
}

export interface AxiosTransformer {
    (this: AxiosRequestConfig, data: any, headers: IHeaders, status?: number): any;
}

// https://developer.mozilla.org/en-US/docs/Web/API/AbortController
export interface GenericAboutSignal {
    readonly aborted: boolean;
    onabort?: ((...args: any) => any) | null;
    addEventListener?: (type: string, listener: (...args: any) => any) => any;
    removeEventListener?: (type: string, listener: (...args: any) => any) => any;
}

export interface AxiosResponse<T = any> {
    data: T;
    status: number;
    statusText: string;
    headers: IHeaders;
    config: AxiosRequestConfig;
    request: XMLHttpRequest;
}

export interface AxiosPromise<T = any> extends Promise<AxiosResponse<T>> {}

// https://github.com/axios/axios/blob/a9f47afbf3224d2ca987dbd8188789c7ea853c5d/lib/core/AxiosError.js#L62
export type AxiosErrorCode =
    'ERR_BAD_OPTION_VALUE'|
    'ERR_BAD_OPTION'|
    'ECONNABORTED'|
    'ETIMEDOUT'|
    'ERR_NETWORK'|
    'ERR_FR_TOO_MANY_REDIRECTS'|
    'ERR_DEPRECATED'|
    'ERR_BAD_RESPONSE'|
    'ERR_BAD_REQUEST'|
    'ERR_CANCELED'|
    'ERR_NOT_SUPPORT'|
    'ERR_INVALID_URL'

export interface AxiosError extends Error {
    isAxiosError: boolean;
    config: AxiosRequestConfig;
    code?: AxiosErrorCode | null;
    request?: XMLHttpRequest;
    response?: AxiosResponse;
}

export interface Axios {
    defaults: AxiosRequestConfig;
    interceptors: {
        request: AxiosInterceptorManager<AxiosRequestConfig>;
        response: AxiosInterceptorManager<AxiosResponse>;
    }
    getUri: (config?: AxiosRequestConfig) => string;
    request<T = any>(config: AxiosRequestConfig): AxiosPromise<T>;
}

export interface AxiosInstance extends Axios {
    <T = any>(config: AxiosRequestConfig): AxiosPromise<T>;

    <T = any>(url: string, config?: AxiosRequestConfig): AxiosPromise<T>;
}

export interface AxiosStatic extends AxiosInstance {
    <T = any>(config: AxiosRequestConfig): AxiosPromise<T>;
    <T = any>(url: string, config?: AxiosRequestConfig): AxiosPromise<T>;

    get: <T = any>(url: string, config?: AxiosRequestConfig) => AxiosPromise<T>;
    delete: <T = any>(url: string, config?: AxiosRequestConfig) => AxiosPromise<T>;
    head: <T = any>(url: string, config?: AxiosRequestConfig) => AxiosPromise<T>;
    options: <T = any>(url: string, config?: AxiosRequestConfig) => AxiosPromise<T>;

    post: <T = any>(url: string, data?: unknown, config?: AxiosRequestConfig) => AxiosPromise<T>;
    put: <T = any>(url: string, data?: unknown, config?: AxiosRequestConfig) => AxiosPromise<T>;
    patch: <T = any>(url: string, data?: unknown, config?: AxiosRequestConfig) => AxiosPromise<T>;

    putForm: <T = any>(url: string, data?: unknown, config?: AxiosRequestConfig) => AxiosPromise<T>;
    postForm: <T = any>(url: string, data?: unknown, config?: AxiosRequestConfig) => AxiosPromise<T>;
    patchForm: <T = any>(url: string, data?: unknown, config?: AxiosRequestConfig) => AxiosPromise<T>;
}

export interface AxiosClassStatic {
    new (config: AxiosRequestConfig): Axios;
    Axios: typeof AxiosClass;

    isCancel: (val: unknown) => val is Cancel;
    CancelToken: CancelTokenStatic;
    CancelError: CancelError;

    create: (config?: AxiosRequestConfig) => AxiosInstance;
    all: <T>(promises: Array<T | Promise<T>>) => Promise<T[]>;
    spread: <T, R>(callback: (...args: T[]) => R) => (arr: T[]) => R;
}

export interface AxiosInterceptorManager<T = any> {
    use: (resolved: ResolvedFn<T>, rejected?: RejectedFn) => number;
    eject: (id: number) => void;
}

export interface ResolvedFn<T> {
    (val: T): T | Promise<T>;
}

export interface RejectedFn {
    (error: any): any;
}

export interface CancelToken {
    promise: Promise<string>;
    reason?: Cancel;
    subscribe: (listener: Function) => void;
    unsubscribe: (listener: Function) => void;

    throwIfRequested(): void;
}

export interface CancelTokenStatic {
    new (executor: CancelExecutor): CancelToken;
    source: () => CancelTokenSource;
}

export interface Canceler {
    (message: string, config: AxiosRequestConfig, request: XMLHttpRequest): void;
}

export interface CancelExecutor {
    (cancel: Canceler): void;
}

export interface CancelTokenSource {
    token: CancelToken;
    cancel: Canceler;
}

export interface Cancel {
    message?: string;
}

export interface CancelStatic {
    new (message: string, config: AxiosRequestConfig, request: XMLHttpRequest): Cancel;
}