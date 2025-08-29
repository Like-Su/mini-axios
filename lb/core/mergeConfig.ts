
// https://github.com/axios/axios/blob/a9f47afbf3224d2ca987dbd8188789c7ea853c5d/lib/core/mergeConfig.js

// 通过不同配置项 使用不同策略来进行合并配置

import {isNil, isPlainObject} from "../helpers/is";
import {deepMerge} from "../helpers";
import {AxiosRequestConfig} from "../types";

interface StratFn {
    (val1: unknown, val2: unknown): any;
}

// 默认
const defaultStrat:  StratFn = (val1, val2) => {
    return val2 ?? val1;
}

const fromVal2Strat: StratFn = (_val1, val2) => {
    if(!isNil(val2)) {
        return val2;
    }
}

const deepMergeStrat: StratFn = (val1, val2) => {
    // 是一个朴素对象
    if(isPlainObject(val2)) {
        return deepMerge(val1, val2);
    }

    if(!isNil(val2)) {
        return val2;
    }

    if(isPlainObject(val1)) {
        return deepMerge(val1)
    }

    if(!isNil(val1)) {
        return val1;
    }
}

const stratMap = new Map<string, StratFn>([
    ['url', fromVal2Strat],
    ['params', fromVal2Strat],
    ['data', fromVal2Strat],
    ['headers', deepMergeStrat],
    ['auth', deepMergeStrat],
])

export default function mergeConfig(
    config1: AxiosRequestConfig,
    config2?: AxiosRequestConfig
): AxiosRequestConfig {
    if(!config2) {
        config2 = {};
    }

    const result = Object.create(null);

    const mergeField = (key:string):void => {
        const strat = stratMap.get(key) ?? defaultStrat;
        result[key] = strat(config1[key], config2[key]);
    }

    for(let key in config2) {
        mergeField(key);
    }

    for(let key in config1) {
        if (!config2[key]) {
            mergeField(key)
        }
    }

    return result;
}