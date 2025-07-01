export interface BaseResponse<T = any> {
  code: number;
  data?: T;
  message?: string;
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
  fee: number;
  orderId: string;
}

export interface GetOrdersParams{
  pageNum: number;
  pageSize: number;
  senderPhone?: string;
  receiverPhone?: string;
  startDate?: string;
  endDate?: string;
  /** 订单状态 1-已下单 2-待揽件 3-运输中 4-派送中 5-已签收 */
  status?: number;
  /** 支付状态 0-未支付 1-已支付 */
  paymentStatus?: number;
  /** 关键字（订单号/收货人） */
  keyword?: string;
}
interface OrderRecord {
  orderId: string;
  userId: number;
  senderName: string;
  senderAddr: string;
  senderPhone: string;
  receiverName: string;
  receiverAddr: string;
  receiverPhone: string;
  weight: number;
  type:string;
  status: string;
  pickupCode: string;
  fee: number;
  paymentStatus: string;
  courierId: number;
  createdAt: string;
  updatedAt: string;
}

export interface OrdersData {
  records: OrderRecord[];
  total: string;
  size: string;
  current: string;
}

export interface addTrackParams{
  orderId: string,
  statusCode: number,
  location: string
}
export interface TrackRecord {
  id: string;
  orderId: string;
  status: string;
  location: string;
  courierId: number;
}

export interface TracksData {
  records: TrackRecord[];
}
// 空数据响应（用于不需要返回数据的接口）
export interface EmptyData {}

// 地址簿相关类型定义
export interface AddressBookRequest {
    /**
     * 详细地址
     */
    address: string;
    /**
     * 是否为默认地址，0表示false，1表示true
     */
    isDefault?: number;
    /**
     * 姓名
     */
    name: string;
    /**
     * 手机号
     */
    phone: string;
    [property: string]: any;
}

export interface UpdateAddressBookRequest extends AddressBookRequest {
    /**
     * 地址簿Id
     */
    addressId: number;
}

export interface AddressBookRecord {
    addressId: number;
    name: string;
    phone: string;
    address: string;
    isDefault: number;
    createdAt?: string;
    updatedAt?: string;
}

export type AddressBookData = AddressBookRecord[];