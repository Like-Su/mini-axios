import type {AxiosStatic, AxiosRequestConfig, AxiosInstance, AxiosPromise} from "./types";
import Axios from './core/Axios';
import { extend } from "./helpers";
import defaults from './defaults';
import mergeConfig from "./core/mergeConfig";

// 工厂模式
function createInstance(config: AxiosRequestConfig): AxiosStatic {
    const context = new Axios(config);
    const instance = Axios.prototype.request.bind(context);
    extend(instance, Axios.prototype, config)
    extend(instance, context)

    return instance;
}

const axios = createInstance(defaults);

axios.create = function create(config) {
    return createInstance(mergeConfig(defaults, config))
}

axios.all = function all(promises) {
    return Promise.all(promises);
}

axios.spread = function spread(callback) {
    return function wrap(arr) {
        return callback.apply(null, arr);
    }
}

axios.Axios = Axios;

export default axios;