import { userInstance } from '@/apis/instances/index';
import type {
    BaseResponse,
    LoginParams,
    LoginData,
    UserInfoParams,
    UserInfoData,
    RegisterParams,
    EmptyData
} from './types';

const { post, get } = userInstance;

const login = (params: LoginParams) => {
    return post<LoginData>('/login', params);
};

const register = (params: RegisterParams) => {
    return post<BaseResponse<EmptyData>>('/registry', params);
};

const getUserInfo = () => {
    return get<BaseResponse<UserInfoData>>('/me');
};

const sendCode = (phone: string) => {
    // 将 phone 作为 URL 的 Query 参数传递
    return post<BaseResponse<EmptyData>>(`/code?phone=${encodeURIComponent(phone)}`);
};

const logout = (token: string) => {
    return post<BaseResponse<EmptyData>>(`/logout?token=${encodeURIComponent(token)}`);
}

const getCourierById = (courierId: number) => {
    return get<BaseResponse<UserInfoData>>(`/courier/${courierId}`);
};

export { login, getUserInfo, sendCode, register, logout, getCourierById };