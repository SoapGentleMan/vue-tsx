import Vue from 'vue'
import Component from 'vue-class-component'
import './components'
import { message } from 'ant-design-vue'
import Countries from './country'

@Component({})
export default class Torrent extends Vue {
  data = [
    {
      url: 'John Brown2',
      country: '2018-1-1',
      start: '1',
      update: '1',
      status: 'normal'
    },
    {
      url: 'John Brown12',
      country: '2018-1-1',
      start: '1',
      update: '1',
      status: 'doing'
    },
    {
      url: 'John Brown13',
      country: '2018-1-1',
      start: '1',
      update: '1',
      status: 'stop'
    }
  ];

  loading: boolean = false;
  pn: number = 1;
  ps: number = 10;

  showConfirm: boolean = false;
  confirmType: string = '';
  confirmObj = {
    url: '',
    country: ''
  };

  searchValue: string = '';

  columns(h) {
    return [
      {
        title: '种子URL',
        dataIndex: 'url',
      },
      {
        title: '国家',
        dataIndex: 'country'
      },
      {
        title: '创建日期',
        dataIndex: 'start'
      },
      {
        title: '更新日期',
        dataIndex: 'update'
      },
      {
        title: '状态',
        dataIndex: 'status'
      },
      {
        title: '操作',
        key: 'operate',
        customRender: data => {
          return <span>
            <a onClick={() => this.toggleConfirm(data.status === 'stop' ? 'restore' : 'stop', data)}>{data.status === 'stop' ? '恢复' : '暂停'}</a>
            <a-divider type={'vertical'}/>
            <a onClick={() => this.toggleConfirm('delete', data)}>删除</a>
          </span>
        }
      },
    ]
  }

  changePage(pn) {
    this.pn = pn
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
          title: '新建种子链接',
          okText: '确定'
        }
      }
      case 'restore': {
        return {
          title: '恢复种子链接',
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
        url: '',
        country: ''
      } : {
        url: data.url,
        country: data.country
      }
    }
  }

  setConfirmObj(type, value) {
    this.$set(this.confirmObj, type, value);
  }

  doAction() {
    console.log(this.confirmObj);
    if (!this.confirmObj.url) {
      return message.error('请输入种子链接')
    }
    if (!this.confirmObj.country) {
      return message.error('请选择国家')
    }
    this.toggleConfirm('')
  }

  search(value) {
    this.searchValue = value;
    console.log(this.searchValue)
  }

  render(h) {
    return (
      <div>
        <header class={this.$style.header}>种子连接</header>

        <div class={this.$style.line}>
          <a-input placeholder={'搜索种子链接'} onPressEnter={e => this.search(e.target.value)}/>

          <a-button type={'primary'} onClick={() => this.toggleConfirm('create')}>添加种子链接</a-button>
        </div>

        <a-table columns={this.columns(h)} dataSource={this.data}
                 rowKey={record => record.url}
                 pagination={false}
                 loading={this.loading}/>
        <div class={this.$style.pagination}>
          <a-pagination current={this.pn} pageSize={this.ps} total={20} show-quick-jumper
                        onChange={page => this.changePage(page)}/>
        </div>

        <a-modal visible={this.showConfirm} title={this.confirmTextObj.title}
                 okText={'确定'} onOk={() => this.doAction()}
                 cancelText={'取消'} onCancel={() => this.toggleConfirm('')}
                 confirmLoading={false} destroyOnClose={true}>
          {this.confirmType === 'create' && <div class={this.$style.formItem}>
            <a-input value={this.confirmObj.url} onChange={e => this.setConfirmObj('url', e.target.value)}
                     placeholder={'种子URL'}/>
          </div>}

          {this.confirmType === 'create' && <div class={this.$style.formItem}>
            <a-select value={this.confirmObj.country} onChange={value => this.setConfirmObj('country', value)}
                      placeholder={'国家'}>
              {
                Countries.map(item =>  <a-select-option value={item}>{item}</a-select-option>)
              }
            </a-select>
          </div>}

          {this.confirmType !== 'create' && <span class={this.$style.warnColor}>确定{this.confirmType === 'delete' ? '删除' : (this.confirmType === 'stop' ? '暂停' : '恢复')}种子链接？</span>}
        </a-modal>
      </div>
    )
  }
}
