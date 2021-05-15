import Vue from 'vue'
import Component from 'vue-class-component'
import {Prop} from 'vue-property-decorator'
import { message } from 'ant-design-vue'
import account from '../../lib/api/account'

@Component({})
export default class ResetPswdModal extends Vue {
  @Prop({type: Boolean, default: true}) showClose: boolean;

  password: string = '';
  passwordNew: string = '';
  passwordNewConfirm: string = '';
  loading: boolean = false;

  login() {
    if (this.loading) {
      return
    }
    if (!this.password) {
      return message.error('请输入原密码', 1.5)
    }
    if (!this.passwordNew) {
      return message.error('请输入新密码', 1.5)
    }
    if (!this.passwordNewConfirm) {
      return message.error('请确认新密码', 1.5)
    }
    if (this.password === this.passwordNew) {
      return message.error('新旧密码不能相同', 1.5)
    }
    if (this.passwordNew !== this.passwordNewConfirm) {
      return message.error('新密码与确认密码不一致', 1.5)
    }
    this.loading = true;
    account.resetUserPswd(this.password, this.passwordNew)
      .then(data => {
        if (data.success === true) {
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

        <div class={this.$style.header}>修改密码</div>

        <a-input-password placeholder={'原密码'} class={[this.$style.password, this.$style.first]} onChange={e => this.password = e.target.value}/>

        <a-input-password placeholder={'新密码'} class={this.$style.password} onChange={e => this.passwordNew = e.target.value}/>

        <a-input-password placeholder={'确认密码'} class={this.$style.password} onChange={e => this.passwordNewConfirm = e.target.value}/>

        <a-button class={this.$style.btn} type={'primary'} onClick={() => this.login()} loading={this.loading}>提交</a-button>

      </div>
    )
  }
}
