import Vue from 'vue'
import Component from 'vue-class-component'
import './components'

@Component({})
export default class Index extends Vue {
  data = [
    '法大师傅大师傅就啊圣诞快乐房价ask来得及1',
    '法大师傅大师傅就啊圣诞快乐房价ask来得及2',
    '法大师傅大师傅就啊圣诞快乐房价ask来得及3',
    '法大师傅大师傅就啊圣诞快乐房价ask来得及4',
    '法大师傅大师傅就啊圣诞快乐房价ask来得及5',
    '法大师傅大师傅就啊圣诞快乐房价ask来得及6',
    '法大师傅大师傅就啊圣诞快乐房价ask来得及7',
    '法大师傅大师傅就啊圣诞快乐房价ask来得及8',
    '法大师傅大师傅就啊圣诞快乐房价ask来得及9',
    '法大师傅大师傅就啊圣诞快乐房价ask来得及10',
    '法大师傅大师傅就啊圣诞快乐房价ask来得及11',
    '法大师傅大师傅就啊圣诞快乐房价ask来得及12',
    '法大师傅大师傅就啊圣诞快乐房价ask来得及12',
  ];
  pn: number = 1;
  ps: number = 6;

  changePn() {
    if (this.pn * this.ps >= this.data.length) {
      return this.pn = 1
    }
    this.pn += 1
  }

  search() {
    const value = (this.$refs.input as HTMLInputElement).value;
    location.href = 'http://localhost/r?s=' + value
  }

  render(h) {
    return (
      <a-layout class={this.$style.layout}>
        <a-layout-header>
          <a-button type={'primary'} class={this.$style.loginBtn}>登陆</a-button>
        </a-layout-header>

        <a-layout-content>
          <div class={this.$style.content}>
            <img class={this.$style.logo} src={'//www.baidu.com/img/PCtm_d9c8750bed0b3c7d089fa7d55720d6cf.png'}/>

            <div class={this.$style.inputBlock}>
              <input ref={'input'} class={this.$style.input} maxlength={255}/>
              <span class={this.$style.btn} onClick={() => this.search()}>搜索一下</span>
            </div>

            {!!this.data && <div class={this.$style.toggleBlock}>
              <span class={this.$style.text}>今日热点</span>
              <div class={this.$style.block} onClick={() => this.changePn()}>
                <a-icon type={'sync'} class={this.$style.icon}/>换一换
              </div>
            </div>}

            {!!this.data && <div class={this.$style.hotList}>
              {
                new Array(3).fill(1).map((item, index) => {
                  return new Array(2).fill(1).map((i, n) => {
                    const order = (this.pn - 1) * this.ps + index + n * 3 + 1;
                    return order > this.data.length ?
                      <div key={order} class={this.$style.hot}/>
                      :
                      <a key={order}  class={this.$style.hot}>
                        <span class={[this.$style.order, this.$style['order' + order]]}>{order}</span>
                        <span class={this.$style.text}>{this.data[order - 1]}</span>
                      </a>
                  })
                })
              }
            </div>}
          </div>
        </a-layout-content>

        <a-layout-footer>
          <span class={this.$style.layer}>3213123123123</span>
          <span class={this.$style.layer}>3213123123123</span>
          <span class={this.$style.layer}>3213123123123</span>
        </a-layout-footer>
      </a-layout>
    )
  }
}
