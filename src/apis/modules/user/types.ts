export interface BaseResponse<T = any> {
    code: number;
    data?: T;
    message: string;
}

export interface LoginParams {
    phone: string;
    code: string;
}

export interface LoginData {
    token: string;
    role: number;
}

export interface UserInfoParams {
    userId: string;
}

export interface UserInfoData {
    userId: number;
    phone: string;
    name: string;
    email: string;
    role: number;
}

export interface RegisterParams {
    phone: string;
    code: string;
    email: string;
    role: number;
    registryCode?: string;
}

// 空数据响应（用于不需要返回数据的接口）
export interface EmptyData {}