import request from '@/utils/request'

export function getTrades() {
  return request({
    url: '/trades',
    method: 'get',
  })
}

export function setTrades(data) {
  return request({
    url: '/trades',
    method: 'put',
    data
  })
}

// export function getConfig() {
//   return request({
//     url: '/config',
//     method: 'get',
//   })
// }
