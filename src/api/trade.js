import request from '@/utils/request';

export function getTrades() {
  return request({
    url: '/trades',
    method: 'get'
  });
}

export function setTrades(data) {
  return request({
    url: '/trades',
    method: 'put',
    data
  });
}

export function getTickets() {
  return request({
    url: '/symbol/price',
    method: 'get'
  });
}

// export function getConfig() {
//   return request({
//     url: '/config',
//     method: 'get',
//   })
// }
