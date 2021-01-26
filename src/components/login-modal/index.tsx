import Vue from 'vue'
import Component from 'vue-class-component'
import {Prop} from 'vue-property-decorator'
import { message } from 'ant-design-vue'
import account from '../../lib/api/account'

@Component({})
export default class LoginModal extends Vue {
  @Prop({type: Boolean, default: true}) showClose: boolean;

  username: string = '';
  password: string = '';
  loading: boolean = false;

  login() {
    if (this.loading) {
      return
    }
    if (!this.username) {
      return message.error('请输入用户名', 1.5)
    }
    if (!this.password) {
      return message.error('请输入密码', 1.5)
    }
    this.loading = true;
    account.login(this.username, this.password)
      .then(data => {
        if (data.success === true) {
          localStorage.setItem('authorization', data.token)
          this.$emit('login', true);
          this.$emit('close')
        } else {
          throw new Error(data.message)
        }
      })
      .catch(e => {
        message.error(e.message || '登录失败', 1.5)
      })
      .finally(() => this.loading = false)
  }

  render(h) {
    return (
      <div class={this.$style.container}>
        {this.showClose && <a-icon class={this.$style.close} type={'close'} onClick={() => this.$emit('close')}/>}

        <div class={this.$style.header}>用户名密码登录</div>

        <a-input placeholder={'用户名'} class={this.$style.username} onChange={e => this.username = e.target.value}/>

        <a-input-password placeholder={'密码'} class={this.$style.password} onChange={e => this.password = e.target.value}/>

        <a-button class={this.$style.btn} type={'primary'} onClick={() => this.login()} loading={this.loading}>登录</a-button>

      </div>
    )
  }
}
