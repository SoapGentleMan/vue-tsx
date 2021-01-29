import Vue from 'vue'
import './components'
import App from './index.tsx.vue'

const render = () => new Vue({
  el: '#app',
  render: h => {
    return h(App)
  }
});

render();
