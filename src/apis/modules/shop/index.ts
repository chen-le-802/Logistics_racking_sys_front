import {shopInstance} from '@/apis/instances/index';

import type { 
  AddShopParams,
  AddShopRes,
  GetShopDetailParams,
  GetShopDetailRes,
} from './types';
const { post: shopPost, get: shopGet } = shopInstance;

const addShop = (params: AddShopParams) => {
  return shopPost<AddShopRes>('/addShop', params);
};

const getShopDetail = (params: GetShopDetailParams) => {
  return shopGet<GetShopDetailRes>('/shopDetail', { params });
};

export { addShop, getShopDetail };
