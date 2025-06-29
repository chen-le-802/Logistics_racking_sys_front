import { orderInstance } from '@/apis/instances/index';
import type { AddOrderParams, EmptyData,BaseResponse,OrdersData,GetOrdersParams,AddOrderResponse } from './types';

const { post, get } = orderInstance;

const addOrder = (params: AddOrderParams) => {
    return post<BaseResponse<AddOrderResponse>>('/order', params);
};
const getOrder = (params: GetOrdersParams) => {
  return get<BaseResponse<OrdersData>>('/order', params);
};
const getOrderById = (orderId: BigInt | string) => {
  return get<BaseResponse<OrdersData>>(`/order/${orderId}`);
};

export {addOrder,getOrder,getOrderById };