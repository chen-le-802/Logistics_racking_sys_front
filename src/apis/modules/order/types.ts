export interface BaseResponse<T = any> {
  code: number;
  data?: T;
  message: string;
}

export interface AddOrderParams {
  senderName: string;
  senderPhone: string;
  senderAddr: string;
  receiverName: string;
  receiverPhone: string;
  receiverAddr: string;
  weight: number;
  type: number;
}
export interface AddOrderResponse{
  fee: number
  orderId:BigInt
}

export interface GetOrdersParams{
  pageNumber?: number;
  pageSize?: number,
  searchKey?: string,
  type?: number,
  orderId?:BigInt
}
export interface OrdersData{

}
// 空数据响应（用于不需要返回数据的接口）
export interface EmptyData {}