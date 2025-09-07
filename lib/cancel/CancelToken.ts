import type {CancelToken as ICancelToken, CancelExecutor, CancelTokenSource, Canceler} from "@/types.ts";
import CancelError from "@/cancel/CancelError.ts";
import {resolveUserConfig} from "vitepress";

interface ResolvePromise {
    (reason?: CancelError): void;
}

export default class CancelToken implements ICancelToken {
    promise: Promise<CancelError>;
    reason?: CancelError;

    private _listeners: Array<ResolvePromise>;

    constructor(executor: CancelExecutor) {
        let ResolvePromise:ResolvePromise;
        this.promise = new Promise((resolve) => {
            ResolvePromise = resolve as ResolvePromise;
        });

        this.promise.then(cancel => {
            if(!this._listeners) return;

            for(const listener of this._listeners) {
                listener(cancel);
            }

            this._listeners = void 0;
        })

        executor((message, config, request) => {
            // 重复调用cancel
            if(this.reason) return;
            this.reason = new CancelError(message, config, request);
            ResolvePromise(this.reason);
        })
    }

    static source(): CancelTokenSource {
        let cancel: Canceler;

        const token = new CancelToken(c => {
            cancel = c;
        });

        return {
            cancel,
            token
        }
    }

    throwIfRequested() {
        if(this.reason) throw this.reason;
    }

    subscribe(listener: ResolvePromise) {
        if(this.reason) {
            listener(this.reason);
            return;
        }

        if(this._listeners) {
            this._listeners.push(listener);
        } else {
            this._listeners = [listener];
        }
    }

    unsubscribe(listener: ResolvePromise) {
        if(!this._listeners) {
            return;
        }
        const idx = this._listeners.indexOf(listener);
        if(idx !== -1) {
            this._listeners.splice(idx, 1);
        }
    }
}

// CancelToken => CancelToken.source().cancel()
// CancelToken(c => cancel = c)