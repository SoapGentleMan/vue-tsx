import Vue from 'vue'
import Component from 'vue-class-component'
import './components'
import { message } from 'ant-design-vue'
import seed from '../../../lib/api/seed'
import search from '../../../lib/api/search'
import searchAdmin from '../../../lib/api/search-admin'

@Component({})
export default class Torrent extends Vue {
  data = [];

  loading: boolean = false;
  pn: number = 1;
  ps: number = 10;
  totalPage: number = 0;

  countryList = [];
  directionList = [];

  confirmLoading: boolean = false;
  showConfirm: boolean = false;
  confirmType: string = '';
  confirmObj = {
    id: '',
    url: '',
    country_code: undefined,
    search_direction: [],
    act: 0
  };
  searchValue: string = '';
  searchShowValue: string = '';

  timeout = null;   // 定时更新结果

  created() {
    this.getCountryData();
    this.getDirectionData()
  }

  activated() {
    this.changePage(this.pn)
  }

  deactivated() {
    this.timeout && clearTimeout(this.timeout)
  }

  columns(h) {
    return [
      {
        title: '种子链接',
        dataIndex: 'url',
      },
      {
        title: '国家',
        dataIndex: 'country_name'
      },
      {
        title: '搜索方向',
        dataIndex: 'search_direction',
        ellipsis: true,
        customRender: data => {
          return data.length === 0 ? '无' : data.join('、')
        }
      },
      {
        title: '创建日期',
        dataIndex: 'created_date'
      },
      {
        title: '更新日期',
        dataIndex: 'update_date'
      },
      {
        title: '状态',
        dataIndex: 'status',
        customRender: text => {
          return text === 0 ? '待爬取' : (text === 1 ? '爬取中' : '已完成')
        }
      },
      {
        title: 'URL',
        dataIndex: 'scrap_url',
        ellipsis: true
      },
      {
        title: '收录数',
        dataIndex: 'scrap_total'
      },
      {
        title: '操作',
        key: 'operate',
        customRender: data => {
          return <span>
            <a onClick={() => this.toggleConfirm(data.status === 1 ? 'stop' : 'restore', data)}>{data.status === 1 ? '停止' : '开始'}</a>
            <a-divider type={'vertical'}/>
            <a onClick={() => this.toggleConfirm('edit', data)}>编辑</a>
            <a-divider type={'vertical'}/>
            <a onClick={() => this.toggleConfirm('delete', data)}>删除</a>
          </span>
        }
      },
    ]
  }

  getDirectionData() {
    return searchAdmin.getSearchDirection()
      .then(data => {
        if (data.success === true && data.data && data.data.length > 0) {
          this.directionList = data.data.map(item => {
            return {
              key: item,
              value: item
            }
          })
        } else {
          throw new Error(data.message)
        }
      })
  }

  getCountryData() {
    return search.getSearchConf()
      .then(data => {
        if (data.success === true && data.country_name && data.country_name.length > 0 && data.country_code && data.country_code.length > 0) {
          this.countryList = data.country_name.map((item, index) => {
            return {
              key: item,
              value: data.country_code[index] || ''
            }
          })
        } else {
          throw new Error(data.message)
        }
      })
      .catch(e => {
        if (e.message === '未登录') {
          this.doNoLoginAction()
        }
      })
  }

  getSeedList() {
    if (this.loading) {
      return
    }
    this.loading = true;
    return seed.getSeedList({
      pn: this.pn, ps: this.ps, search: this.searchValue
    }).then(data => {
      if (data.success === true) {
        this.data = data.seed_list;
        this.totalPage = data.pages
      } else {
        throw new Error(data.message)
      }
    }).catch(e => {
      if (e.message === '未登录') {
        return this.doNoLoginAction()
      }
      this.data = [];
      message.error(e.message, 1.5)
    }).finally(() => {
      this.loading = false;
      this.timeout = setTimeout(() => this.getSeedList(), 10000)
    })
  }

  doNoLoginAction() {
    localStorage.removeItem('authorization');
    location.href = `${CLIENT}/login`
  }

  changePage(pn) {
    this.timeout && clearTimeout(this.timeout);
    this.pn = pn;
    this.getSeedList()
  }

  get confirmTextObj() {
    switch (this.confirmType) {
      case 'create': {
        return {
          title: '新建种子链接',
          okText: '保存'
        }
      }
      case 'stop': {
        return {
          title: '停止爬取种子',
          okText: '确定'
        }
      }
      case 'restore': {
        return {
          title: '开始爬取种子',
          okText: '确定'
        }
      }
      case 'edit': {
        return {
          title: '编辑种子链接',
          okText: '保存'
        }
      }
      case 'delete': {
        return {
          title: '删除种子链接',
          okText: '确定'
        }
      }
      default: {
        return {}
      }
    }
  }

  toggleConfirm(type, data?) {
    this.showConfirm = !!type;
    if (!!type) {
      this.confirmType = type;
      this.confirmObj = type === 'create' ? {
        id: '',
        url: '',
        country_code: undefined,
        search_direction: [],
        act: 0
      } : {
        id: data.id,
        url: data.url,
        country_code: data.country_code,
        search_direction: data.search_direction,
        act: type === 'stop' ? 0 : 1
      }
    }
  }

