import Vue from 'vue'
import Component from 'vue-class-component'
import LoginModal from '../../components/login-modal/index.tsx.vue'
import account from '../../lib/api/account'
import search from '../../lib/api/search'

@Component({})
export default class Index extends Vue {
  hotWords: string[][] = [];
  pn: number = 1;
  ps: number = 6;
  loading: boolean = false;
  totalPn: number = 0;
  showPn: number = 0;

  isLogin: boolean = false;
  showLoginModal: boolean = false;

  created() {
    this.isLogin = !!localStorage.getItem('authorization');
    if (this.isLogin) {
      this.getHotWord()
    }
  }

  getHotWord() {
    if (this.loading) {
      return
    }
    this.loading = true;
    return search.getHotWords({pn: this.pn, ps: this.ps})
      .then(data => {
        if (data.success === true && !!data.words && data.words.length > 0) {
          this.$set(this.hotWords, this.pn - 1, data.words);
          this.totalPn = data.pages;
          this.pn = this.pn + 1;
          this.showPn = this.showPn + 1
        } else {
          throw new Error(data.message)
        }
      })
      .catch(e => {
        if (e.message === '未登录') {
          localStorage.removeItem('authorization');
          this.isLogin = false;
          this.showPn = 0
        } else {
          this.showPn = 1
        }
      })
      .finally(() => this.loading = false)

  }

  toggleHotWords() {
    if (this.showPn === this.totalPn && this.totalPn !== 0) {
      return this.showPn = 1
    }
    if (!!this.hotWords[this.showPn]) {
      return this.showPn = this.showPn + 1
    }
    this.getHotWord()
  }

  search() {
    if (!this.isLogin) {
      return this.toggleLogin()
    }
    const value = (this.$refs.input as HTMLInputElement).value;
    if (!value) {
      return
    }
    location.href = `${CLIENT}/search.html?s=${value}`
  }

  toggleLogin() {
    if (this.isLogin) {
      account.logout();
      localStorage.removeItem('authorization');
      this.isLogin = false;
      this.showPn = 0
    } else {
      this.showLoginModal = true
    }
  }

  doAfterLogin() {
    this.isLogin = true;
    this.toggleHotWords()
  }

  render(h) {
    return (
      <a-layout class={this.$style.layout}>
        <a-layout-header>
          <a-button type={'primary'} class={this.$style.loginBtn} onClick={() => this.toggleLogin()}>{this.isLogin ? '登出' : '登录'}</a-button>

          {this.showLoginModal && <div class={this.$style.loginBg}>
            <LoginModal class={this.$style.login} onLogin={() => this.doAfterLogin()} onClose={() => this.showLoginModal = false}/>
          </div>}
        </a-layout-header>

        <a-layout-content>
          <div class={this.$style.content}>
            <img class={this.$style.logo} src={'//www.baidu.com/img/PCtm_d9c8750bed0b3c7d089fa7d55720d6cf.png'}/>

            <div class={this.$style.inputBlock}>
              <input ref={'input'} class={this.$style.input} maxlength={255}/>
              <span class={this.$style.btn} onClick={() => this.search()}>搜索一下</span>
            </div>

            {this.isLogin && this.hotWords.length > 0 && <div class={this.$style.toggleBlock}>
              <span class={this.$style.text}>今日热点</span>
              {this.totalPn > 1 && <div class={this.$style.block} onClick={() => this.toggleHotWords()}>
                <a-icon type={'sync'} class={this.$style.icon}/>换一换
              </div>}
            </div>}

            {this.isLogin && this.hotWords.length > 0 && <div class={this.$style.hotList}>
              {
                new Array(3).fill(1).map((item, index) => {
                  return new Array(2).fill(1).map((i, n) => {
                    const cIndex = index + n * 3;
                    const order = (this.showPn - 1) * this.ps + cIndex + 1;
                    return cIndex > this.hotWords[this.showPn - 1].length - 1 ?
                      <div key={order} class={this.$style.hot}/>
                      :
                      <a key={order}  class={this.$style.hot}
                         href={`${CLIENT}/search.html?s=${this.hotWords[this.showPn - 1][cIndex]}`} target={'_blank'}>
                        <span class={[this.$style.order, this.$style['order' + order]]}>{order}</span>
                        <span class={this.$style.text}>{this.hotWords[this.showPn - 1][cIndex]}</span>
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