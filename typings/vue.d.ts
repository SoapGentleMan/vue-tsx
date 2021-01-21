import Vue from 'vue'
import {ComponentOptions} from 'vue'

declare module 'vue/types/vue' {
  interface Vue {
    $style: {
      [key: string]: string
    }
  }
}

declare module 'vue/types/options' {
  interface ComponentOptions {
    [propName: string]: any
  }
}
