import type { AxiosRequestConfig, AxiosResponse} from 'axios';
import type { RequestInterceptor, ResponseInterceptor } from './types';
import { ElMessage } from 'element-plus';

//通用请求配置
const commonRequestConfig: AxiosRequestConfig = {
    baseURL:"/",
    timeout: 10000,
    //withCredentials: true,
};

//通用请求拦截器
const commonRequestInterceptors:RequestInterceptor[]=[
    {
        onFulfilled:(config: AxiosRequestConfig) => {
            const token = localStorage.getItem('token');
            if (token) {
                config.headers = {
                    ...config.headers,
                    Authorization: `Bearer ${token}`,
                };
            }
            return config;
        },
        onRejected: (error)=>{
            const errorMsg = error?.message || '请求失败';
            ElMessage({
                type: 'error',
                message: errorMsg,
            });
            return Promise.reject(error);
        }
    }
];

//通用响应拦截器
const commonResponseInterceptors:ResponseInterceptor[]=[
    {
        onFulfilled: (response: AxiosResponse) => {
            const {code,message,data} = response.data;
            if(code ==200){
                return data;
            }else{
                ElMessage({
                    type: 'error',
                    message: message || '请求失败',
                });
                return Promise.reject(new Error(message || '请求失败'));
            }
        },
        onRejected: (error) => {
            const { response } =error;
            let message = '';
            const status = response?.status;
            switch (status) {
                case 401:
                message = 'token 失效，请重新登录';
                break;
                case 403:
                message = '拒绝访问';
                break;
                case 404:
                message = '请求地址错误';
                break;
                case 500:
                message = '服务器故障';
                break;
                default:
                message = '网络连接故障';
            }
            ElMessage({
                type: 'error',
                message,
            });
            return Promise.reject(error);
        },
    },
];

export{
    commonRequestConfig,
    commonRequestInterceptors,
    commonResponseInterceptors,
}