  setConfirmObj(type, value) {
    this.$set(this.confirmObj, type, value);
  }

  doAction() {
    console.log(this.confirmObj);
    if (!this.confirmObj.url && ['create', 'edit'].indexOf(this.confirmType) > -1) {
      return message.error('请输入种子链接', 1.5)
    }
    if (!this.confirmObj.country_code && ['create', 'edit'].indexOf(this.confirmType) > -1) {
      return message.error('请选择国家', 1.5)
    }
    if (this.confirmObj.search_direction.length === 0 && ['create', 'edit'].indexOf(this.confirmType) > -1) {
      return message.error('请选择搜索方向', 1.5)
    }
    if (this.confirmLoading) {
      return
    }
    this.confirmLoading = true;
    let fetchPromise;
    let options;
    switch (this.confirmType) {
      case 'create': {
        fetchPromise = seed.createSeed;
        options = {
          url: this.confirmObj.url,
          country_code: this.confirmObj.country_code,
          search_direction: this.confirmObj.search_direction
        }
        break
      }
      case 'stop':
      case 'restore': {
        fetchPromise = seed.setSeedStatus;
        options = {
          id: this.confirmObj.id,
          act: this.confirmObj.act
        }
        break
      }
      case 'edit': {
        fetchPromise = seed.createSeed;
        options = {
          id: this.confirmObj.id,
          country_code: this.confirmObj.country_code,
          search_direction: this.confirmObj.search_direction
        }
        break
      }
      case 'delete': {
        fetchPromise = seed.deleteSeed;
        options = {
          id: this.confirmObj.id
        }
        break
      }
    }
    fetchPromise = fetchPromise.bind(seed);
    return fetchPromise(options)
      .then(data => {
        if (data.success === true) {
          if (this.confirmType === 'create') {
            this.searchValue = '';
            this.searchShowValue = '';
            this.changePage(1)
          }
          if (this.confirmType !== 'create') {
            this.changePage(this.pn)
          }
          this.toggleConfirm('');
        } else {
          if (['stop', 'restore'].indexOf(this.confirmType) > -1) {
            this.toggleConfirm('')
          }
          throw new Error(data.message)
        }
      }).catch(e => {
        if (e.message === '未登录') {
          return this.doNoLoginAction()
        }
        message.error(e.message, 1.5)
      }).finally(() => this.confirmLoading = false)
  }

  search(value) {
    this.searchValue = value;
    this.changePage(1)
  }

  render(h) {
    return (
      <div>
        <header class={this.$style.header}>种子连接</header>

        <div class={this.$style.line}>
          <a-input placeholder={'搜索种子链接'} value={this.searchShowValue}
                   onPressEnter={e => this.search(e.target.value)}
                   onChange={e => this.searchShowValue = e.target.value}/>

          <div>
            <a-button type={'primary'} onClick={() => this.toggleConfirm('create')}>添加种子链接</a-button>
            <a-button style={{marginLeft: '8px'}} onClick={() => this.changePage(this.pn)}>刷新</a-button>
          </div>
        </div>

        <a-table columns={this.columns(h)} dataSource={this.data}
                 rowKey={record => record.id}
                 pagination={false}
                 loading={this.loading}/>
        {this.totalPage > 0 && <div class={this.$style.pagination}>
          <a-pagination current={this.pn} pageSize={this.ps} total={this.totalPage * this.ps}
                        onChange={page => this.changePage(page)}/>
        </div>}

        <a-modal visible={this.showConfirm} title={this.confirmTextObj.title} maskClosable={false}
                 okText={'确定'} onOk={() => this.doAction()}
                 cancelText={'取消'} onCancel={() => this.toggleConfirm('')}
                 confirmLoading={false} destroyOnClose={true}>
          <a-spin spinning={this.confirmLoading}>
            {['create', 'edit'].indexOf(this.confirmType) > -1 && <div class={this.$style.formItem}>
              <a-input value={this.confirmObj.url} onChange={e => this.setConfirmObj('url', e.target.value)}
                       placeholder={'种子URL'} disabled={this.confirmType !== 'create'}/>
            </div>}

            {['create', 'edit'].indexOf(this.confirmType) > -1 && <div class={this.$style.formItem}>
              <a-select value={this.confirmObj.country_code} onChange={value => this.setConfirmObj('country_code', value)}
                        placeholder={'国家'}>
                {
                  this.countryList.map(item => <a-select-option value={item.value}>{item.key}</a-select-option>)
                }
              </a-select>
            </div>}

            {['create', 'edit'].indexOf(this.confirmType) > -1 && <div class={this.$style.formItem}>
              <a-select mode={'multiple'} value={this.confirmObj.search_direction}
                        onChange={value => this.setConfirmObj('search_direction', value)}
                        placeholder={'搜索方向'}>
                {
                  this.directionList.map(item => <a-select-option value={item.value}>{item.key}</a-select-option>)
                }
              </a-select>
            </div>}

            {['create', 'edit'].indexOf(this.confirmType) === -1 &&
            <span class={this.$style.warnColor}>确定{this.confirmType === 'delete' ? '删除种子链接' : (this.confirmType === 'stop' ? '停止爬取种子' : '开始爬取种子')}？</span>}
          </a-spin>
        </a-modal>
      </div>
    )
  }
}
