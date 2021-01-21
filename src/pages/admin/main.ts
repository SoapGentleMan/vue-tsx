import Vue from 'vue'
import store from '../../store/store'
import App from './index.tsx.vue'

const render = () => new Vue({
  el: '#app',
  store,
  render: h => {
    return h(App)
  }
});
