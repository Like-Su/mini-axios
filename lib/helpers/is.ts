import { kindOf, getPrototypeOf } from "./index";

const objToString = Object.prototype.toString;

const typeOfTest = (type: string) => (thing: unknown) => typeof thing === type;

export const isFunction = typeOfTest('function');
export const isString = typeOfTest('string');
export const isNumber = typeOfTest('number');
export const isUndefined = typeOfTest('undefined');

export const isObject = (thing: unknown) => thing => thing !== null && typeof thing === 'object'

export const isArray = <T = any>(thing: unknown) => Array.isArray(thing);


export const isNil = (thing: unknown): boolean => thing == null;

export const isDate = (thing: unknown): thing is Date => objToString.call(thing) === '[object Date]';

export function isPlainObject(thing: unknown): boolean {
    if(kindOf(thing) !== 'object') {
        return false;
    }
    const prototype = getPrototypeOf(thing);

    return (
        // 不是空, 不是 Object.prototype, 不是 Object.create(null)
        (prototype === null || prototype === Object.prototype || Object.getPrototypeOf(prototype) === null) &&
            // 不是 Symbol.toStringTag
            !(Symbol.toStringTag in (thing as Object)) &&
            // 不是 Symbol.iterator
            !(Symbol.iterator in (thing as Object))
    )
}

export function isURLSearchParams(thing: unknown): thing is URLSearchParams {
    return typeof thing !== 'undefined' && thing instanceof URLSearchParams;
}