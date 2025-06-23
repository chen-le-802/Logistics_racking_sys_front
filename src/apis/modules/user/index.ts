import {baseInstance} from '@/apis/instances/index';
import type {LoginParams, LoginResponse, UserInfoParams,UserInfoResponse} from './types';

const {post:basePost,get:baseGet} = baseInstance;

const login = (params: LoginParams)=>{
    return basePost<LoginResponse>('/login', params);
};

const getUserInfo = (params: UserInfoParams)=>{
    return baseGet<UserInfoResponse>('/user/info', params);
};

export {login, getUserInfo};
