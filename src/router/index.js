import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);

/* Layout */
import Layout from '@/layout';

/**
 * Note: sub-menu only appear when route children.length >= 1
 * Detail see: https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 *
 * hidden: true                   if set true, item will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu
 *                                if not set alwaysShow, when item has more than one children route,
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noRedirect           if set noRedirect will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    roles: ['admin','editor']    control the page roles (you can set multiple roles)
    title: 'title'               the name show in sidebar and breadcrumb (recommend set)
    icon: 'svg-name'/'el-icon-x' the icon show in the sidebar
    breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
  }
 */

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */
export const constantRoutes = [
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },

  {
    path: '/404',
    component: () => import('@/views/404'),
    hidden: true
  },

  {
    path: '/',
    component: Layout,
    redirect: '/index',
    children: [
      {
        path: 'index',
        name: 'Index',
        component: () => import('@/views/dashboard/index'),
        meta: { title: '首页', icon: 'dashboard' }
      }
    ]
  },

  {
    path: '/symbols',
    component: Layout,
    redirect: '/symbols/symbols',
    children: [
      {
        path: 'symbols',
        name: 'Symbols',
        component: () => import('@/views/trade/index'),
        meta: { title: '合约交易', icon: 'table' }
      }
    ]
  },
  {
    path: '/order',
    component: Layout,
    redirect: '/order/list',
    children: [
      {
        path: 'list',
        name: 'OrderList',
        component: () => import('@/views/order/index'),
        meta: { title: '合约订单', icon: 'table' }
      }
    ]
  },
  {
    path: '/rush',
    component: Layout,
    redirect: '/rush/new-coin',
    children: [
      {
        path: 'new-coin',
        name: 'RushNewCoin',
        component: () => import('@/views/trade/NewCoin'),
        meta: { title: '新币抢购', icon: 'table' }
      }
    ]
  },
  {
    path: '/notice',
    component: Layout,
    redirect: '/notice/coin',
    meta: { title: '币种通知', icon: 'table' },
    children: [
      {
        path: 'spot',
        name: 'noticeSpot',
        component: () => import('@/views/notice/spot'),
        meta: { title: '现货通知' }
      },
      {
        path: 'feature',
        name: 'noticeFeature',
        component: () => import('@/views/notice/feature'),
        meta: { title: '合约通知' }
      }
    ]
  },
  {
    path: '/listen',
    component: Layout,
    redirect: '/listen/coin',
    meta: { title: '行情监听', icon: 'table' },
    children: [
      {
        path: 'spot',
        name: 'listenSpot',
        component: () => import('@/views/listen/spot'),
        meta: { title: '现货监听' }
      },
      {
        path: 'feature',
        name: 'listenFeature',
        component: () => import('@/views/listen/feature'),
        meta: { title: '合约监听' }
      }
    ]
  },
  {
    path: '/funding-rate',
    component: Layout,
    redirect: '/funding-rate',
    children: [
      {
        path: 'funding-rate',
        name: 'fundingRates',
        component: () => import('@/views/listen/fundingRate'),
        meta: { title: '资金费率', icon: 'table' }
      }
    ]
  },
  {
    path: '/trade',
    component: Layout,
    redirect: '/trade/code',
    children: [
      {
        path: 'code',
        name: 'TradeCode',
        component: () => import('@/views/trade/TradeCode'),
        meta: { title: '系统配置', icon: 'form' }
      }
    ]
  },
  // {
  //   path: 'external-link',
  //   component: Layout,
  //   meta: { title: '外部网址', icon: 'table' },
  //   children: [
  //     {
  //       path: 'http://15.152.43.227:8888/0a546a79',
  //       meta: { title: '宝塔面板1', icon: 'link' }
  //     },
  //     {
  //       path: 'http://15.152.43.227:8888/0a546a79',
  //       meta: { title: '宝塔面板2', icon: 'link' }
  //     },
  //   ]
  // },

  // 404 page must be placed at the end !!!
  { path: '*', redirect: '/404', hidden: true }
];

const createRouter = () =>
  new Router({
    // mode: 'history', // require service support
    scrollBehavior: () => ({ y: 0 }),
    routes: constantRoutes
  });

const router = createRouter();

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter();
  router.matcher = newRouter.matcher; // reset router
}

export default router;
