import { orderInstance } from '@/apis/instances/index';
import type { AddOrderParams, EmptyData,BaseResponse,OrdersData,GetOrdersParams,AddOrderResponse } from './types';

const { post, get,put } = orderInstance;

const addOrder = (params: AddOrderParams) => {
    return post<BaseResponse<AddOrderResponse>>('/order', params);
};
const getOrder = (params: GetOrdersParams) => {
  return get<BaseResponse<OrdersData>>('/order', params);
};
const getOrderById = (orderId: BigInt | string) => {
  return get<BaseResponse<OrdersData>>(`/order/${orderId}`);
};
interface ChangePayStatusParams {
  orderId: string | number | BigInt;
  paystatus: number;
}

const changePayStatus = (
  orderId: ChangePayStatusParams['orderId'],
  paystatus: ChangePayStatusParams['paystatus']
) => {
  return put<BaseResponse<EmptyData>>(`/order/${orderId}`, { paystatus });
};

export {addOrder,getOrder,getOrderById,changePayStatus};