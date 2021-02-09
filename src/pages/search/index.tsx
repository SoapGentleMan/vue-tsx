import Vue from 'vue'
import Component from 'vue-class-component'
import './components'
import LoginModal from '../../components/login-modal/index.tsx.vue'
import search from '../../lib/api/search'
import account from '../../lib/api/account'

@Component({})
export default class Result extends Vue {
  filterData = [];
  sortData = [];
  filterValue = []
  sortValue = '';
  searchValue = '';

  resultList = [];
  relWords = [];

  confLoading: boolean = false;

  pn: number = 1;
  ps: number = 10;
  totalPage: number = 0;

  isLogin: boolean = false;
  username: string = '';
  showLoginModal: boolean = false;

  created() {
    const query = this.getUrlQuery(location.href) as {[key: string]: string};
    this.searchValue = query.s as string || '';
    this.sortValue = query.o as string || '';
    this.filterValue = (query.f  as string || ',,').split(',');
    this.pn = +query.pn || 1;

    this.isLogin = !!localStorage.getItem('authorization');
    if (this.isLogin) {
      this.username = localStorage.getItem('username') || '';
      this.getSearchConf().then(() => this.getSearchResult())
    } else {
      this.showLoginModal = true
    }
  }

  getUrlQuery(url) {
    if (!url) {
      return;
    }
    const query = {};
    // 把 url 分隔成3段：path, query, hash; \x12 = \#
    const _url = url.split(/\?|\x12/);

    // 解析 query
    const args = (_url[1] || '').split('&');
    args.forEach(n => {
      if (!n[0]) {
        return;
      }
      const na = n.split('=');
      query[na[0]] = decodeURIComponent(na[1] || '');
    });
    return query
  }

  modifyDataWithRelatedWord(data, words) {
    try {
      const regexp = new RegExp(words.join('|'), 'g')
      return data.map(item => {
        item.file_name_html = item.file_name.replaceAll(regexp, str => `<em>${str}</em>`);
        item.file_abstract_html = item.file_abstract.replaceAll(regexp, str => `<em>${str}</em>`);
        return item
      })
    } catch (e) {
      return data
    }

  }

  getSearchConf() {
    let cache;
    const lsData = localStorage.getItem('searchConf')
    if (!!lsData) {
      try {
        const json = JSON.parse(lsData);
        (new Date().getTime() - json.timestamp < 1000 * 3600 * 6) && (cache = json.data)
      } catch (e) {
        // do nothing
      }
    }
    this.confLoading = true;
    return Promise.resolve(cache || search.getSearchConf())
      .then(data => {
        if (data.success === true) {
          const countryArr = [{key: '全部', value: ''}];
          const typeArr = [{key: '全部', value: ''}];
          const timeArr = [{key: '全部', value: ''}];
          if (data.country_name && data.country_name.length > 0 && data.country_code && data.country_code.length > 0) {
            countryArr.push(...data.country_name.map((item, index) => {
              return {
                key: item,
                value: data.country_code[index] || ''
              }
            }))
          }
          if (data.type_name && data.type_name.length > 0 && data.type_code && data.type_code.length > 0) {
            typeArr.push(...data.type_name.map((item, index) => {
              return {
                key: item,
                value: data.type_code[index] || '',
                icon: data.type_icon[index] || ''
              }
            }))
          }
          if (data.time_name && data.time_name.length > 0 && data.time_code && data.time_code.length > 0) {
            timeArr.push(...data.time_name.map((item, index) => {
              return {
                key: item,
                value: data.time_code[index] || ''
              }
            }))
          }
          this.filterData = [
            {title: '国家', values: countryArr},
            {title: '格式', values: typeArr},
            {title: '时间', values: timeArr}
          ];
          this.filterData.forEach((item, index) => {
            const filter = this.filterValue[index];
            this.$set(this.filterValue, index, item.values.findIndex(i => i.value === filter) > -1 ? filter : '')
          })
          if (data.sort_name && data.sort_name.length > 0 && data.sort_type && data.sort_type.length > 0) {
            this.sortData = data.sort_name.map((item, index) => {
              return {
                key: item,
                value: data.sort_type[index] || ''
              }
            });
            this.sortValue = this.sortData.findIndex(i => i.value === this.sortValue) > -1 ? this.sortValue : this.sortData[0].value
          }
          localStorage.setItem('searchConf', JSON.stringify({data, timestamp: new Date().getTime()}))
        } else {
          throw new Error(data.message)
        }
      })
      .catch(e => {
        if (e.message === '未登录') {
          localStorage.removeItem('authorization');
          this.isLogin = false;
          this.showLoginModal = true;
          throw new Error(e.message)
        }
      })
      .finally(() => this.confLoading = false)
  }

