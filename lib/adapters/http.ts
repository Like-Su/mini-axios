import { kindOf } from "../helpers";
import {AxiosPromise, AxiosRequestConfig} from "../types";

const isHttpAdapterSupported = typeof process !== 'undefined' && kindOf(process) === 'process';

export default isHttpAdapterSupported && function httpAdapter(config: AxiosRequestConfig): AxiosPromise {
    return new Promise((resolve, reject) => {

    })
}
