import {AxiosRequestConfig, AxiosPromise} from "../types";
import {isArray, isFunction, isString} from "../helpers/is";
import xhrAdapter from './xhr'
import fetchAdapter from './fetch'
import httpAdapter from './http'

const knownAdapter: Record<string, (config: AxiosRequestConfig) => AxiosPromise | boolean> = {
    'xhr': xhrAdapter,
    'fetch': fetchAdapter,
    'http': httpAdapter,
}

type Adapter = AxiosRequestConfig['adapter'];

export default {
    adapters: knownAdapter,
    getAdapter(adapters: Array<Adapter> | Adapter): (config: AxiosRequestConfig) => AxiosPromise | boolean {
        adapters = isArray(adapters) ?adapters : [adapters];
        const { length } = adapters;

        let nameOrAdapter: Adapter;
        let adapter: (config: AxiosRequestConfig) => AxiosPromise | boolean | undefined;

        for(let i = 0; i < length; i++) {
            nameOrAdapter = adapters[i];
            if(adapter = isString(nameOrAdapter) ? knownAdapter[nameOrAdapter.toLowerCase()] : nameOrAdapter) {
                break;
            }
        }

        if(!adapter) {
            if(adapter === false) {
                throw new Error(`${nameOrAdapter} No adapter was specified and no known adapter could be found for the request.`)
            }
            throw new Error(`No adapter was specified and no known adapter could be found for the request.`)
        }

        if(!isFunction(adapter)) {
            throw new Error(`Adapter ${nameOrAdapter} is not a function.`)
        }

        return adapter;
    }
}