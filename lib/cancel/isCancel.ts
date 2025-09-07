import CancelError from "@/cancel/CancelError.ts";

export default function isCancel(val: unknown): val is CancelError {
    return val instanceof CancelError && val.__CANCEL__ === true;
}