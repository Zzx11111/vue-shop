import Vue from 'vue'
import Router from 'vue-router'
import Login from '../components/Login'
import Home from '../components/Home'
import Welcome from '../components/Welcome'
import Users from '../components/users/Users'
import Rights from '../components/power/Rights'
import Roles from '../components/power/Roles'
import Categories from '../components/goods/categories'
import Params from '../components/goods/Params'
import List from '../components/goods/List'
import Add from '../components/goods/Add'
import Order from '../components/order/Order'
import Report from '../components/report/Report'
Vue.use(Router)

const router = new Router({
  routes: [
    {
      path: '/login',
      name: 'login',
      component: Login
    },
    {
      path: '/',
      redirect: '/login'
    },
    {
      path: '/home',
      name: 'home',
      component: Home,
      redirect: '/welcome',
      children: [
        {
          path: '/welcome',
          component: Welcome
        },
        {
          path: '/users',
          component: Users
        },
        {
          path: '/rights',
          component: Rights
        },
        {
          path: '/roles',
          component: Roles
        },
        {
          path:'/categories',
          component:Categories
        },
        {
          path:'/params',
          component:Params
        },
        {
          path:'/goods',
          component:List,
        },
        {
          path:'/goods/add',
          component:Add
        },
        {
          path:"/orders",
          component:Order
        },
        {
          path:'/reports',
          component:Report
        }
      ],
    }
  ],
  mode: 'history',
})

//路由导航守卫
router.beforeEach((to, from, next) => {
  //to：将要访问的路径 from：代表从哪个路径跳转来    next：是个函数，表示放行   next()放行  next('/login')强制跳转到这个页面
  if (to.path === '/login') return next();
  const tokenStr = window.sessionStorage.getItem('token');
  if (!tokenStr) return next('/login');
  next();
})



export default router