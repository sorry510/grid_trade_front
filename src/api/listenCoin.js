import request from '@/utils/request';

export function getListenCoins(query = {}) {
  return request({
    url: '/listen/coin',
    method: 'get',
    params: query
  });
}

export function setListenCoin(id, data) {
  return request({
    url: `/listen/coin/${id}`,
    method: 'put',
    data
  });
}

export function addListenCoin(data) {
  return request({
    url: `/listen/coin`,
    method: 'post',
    data
  });
}

export function delListenCoin(id) {
  return request({
    url: `/listen/coin/${id}`,
    method: 'delete'
  });
}

export function enableListenCoin(flag = 1) {
  return request({
    url: `/listen/coin/enable/${flag}`,
    method: 'put'
  });
}

export function getKcLineChart(id, query = {}) {
  return request({
    url: `/listen/coin/kc-chart/${id}`,
    method: 'get',
    params: query
  });
}

