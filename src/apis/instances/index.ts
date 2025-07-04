import createInstance from './create';

// 基础的Axios实例，请求配置以及拦截器都是使用的通用的配置
const baseInstance = createInstance({}, [], []);

// 例子：Shop业务可能前缀都是/shop，可以在这里统一处理，
// 如果需要对请求和返回做特殊处理，也可以在这里加拦截器
const orderInstance = createInstance(
  {
    baseURL: 'http://localhost:8080',
  },
  [],
  []
);
const userInstance = createInstance(
  {
    baseURL: 'http://localhost:8080/user',
  },
  [],
  []
);
export { baseInstance, orderInstance,userInstance };
