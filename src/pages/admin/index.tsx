import Vue from 'vue'
import Component from 'vue-class-component'

const User = () => import(/* webpackChunkName: 'user' */'./user/index.tsx.vue');
const Param = () => import(/* webpackChunkName: 'param' */'./param/index.tsx.vue');
const Torrent = () => import(/* webpackChunkName: 'torrent' */'./torrent/index.tsx.vue');
const Hot = () => import(/* webpackChunkName: 'hot' */'./hot/index.tsx.vue');
const Word = () => import(/* webpackChunkName: 'word' */'./word/index.tsx.vue');

@Component({})
export default class Admin extends Vue {
  collapsed: boolean = false;
  contentType: string = 'user';

  getComponent(h) {
    switch (this.contentType) {
      case 'user': {
        return <User />
      }
      case 'param': {
        return <Param />
      }
      case 'torrent': {
        return <Torrent />
      }
      case 'hot': {
        return <Hot />
      }
      case 'word': {
        return <Word />
      }
    }
  }

  render(h) {
    return (
      <a-layout class={this.$style.layout}>
        <a-layout-sider collapsed={this.collapsed} onCollapsed={value => this.collapsed = value} trigger={null} collapsible>
          <div class={this.$style.logo}>文档搜索后台</div>
          <a-menu theme={'dark'} mode={'inline'}
                  defaultOpenKeys={['system', 'search']}
                  defaultSelectedKeys={['user']}
                  onSelect={({key}) => this.contentType = key}>
            <a-sub-menu key={'system'}>
              <span slot={'title'}><a-icon type={'user'} /><span>系统管理</span></span>
              <a-menu-item key={'user'}>
                用户列表
              </a-menu-item>
              <a-menu-item key={'param'}>
                参数设置
              </a-menu-item>
            </a-sub-menu>
            <a-sub-menu key={'search'}>
              <span slot={'title'}><a-icon type={'video-camera'} /><span>搜索管理</span></span>
              <a-menu-item key={'torrent'}>
                种子链接
              </a-menu-item>
              <a-menu-item key={'hot'}>
                今日热点
              </a-menu-item>
              <a-menu-item key={'word'}>
                关联词库
              </a-menu-item>
            </a-sub-menu>
          </a-menu>
        </a-layout-sider>
        <a-layout>
          <a-layout-header style={{background: '#fff', padding: 0}}>
            <a-icon class={this.$style.trigger}
                    type={this.collapsed ? 'menu-unfold' : 'menu-fold'}
                    onClick={() => (this.collapsed = !this.collapsed)}/>
          </a-layout-header>
          <a-layout-content style={{margin: '24px 16px', padding: '24px', background: '#fff'}}>
            <keep-alive>
              {
                this.getComponent(h)
              }
            </keep-alive>
          </a-layout-content>
        </a-layout>
      </a-layout>
    )
  }
}
