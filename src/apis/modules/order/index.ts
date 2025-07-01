import { orderInstance } from '@/apis/instances/index';
import type { AddOrderParams, EmptyData,BaseResponse,OrdersData,GetOrdersParams,AddOrderResponse,addTrackParams,TracksData,AddressBookRequest,UpdateAddressBookRequest,AddressBookData,AddressBookRecord } from './types';

const { post, get,put, _delete } = orderInstance;

const addOrder = (params: AddOrderParams) => {
    return post<AddOrderResponse>('/order', params);
};
const getOrder = (params: GetOrdersParams) => {
  return get<OrdersData>('/order', params);
};
const getOrderById = (orderId: string) => {
  return get<OrdersData>(`/order/${orderId}`);
};
const changePayStatus = (
  orderId: string,
  payStatus: number
) => {
  return put<BaseResponse>(`/order/${orderId}/pay-status`, { payStatus });
};

const getUnassignedOrders = (params: GetOrdersParams) => {
  return get<OrdersData>('/order/unassigned', params);
}

const acceptOrder = (orderId:string) => {
  return put<BaseResponse>(`/order/${orderId}/pickup`)
}

const getCourierOrders = (params:GetOrdersParams) => {
  return get<OrdersData>('/order/courier',params)
}

const addTrack = (params: addTrackParams) => {
  return post<BaseResponse>('/logistics-track',params)
}
const getTracks = (orderId: string) => {
  return get<TracksData>(`/logistics-track/${orderId}`)
}
const getCourierPerformance = (month: string) => {
  return get<BaseResponse>('/courier-performance/current', { month });
}

const deleteOrder = (orderId: string) => {
  return _delete<BaseResponse>(`/order/${orderId}`);
}

// 地址簿相关接口
const getAddressBook = () => {
  return get<AddressBookData>('/addressBook');
}

const getDefaultAddress = () => {
  return get<BaseResponse<AddressBookRecord>>('/addressBook/default');
}

const addAddressBook = (params: AddressBookRequest) => {
  return post<BaseResponse>('/addressBook', params);
}

const updateAddressBook = (params: UpdateAddressBookRequest) => {
  return put<BaseResponse>('/addressBook', params);
}

const deleteAddressBook = (addressId: number) => {
  return _delete<BaseResponse>('/addressBook', { addressId });
}

export {addOrder,getOrder,getOrderById,changePayStatus,getUnassignedOrders,acceptOrder,getCourierOrders,addTrack,getTracks,getCourierPerformance,deleteOrder,getAddressBook,getDefaultAddress,addAddressBook,updateAddressBook,deleteAddressBook};