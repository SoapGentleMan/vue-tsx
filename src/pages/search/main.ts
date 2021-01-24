import Vue from 'vue'
import App from './index.tsx.vue'
import router from './router'

const render = () => new Vue({
  el: '#app',
  router,
  render: h => {
    return h(App)
  }
});

render();
