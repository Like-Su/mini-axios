import {AxiosResponse} from "../types";
import {createError, ErrorCodes} from "./AxiosError";

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

export default settle;
