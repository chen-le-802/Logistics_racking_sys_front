export interface LoginParams{
    account: string;
    password: string;
}

export interface LoginResponse {
    token: string;
    userId: string;
}

export interface UserInfoParams {
    userId: string;
}

export interface UserInfoResponse {
    userId: string;
    username: string;
    email: string;
    phone: string;
    roles: string[];
}