import Vue from 'vue'
import Component from 'vue-class-component'
import './components'
import LoginModal from '../../../components/login-modal/index.tsx.vue'

@Component({})
export default class Result extends Vue {
  filterData = [
    {
      title: '范围',
      options: ['全部', 'vip1', 'vip2', 'vip3']
    },
    {
      title: '格式',
      options: ['全部', 'doc', 'exle', 'aaa']
    },
    {
      title: '时间',
      options: ['全部', 'time1', 'time2', 'time3']
    }
  ];
  filterValue = [0, 0, 0]
  sortValue = '1';
  searchValue = '';

  resultData: any[] = [
    {
      title: '协议书模板',
      desc: '合同编号：协议书xxx，协议xxx，巴巴爸爸爸爸爸爸爸爸爸爸爸爸爸爸合同编号：协议书xxx，协议xxx，巴巴爸爸爸爸爸爸爸爸爸爸爸爸爸爸合同编号：协议书xxx，协议xxx，巴巴爸爸爸爸爸爸爸爸爸爸爸爸爸爸爸爸爸爸爸爸爸爸爸爸爸爸爸爸爸爸爸爸爸爸爸爸爸爸爸爸爸爸爸爸',
      time: '2020-10-10',
      downloadCount: '1111',
      downloadUrl: 'xxxx'
    },
    {
      title: '协议书模板',
      desc: '合同编号：协议书xxx，协议xxx，巴巴爸爸爸爸爸爸爸爸爸爸爸爸爸爸',
      time: '2020-10-10',
      downloadCount: '1111',
      downloadUrl: 'xxxx'
    },
    {
      title: '协议书模板',
      desc: '合同编号：协议书xxx，协议xxx，巴巴爸爸爸爸爸爸爸爸爸爸爸爸爸爸',
      time: '2020-10-10',
      downloadCount: '1111',
      downloadUrl: 'xxxx'
    },
    {
      title: '协议书模板',
      desc: '合同编号：协议书xxx，协议xxx，巴巴爸爸爸爸爸爸爸爸爸爸爸爸爸爸',
      time: '2020-10-10',
      downloadCount: '1111',
      downloadUrl: 'xxxx'
    }
  ]

  pn: number = 1;
  ps: number = 10;

  isLogin: boolean = true;
  showLoginModal: boolean = false;

  created() {
    this.searchValue = this.$route.query.s as string || '';
    this.sortValue = this.$route.query.o as string || '1';
    const arr = (this.$route.query.f  as string || '').split(',');
    this.filterValue = new Array(3).fill(0)
      .map((item, index) => parseInt(arr[index], 10) || item)
      .map(item => Math.min(item, 3));

    this.resultData = this.modifyDataWithRelatedWord(this.resultData)
  }

  modifyDataWithRelatedWord(data) {
    return data.map(item => {
      item.titleHtml = item.title.replaceAll('协议', '<em>协议</em>');
      item.descHtml = item.desc.replaceAll('协议', '<em>协议</em>');
      return item
    })
  }

  changePn() {
    this.pn += 1
  }

  search() {
    if (!this.isLogin) {
      this.showLoginModal = true
      return
    }
    location.href = 'http://localhost/r?s=' + this.searchValue
  }

  render(h) {
    return (
      <a-layout class={this.$style.layout}>
        <a-layout-header>
          <img class={this.$style.logo} src={'//wkstatic.bdimg.com/static/wkcore/widget/search/newHeader/images/logo-wk-202010_8469520.png'}/>
          <div class={this.$style.inputBlock}>
            <input class={this.$style.input} value={this.searchValue} onChange={e => this.searchValue = e.target.value} maxlength={255}/>
            <span class={this.$style.btn} onClick={() => this.search()}>搜索一下</span>
          </div>

          {this.showLoginModal && <div class={this.$style.loginBg}>
            <LoginModal class={this.$style.login} onLogin={() => this.isLogin = true} onClose={() => this.showLoginModal = false}/>
          </div>}
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
                        item.options.map((i, n) =>  <span key={n} class={[this.$style.option, this.filterValue[index] === n ? this.$style.selected : '']}>{i}</span>)
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

            <div class={this.$style.resultList}>
              {
                this.resultData.map((item, index) => {
                  return (
                    <div key={index} class={this.$style.result}>
                      <div class={this.$style.titleBlock}>
                        <img class={this.$style.icon} src={''}/>
                        <a class={this.$style.title} domPropsInnerHTML={item.titleHtml} href={item.link_url}/>
                      </div>
                      <div class={this.$style.desc} domPropsInnerHTML={item.descHtml}/>
                      <div class={this.$style.line}>
                        {item.time}
                        <i class={this.$style.divider}>|</i>
                        {item.downloadCount}
                        <a class={this.$style.btn} href={item.downloadUrl} target={'_blank'}>马上下载</a>
                      </div>
                    </div>
                  )
                })
              }
            </div>
          </div>
        </a-layout-content>
      </a-layout>
    )
  }
}
