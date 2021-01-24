import Vue from 'vue'
import Component from 'vue-class-component'
import './components'

@Component({})
export default class Result extends Vue {
  filterData = [
    {
      title: '范围',
      options: ['全部', 'vip1', 'vip2', 'vip3'],
      selectedIndex: 0
    },
    {
      title: '格式',
      options: ['全部', 'doc', 'exle', 'aaa'],
      selectedIndex: 0
    },
    {
      title: '时间',
      options: ['全部', 'time1', 'time2', 'time3'],
      selectedIndex: 0
    }
  ];
  sortValue = '1';

  pn: number = 1;
  ps: number = 10;

  changePn() {
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
          <img class={this.$style.logo} src={'//wkstatic.bdimg.com/static/wkcore/widget/search/newHeader/images/logo-wk-202010_8469520.png'}/>
          <div class={this.$style.inputBlock}>
            <input ref={'input'} class={this.$style.input} maxlength={255}/>
            <span class={this.$style.btn} onClick={() => this.search()}>搜索一下</span>
          </div>

          <a-button type={'primary'} class={this.$style.loginBtn}>登陆</a-button>
        </a-layout-header>

        <a-layout-content>
          <div class={this.$style.content}>
            <div class={this.$style.filterBox}>
              {
                this.filterData.map((item, index) => {
                  return (
                    <div key={index} class={this.$style.filterLine}>
                      <span class={this.$style.title}>{item.title}:</span>
                      {
                        item.options.map((i, n) =>  <span key={n} class={[this.$style.option, item.selectedIndex === n ? this.$style.selected : '']}>{i}</span>)
                      }
                    </div>
                  )
                })
              }
            </div>

            <div class={this.$style.sortBox}>
              <span class={this.$style.title}>排序:</span>

              <input class={this.$style.radio} type={'radio'} name={'radio'} value={'1'} checked={this.sortValue === '1'}
                     onChange={e => this.sortValue = e.target.value}/>
              <span class={this.$style.text}>相关性</span>

              <input class={this.$style.radio} type={'radio'} name={'radio'} value={'2'} checked={this.sortValue === '2'}
                     onChange={e => this.sortValue = e.target.value}/>
              <span class={this.$style.text}>下载量</span>

              <input class={this.$style.radio} type={'radio'} name={'radio'} value={'3'} checked={this.sortValue === '3'}
                     onChange={e => this.sortValue = e.target.value}/>
              <span class={this.$style.text}>最新</span>

              <input class={this.$style.radio} type={'radio'} name={'radio'} value={'4'} checked={this.sortValue === '4'}
                     onChange={e => this.sortValue = e.target.value}/>
              <span class={this.$style.text}>关联性</span>
            </div>

            <div class={this.$style.resultList}></div>
          </div>
        </a-layout-content>
      </a-layout>
    )
  }
}
