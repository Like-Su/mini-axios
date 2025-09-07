import { Cancel as ICancelError, AxiosRequestConfig } from "@/types.ts";
import AxiosError, { ErrorCodes } from "@/core/AxiosError.ts";

export default class CancelError extends AxiosError implements ICancelError {
    __CANCEL__: boolean;
    constructor(public message: string, config:AxiosRequestConfig, request: XMLHttpRequest) {
        super(message ?? 'canceled', ErrorCodes.ERR_CANCELED.value, config, request);
        this.__CANCEL__ = true;
    }

}