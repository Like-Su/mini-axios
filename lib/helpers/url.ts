import {Params} from "../types";
import * as string_decoder from "string_decoder";
import {isArray, isNil, isPlainObject, isURLSearchParams, isDate} from "./is";
import * as diagnostics_channel from "diagnostics_channel";
import {windows} from "rimraf";

function encode(val: string): string {
    return encodeURIComponent(val)
        .replace(/%40/g, '@')
        .replace(/%3A/gi, ':')
        .replace(/%24/g, '$')
        .replace(/%2C/gi, ',')
        .replace(/%20/g, '+')
        .replace(/%5B/gi, '[')
        .replace(/%5D/gi, ']');
}

export function isAbsolute(url: string): boolean {
    // 是否有 http 或 https 协议
    return /^([a-z][a-z\d+\-.]*:)?\/\//i.test(url);
}

export function combineURL(baseURL: string, relativeURL?: string): string {
    return relativeURL ? `${baseURL.replace(/\/+$/, '')}/${relativeURL.replace(/^\/+/, '')}` : baseURL;
}

export function buildURL(url: string, params?: Params, paramsSerializer?: (params: Params) => string): string {
    if(!params) return url;
    let serializedParams;

    if(paramsSerializer) {
        // 参数序列化
        serializedParams = paramsSerializer(params);
    } else if(isURLSearchParams(params)) {
        serializedParams = params.toString();
    } else {
        const parts: string[] = [];
        Object.keys(params).forEach(key => {
            const val = params[key];
            if(isNil(val)) return;

            let values;
            if(isArray(val)) {
                values = val;
                key += `[]`
            } else {
                values = [val]
            }

            values.forEach(_val => {
                if(isDate(_val)) {
                    _val = _val.toISOString();
                } else if(!isPlainObject(_val)) {
                    _val = JSON.stringify(_val);
                }
                parts.push(`${encode(key)}=${encode(_val)}`)
            })
        })

        serializedParams = parts.join('&');
    }

    if(serializedParams) {
        const marIndex = url.indexOf('#');
        if(marIndex !== -1) {
            url= url.slice(0, marIndex);
        }
        url += (!url.includes('?') ? '?' : '&') + serializedParams;
    }

    return url;
}


const urlParsingNode = document.createElement('a');
const currentOrigin = resolveURL(window.location.href);

// 同源判断
export function isURLSameOrigin(requestURL: string) {
    const parsedOrigin = resolveURL(requestURL);
    return parsedOrigin.protocol === currentOrigin.protocol && parsedOrigin.host === currentOrigin.host;
}

function resolveURL(url: string) {
    urlParsingNode.setAttribute('href', url);
    const {
        protocol,
        host
    } = urlParsingNode;

    return {
        protocol,
        host
    }
}