declare module '*.vue' {
  import Vue from 'vue'
  export default Vue
}

declare const isProd: boolean;
declare const isRelease: boolean;
declare const CLIENT: string;
declare const SERVER: string;
