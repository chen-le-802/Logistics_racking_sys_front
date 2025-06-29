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
  orderId: string
}

export interface GetOrdersParams{
  /** 当前页码，必须 */
  pageNum: number;
  /** 每页条数，必须 */
  pageSize: number;
  /** 寄件人手机号 */
  senderPhone?: string;
  /** 收件人手机号 */
  receiverPhone?: string;
  /** 开始日期 */
  startDate?: string;
  /** 结束日期 */
  endDate?: string;
  /** 订单状态 1-已下单 2-待揽件 3-运输中 4-派送中 5-已签收 */
  status?: number;
  /** 支付状态 0-未支付 1-已支付 */
  paymentStatus?: number;
  /** 关键字（订单号/收货人） */
  keyword?: string;
}
export interface OrdersData{

}
// 空数据响应（用于不需要返回数据的接口）
export interface EmptyData {}