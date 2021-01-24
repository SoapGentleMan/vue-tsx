import Vue from 'vue'
import App from './index.tsx.vue'
import './components'

const render = () => new Vue({
  el: '#app',
  render: h => {
    return h(App)
  }
});

render();
