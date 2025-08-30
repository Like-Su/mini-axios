import {isFunction, isString, isNumber, isUndefined, isObject, isArray, isPlainObject} from "./is";
import {an} from "vitest/dist/reporters-yx5ZTtEV";

export function toJSONObject<T = object>(obj: T) {
    const stack = new Array(10);

    const visit = (source: T, i: number) => {
        if(isObject(source)) {
            if(stack.includes(source)) return {};

            if(!('toJSON' in source)) {
                stack[i] = source;
                const target:Record<string | number, any> = isArray(source) ? [] : {};
                for(let key in source) {
                    const value = (source as Record<string, any>)[key];

                    const reducedValue = visit(value, i + 1);
                    !isUndefined(reducedValue) && (target[key] = reducedValue);
                }
                stack[i] = void 0;
                return target;
            }
        }
        return source;
    }
    return visit(obj, 0);
}

export const kindOf = (cache => (thing: unknown) => {
    const str = toString.call(thing)
    return cache[str] || (cache[str] = str.slice(8, -1).toLowerCase())
})(Object.create(null))

const { getPrototypeOf } = Object;

export function deepMerge(...args: any[]) {
    const result = Object.create(null);

    const assignValue = (val: unknown, key: string) => {
        if (isPlainObject(result[key]) && isPlainObject(val)) {
            result[key] = deepMerge(result[key], val);
        } else if (isPlainObject(val)) {
            result[key] = deepMerge({}, val);
        } else {
            result[key] = val;
        }
    }

    for(let i = 0; i < args.length; i++) {
        const obj = args[i];
        for(let key in obj) {
            assignValue(obj[key], key);
        }
    }

    return result;
}

function _bind(fn: Function, thisArg: unknown) {
    return function wrap() {
        return fn.apply(thisArg, arguments);
    }
}

export function extend<T, U>(to: T, from: U, thisArg?: unknown): T & U {
    for(const key in from) {
        if(thisArg && isFunction(from[key])) {
            (to as T & U)[key] = _bind(from[key] as Function, thisArg) as any;
        } else {
            (to as T & U)[key] = from[key] as any;
        }
    }

    return to as T & U;
}

export {
    getPrototypeOf
}