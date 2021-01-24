import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter);

const Index = () => import(/* webpackChunkName: 'index' */'./index/index.tsx.vue');
const Result = () => import(/* webpackChunkName: 'result' */'./result/index.tsx.vue');

export default new VueRouter({
  mode: 'history',
  routes: [
    {
      path: '/', component: Index
    },
    {
      path: '/r', component: Result
    }
  ]
})