  getSearchResult() {
    return search.getSearchResult({
      keyword: this.searchValue,
      country_code: this.filterValue[0],
      type_code: this.filterValue[1],
      time_code: this.filterValue[2],
      sort_type: this.sortValue,
      page: this.pn,
      size: this.ps,
    }).then(data => {
      if (data.success === true && data.docs && data.docs.length > 0) {
        this.resultList = this.modifyDataWithRelatedWord(data.docs, data.rel_words);
        this.relWords = data.rel_words;
        this.totalPage = data.pages
      } else {
        throw new Error(data.message)
      }
    }).catch(e => {
      if (e.message === '未登录') {
        localStorage.removeItem('authorization');
        this.isLogin = false;
        this.showLoginModal = true
      }
    })
  }

  getSearchUrl() {
    return `${CLIENT}/search.html?s=${this.searchValue}${
      !!this.sortValue ? '&o=' + this.sortValue : ''
    }${
      this.filterValue.join(',') !== ',,' ? '&f=' + this.filterValue.join(',') : ''
    }${
      this.pn !== 1 ? '&pn=' + this.pn : ''
    }`
  }

  changePage(pn) {
    this.pn = pn;
    location.href = this.getSearchUrl()
  }

  search() {
    if (!this.searchValue || this.confLoading) {
      return
    }
    if (!this.isLogin) {
      this.showLoginModal = true
      return
    }
    const url = `${CLIENT}/search.html?s=${this.searchValue}`
    if (url === location.href) {
      return location.replace(url)
    }
    location.href = url
  }

  toggleLogin() {
    if (this.isLogin) {
      account.logout();
      localStorage.removeItem('authorization');
      this.isLogin = false
    } else {
      this.showLoginModal = true
    }
  }

  doAfterLogin() {
    this.isLogin = true;
    this.username = localStorage.getItem('username') || '';
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

          {this.isLogin && <div class={this.$style.userBlock}>
            <span class={this.$style.username}>{this.username}</span>
            <a-button type={'primary'} class={this.$style.loginBtn} onClick={() => this.toggleLogin()}>登出</a-button>
          </div>}

          {this.showLoginModal && <div class={this.$style.loginBg}>
            <LoginModal class={this.$style.login} onLogin={() => this.doAfterLogin()} onClose={() => this.showLoginModal = false}/>
          </div>}
        </a-layout-header>

        <a-layout-content>
          <div class={this.$style.content}>
            {this.filterData.length > 0 && <div class={this.$style.filterBox}>
              {
                this.filterData.map((item, index) => {
                  return (
                    <div key={index} class={this.$style.filterLine}>
                      <span class={this.$style.title}>{item.title}:</span>
                      {
                        item.values.map((i, n) => (
                          <span key={n} class={[this.$style.option, this.filterValue[index] === i.value ? this.$style.selected : '']}
                                onClick={() => {
                                  if (this.filterValue[index] !== i.value) {
                                    this.$set(this.filterValue, index, i.value);
                                    this.changePage(1)
                                  }
                                }}>
                            {i.key}
                          </span>
                        ))
                      }
                    </div>
                  )
                })
              }
            </div>}

            {this.sortData.length > 0 && <div class={this.$style.sortBox}>
              <span class={this.$style.title}>排序:</span>

              {
                this.sortData.map(item => [
                  <input class={this.$style.radio} type={'radio'} name={'sort'} value={item.value} checked={this.sortValue === item.value}
                         onChange={e => {
                           if (this.sortValue !== e.target.value) {
                             this.sortValue = e.target.value;
                             this.changePage(1)
                           }
                         }}/>,
                  <span class={this.$style.text}>{item.key}</span>
                ])
              }
            </div>}

            <div class={this.$style.resultList}>
              {
                this.resultList.map((item, index) => {
                  return (
                    <div key={index} class={this.$style.result}>
                      <div class={this.$style.titleBlock}>
                        <img class={this.$style.icon} src={item.type_icon}/>
                        <a class={this.$style.title} domPropsInnerHTML={item.file_name_html} href={item.link_url}/>
                      </div>
                      <div class={this.$style.desc} domPropsInnerHTML={item.file_abstract_html}/>
                      <div class={this.$style.line}>
                        {item.file_time}
                        <i class={this.$style.divider}>|</i>
                        {item.download_times + '次下载'}
                        {item.type_code !== 'html' && <a class={this.$style.btn} href={item.download_url} target={'_blank'}>马上下载</a>}
                      </div>
                    </div>
                  )
                })
              }
            </div>

            <div class={this.$style.relWordBlock}>
              <p class={this.$style.title}>相关搜索</p>
              <div class={this.$style.wordList}>
                {
                  this.relWords.map((item, index) => {
                    return (
                      <span key={index} class={this.$style.word}>
                        <a href={`${CLIENT}/search.html?s=${item}`} target={'_blank'}>{item}</a>
                      </span>
                    )
                  })
                }
              </div>
            </div>

            {this.totalPage > 0 && <a-pagination current={this.pn} pageSize={this.ps} total={this.totalPage * this.ps}
                                                 onChange={page => this.changePage(page)}/>}
          </div>
        </a-layout-content>
      </a-layout>
    )
  }
}
