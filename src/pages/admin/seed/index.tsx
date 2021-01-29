import Vue from 'vue'
import Component from 'vue-class-component'
import './components'
import { message } from 'ant-design-vue'
import seed from '../../../lib/api/seed'
import search from '../../../lib/api/search'

@Component({})
export default class Torrent extends Vue {
  data = [];

  loading: boolean = false;
  pn: number = 1;
  ps: number = 10;
  totalPage: number = 0;

  countryList = [];

  confirmLoading: boolean = false;
  showConfirm: boolean = false;
  confirmType: string = '';
  confirmObj = {
    id: '',
    url: '',
    country_code: undefined,
    act: 0
  };
  searchValue: string = '';
  searchShowValue: string = '';

  created() {
    this.getCountryData();
    this.getSeedList()
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
          return text === 0 ? '正常' : (text === 1 ? '爬取汇总' : '暂停')
        }
      },
      {
        title: '操作',
        key: 'operate',
        customRender: data => {
          return <span>
            <a onClick={() => this.toggleConfirm(data.status === 2 ? 'restore' : 'stop', data)}>{data.status === 2 ? '恢复' : '暂停'}</a>
            <a-divider type={'vertical'}/>
            <a onClick={() => this.toggleConfirm('delete', data)}>删除</a>
          </span>
        }
      },
    ]
  }

  getCountryData() {
    let cache;
    const lsData = localStorage.getItem('countryList')
    if (!!lsData) {
      try {
        const json = JSON.parse(lsData);
        (new Date().getTime() - json.timestamp < 1000 * 3600 * 6) && (cache = json.data)
      } catch (e) {
        // do nothing
      }
    }
    return Promise.resolve(cache || search.getSearchConf())
      .then(data => {
        if (data.success === true && data.country_name && data.country_name.length > 0 && data.country_code && data.country_code.length > 0) {
          this.countryList = data.country_name.map((item, index) => {
            return {
              key: item,
              value: data.country_code[index] || ''
            }
          })
          localStorage.setItem('searchConf', JSON.stringify({data: this.countryList, timestamp: new Date().getTime()}))
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
    }).finally(() => this.loading = false)
  }

  doNoLoginAction() {
    localStorage.removeItem('authorization');
    location.href = `${CLIENT}/login.html`
  }

  changePage(pn) {
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
          title: '暂停爬取种子',
          okText: '确定'
        }
      }
      case 'restore': {
        return {
          title: '恢复爬取种子',
          okText: '确定'
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
        act: 0
      } : {
        id: data.id,
        url: data.url,
        country_code: data.country_code,
        act: type === 'stop' ? 0 : 1
      }
    }
  }

  setConfirmObj(type, value) {
    this.$set(this.confirmObj, type, value);
  }

  doAction() {
    console.log(this.confirmObj);
    if (!this.confirmObj.url && this.confirmType === 'create') {
      return message.error('请输入种子链接', 1.5)
    }
    if (!this.confirmObj.country_code && this.confirmType === 'create') {
      return message.error('请选择国家', 1.5)
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
          country_code: this.confirmObj.country_code
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

          <a-button type={'primary'} onClick={() => this.toggleConfirm('create')}>添加种子链接</a-button>
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
            {this.confirmType === 'create' && <div class={this.$style.formItem}>
              <a-input value={this.confirmObj.url} onChange={e => this.setConfirmObj('url', e.target.value)}
                       placeholder={'种子URL'}/>
            </div>}

            {this.confirmType === 'create' && <div class={this.$style.formItem}>
              <a-select value={this.confirmObj.country_code} onChange={value => this.setConfirmObj('country_code', value)}
                        placeholder={'国家'}>
                {
                  this.countryList.map(item => <a-select-option value={item.value}>{item.key}</a-select-option>)
                }
              </a-select>
            </div>}

            {this.confirmType !== 'create' && <span class={this.$style.warnColor}>确定{this.confirmType === 'delete' ? '删除种子链接' : (this.confirmType === 'stop' ? '暂停爬取种子' : '恢复爬取种')}？</span>}
          </a-spin>
        </a-modal>
      </div>
    )
  }
}
