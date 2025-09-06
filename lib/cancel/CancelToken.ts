import type {CancelToken as ICancelToken, CancelExecutor, CancelTokenSource, Canceler} from "@/types.ts";

interface ResolvePromise {
    (reason?: string): void;
}

export default class CancelToken implements ICancelToken {
    promise: Promise<string>;
    reason?: string;

    constructor(executor: CancelExecutor) {
        let ResolvePromise:ResolvePromise;
        this.promise = new Promise((resolve) => {
            ResolvePromise = resolve as ResolvePromise;
        });

        executor((message) => {
            // 重复调用cancel
            if(this.reason) return;
            this.reason = message;
            ResolvePromise(message);
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
        if(this.reason) throw new Error(this.reason);
    }
}

// CancelToken => CancelToken.source().cancel()
// CancelToken(c => cancel = c)