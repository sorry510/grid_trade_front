import request from '@/utils/request';

export function getOrders(query = {}) {
  return request({
    url: '/orders',
    method: 'get',
    params: query
  });
}
