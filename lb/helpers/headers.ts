import {IHeaders, Method} from "../types";
import {deepMerge} from "./index";

export function flattenHeaders(headers: IHeaders | undefined | null, method: Method): IHeaders | undefined | null {
    if(!headers) return headers;

    headers = deepMerge(headers.common, headers[method], headers);

    const methodsToDelete = ['delete', 'get', 'head', 'options', 'post', 'put', 'patch', 'common'];

    methodsToDelete.forEach(method => {
        delete headers[method];
    })

    return headers;
}