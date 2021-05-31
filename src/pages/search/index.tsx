import Vue from 'vue'
import Component from 'vue-class-component'
import './components'
import LoginModal from '../../components/login-modal/index.tsx.vue'
import ResetPswdModal from '../../components/reset-pswd-modal/index.tsx.vue'
import search from '../../lib/api/search'
import account from '../../lib/api/account'
import { message } from 'ant-design-vue'

@Component({})
export default class Result extends Vue {
  filterData = [];
  sortData = [];
  filterValue = []
  sortValue = '';
  searchValue = '';

  resultLoading: boolean = false;
  resultList = [];
  relWords = [];

  confLoading: boolean = false;

  pn: number = 1;
  ps: number = 10;
  totalPage: number = 0;

  isLogin: boolean = false;
  username: string = '';
  userRole: string = '';
  showLoginModal: boolean = false;
  showResetPswdModal: boolean = false;

  showEdit: boolean = false;
  editLoading: boolean = false;
  editObj = {
    id: '',
    file_name: '',
  };

  created() {
    const query = this.getUrlQuery(location.href) as {[key: string]: string};
    this.searchValue = query.s as string || '';
    this.sortValue = query.o as string || '';
    this.filterValue = (query.f  as string || ',,,,').split(',');
    this.pn = +query.pn || 1;

    this.isLogin = !!localStorage.getItem('authorization');
    if (this.isLogin) {
      this.username = localStorage.getItem('username') || '';
      this.getUserStatus();
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

  modifyDataWithHighLightWord(data, words) {
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
    this.confLoading = true;
    return search.getSearchConf()
      .then(data => {
        if (data.success === true) {
          const countryArr = [{key: '全部', value: ''}];
          const typeArr = [{key: '全部', value: ''}];
          const timeArr = [{key: '全部', value: ''}];
          const directionArr = [{key: '全部', value: ''}];
          const optionArr = [
            {key: '默认', value: 0},
            {key: '完全查找', value: 1},
            {key: '分词查找', value: 2}
          ]
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
          if (data.search_direction && data.search_direction.length > 0) {
            directionArr.push(...data.search_direction.map((item, index) => {
              return {
                key: item,
                value: item
              }
            }))
          }
          this.filterData = [
            {title: '国家', values: countryArr},
            {title: '格式', values: typeArr},
            {title: '时间', values: timeArr},
            {title: '方向', values: directionArr},
            {title: '选项', values: optionArr}
          ];
          this.filterData.forEach((item, index) => {
            const filter = this.filterValue[index];
            this.$set(
              this.filterValue, index,
              item.values.findIndex(i => i.value === (item.title === '选项' ? +filter : filter)) > -1
                ? (item.title === '选项' ? +filter : filter) : (item.title === '选项' ? 0 : '')
            )
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
    this.resultLoading = true;
    return search.getSearchResult({
      keyword: this.searchValue,
      country_code: this.filterValue[0],
      type_code: this.filterValue[1],
      time_code: this.filterValue[2],
      search_direction: this.filterValue[3],
      keyword_type: +this.filterValue[4],
      sort_type: this.sortValue,
      page: this.pn,
      size: this.ps,
    }).then(data => {
      if (data.success === true && data.docs && data.docs.length > 0) {
        this.resultList = this.modifyDataWithHighLightWord(data.docs, data.highlight_words);
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
    }).finally(() => this.resultLoading = false)
  }

  getSearchUrl() {
    return `${CLIENT}/search?s=${this.searchValue}${
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
    const url = `${CLIENT}/search?s=${this.searchValue}`
    if (url === location.href) {
      return location.replace(url)
    }
    location.href = url
  }

  toggleLogin() {
    if (this.isLogin) {
      account.logout();
      localStorage.removeItem('authorization');
      this.isLogin = false;
      location.replace(`${CLIENT}/`)
    } else {
      this.showLoginModal = true
    }
  }

  doAfterLogin() {
    this.isLogin = true;
    this.username = localStorage.getItem('username') || '';
    this.getUserStatus()
  }

  getUserStatus() {
    return account.getUserStatus()
      .then(data => {
        if (data.success === true) {
          if (data.user_role === 'GUEST') {
            throw new Error('未登录')
          }
          this.userRole = data.user_role
        } else {
          throw new Error(data.message)
        }
      })
      .catch(e => {
        if (e.message === '未登录') {
          localStorage.removeItem('authorization');
          this.isLogin = false
        }
      })
  }

  usernameClick() {
    if (this.userRole === 'ADMIN') {
      window.open(`${CLIENT}/admin`, '_blank')
    }
  }

  toggleEdit(doc?) {
    this.showEdit = !!doc;
    if (!!doc) {
      this.editObj = {
        id: doc.id,
        file_name: doc.file_name
      }
    }
  }

  doAction() {
    console.log(this.editObj);
    if (!this.editObj.file_name) {
      return message.error('请输入文档标题', 1.5)
    }
    if (this.editLoading) {
      return
    }
    this.editLoading = true;
    return search.editDoc(this.editObj)
      .then(data => {
        if (data.success === true) {
          this.resultList = [];
          this.relWords = [];
          this.totalPage = 0;
          this.getSearchResult();
          this.toggleEdit()
        } else {
          throw new Error(data.message)
        }
      }).catch(e => {
        if (e.message === '未登录') {
          localStorage.removeItem('authorization');
          this.isLogin = false
        }
        message.error(e.message, 1.5)
      }).finally(() => this.editLoading = false)
  }

  render(h) {
    return (
      <a-layout class={this.$style.layout}>
        <a-layout-header>
          <img class={this.$style.logo} src={require('../../images/logo.jpg')}/>
          <div class={this.$style.inputBlock}>
            <input class={this.$style.input} value={this.searchValue} onChange={e => this.searchValue = e.target.value} maxlength={255}/>
            <span class={this.$style.btn} onClick={() => this.search()}>搜索一下</span>
          </div>

          {this.isLogin && <div class={this.$style.userBlock}>
            <a-dropdown>
              <span class={[this.$style.username, this.userRole === 'ADMIN' ? this.$style.admin : '']}
                    onClick={() => this.usernameClick()}>{this.username}</span>
              <a-menu slot={'overlay'}>
                <a-menu-item>
                  <a onClick={() => this.showResetPswdModal = true}>修改密码</a>
                </a-menu-item>
              </a-menu>
            </a-dropdown>
            <a-button type={'primary'} class={this.$style.loginBtn} onClick={() => this.toggleLogin()}>登出</a-button>
          </div>}

          {this.showLoginModal && <div class={this.$style.popupBg}>
            <LoginModal class={this.$style.popup} onLogin={() => this.doAfterLogin()} onClose={() => this.showLoginModal = false}/>
          </div>}

          {this.showResetPswdModal && <div class={this.$style.popupBg}>
            <ResetPswdModal class={this.$style.popup} onClose={() => this.showResetPswdModal = false}/>
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

            {this.resultList.length === 0 && <div class={this.$style.noDataBlock}>{this.confLoading || this.resultLoading ? '查询中...' : '未查询到相关数据'}</div>}

            {this.resultList.length > 0 && <div class={this.$style.resultList}>
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
                        {item.type_code !== 'html' && this.userRole === 'ADMIN' && <a class={this.$style.btn} onClick={() => this.toggleEdit(item)}>编辑</a>}
                        {item.type_code !== 'html' && <a class={[this.$style.btn, this.$style.right]} href={item.download_url} target={'_blank'}>马上下载</a>}
                      </div>
                    </div>
                  )
                })
              }
            </div>}

            {this.relWords.length > 0 && <div class={this.$style.relWordBlock}>
              <p class={this.$style.title}>相关搜索</p>
              <div class={this.$style.wordList}>
                {
                  this.relWords.map((item, index) => {
                    return (
                      <span key={index} class={this.$style.word}>
                        <a href={`${CLIENT}/search?s=${item}`} target={'_blank'}>{item}</a>
                      </span>
                    )
                  })
                }
              </div>
            </div>}

            {this.totalPage > 0 && <a-pagination current={this.pn} pageSize={this.ps} total={this.totalPage * this.ps}
                                                 onChange={page => this.changePage(page)}/>}
          </div>
        </a-layout-content>

        <a-modal visible={this.showEdit} title={'编辑'} maskClosable={false}
                 okText={'确定'} onOk={() => this.doAction()}
                 cancelText={'取消'} onCancel={() => this.toggleEdit()}
                 confirmLoading={false} destroyOnClose={true}>
          <a-spin spinning={this.editLoading}>
            <div class={this.$style.formItem}>
              <a-input value={this.editObj.file_name} onChange={e => this.editObj.file_name = e.target.value}
                       placeholder={'种子URL'}/>
            </div>
          </a-spin>
        </a-modal>
      </a-layout>
    )
  }
}
