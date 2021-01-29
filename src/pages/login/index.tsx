import Vue from 'vue'
import Component from 'vue-class-component'
import LoginModal from '../../components/login-modal/index.tsx.vue'

@Component({})
export default class Admin extends Vue {
  goAdmin() {
    location.replace(`${CLIENT}/admin.html`)
  }

  render(h) {
    return (
      <div class={this.$style.container}>
        <LoginModal class={this.$style.login} showClose={false} onLogin={() => this.goAdmin()}/>
      </div>
    )
  }
}
