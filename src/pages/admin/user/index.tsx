import Vue from 'vue'
import Component from 'vue-class-component'
import './components'
import { message } from 'ant-design-vue'

@Component({})
export default class User extends Vue {
  data = [
    {
      username: 'John Brown1',
      level: 1,
      register: '2018-1-1',
      outdate: '2018-1-1',
      status: '正常'
    },
    {
      username: 'John Brown2',
      level: 2,
      register: '2018-1-1',
      outdate: '2018-1-1',
      status: '正常'
    },
    {
      username: 'John Brown3',
      level: 0,
      register: '2018-1-1',
      outdate: '2018-1-1',
      status: '正常'
    },
  ];

  loading: boolean = false;
  pn: number = 1;
  ps: number = 10;

  showConfirm: boolean = false;
  confirmType: string = '';
  confirmObj = {
    username: '',
    password: '',
    outdate: '',
    level: undefined
  };

  searchValue: string = '';

  columns(h) {
    return [
      {
        title: '用户名',
        dataIndex: 'username',
      },
      {
        title: '等级',
        dataIndex: 'level',
        customRender: text => {
          return text === 2 ? 'vip用户' : (text === 1 ? '普通用户' : '测试用户')
        }
      },
      {
        title: '注册日期',
        dataIndex: 'register',
      },
      {
        title: '到期日期',
        dataIndex: 'outdate'
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
            <a onClick={() => this.toggleConfirm('edit', data)}>编辑</a>
            <a-divider type={'vertical'}/>
            <a onClick={() => this.toggleConfirm('delete', data)}>注销</a>
            <a-divider type={'vertical'}/>
            <a onClick={() => this.toggleConfirm('reset', data)}>重置密码</a>
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
          title: '新建用户',
          okText: '创建'
        }
      }
      case 'edit': {
        return {
          title: '编辑用户',
          okText: '保存'
        }
      }
      case 'reset': {
        return {
          title: '重置密码',
          okText: '确定'
        }
      }
      case 'delete': {
        return {
          title: '注销用户',
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
        username: '',
        password: '',
        outdate: '',
        level: undefined
      } : {
        username: data.username,
        password: '',
        outdate: data.outdate,
        level: data.level
      }
    }
  }

  setConfirmObj(type, value) {
    this.$set(this.confirmObj, type, value);
    if (type === 'level' && !this.confirmObj.outdate) {
      this.$set(this.confirmObj, 'outdate', value === 2 ? '2018-1-1' : (value === 1 ? '2017-1-1' : '2016-1-1'))
    }
  }

  doAction() {
    console.log(this.confirmObj);
    if (!this.confirmObj.username) {
      return message.error('请输入用户名')
    }
    if (!this.confirmObj.password) {
      return message.error('请输入密码')
    }
    if (!this.confirmObj.level) {
      return message.error('请选择用户等级')
    }
    if (!this.confirmObj.outdate) {
      return message.error('请输入过期时间')
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
        <header class={this.$style.header}>用户列表</header>

        <div class={this.$style.line}>
          <a-input placeholder={'搜索用户'} onPressEnter={e => this.search(e.target.value)}/>

          <a-button type={'primary'} onClick={() => this.toggleConfirm('create')}>新建用户</a-button>
        </div>

        <a-table columns={this.columns(h)} dataSource={this.data}
                 rowKey={record => record.username}
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
          {['create', 'edit', 'reset'].indexOf(this.confirmType) > -1 && <div class={this.$style.formItem}>
            <a-input value={this.confirmObj.username} onChange={e => this.setConfirmObj('username', e.target.value)}
                     placeholder={'用户名'} disabled={this.confirmType !== 'create'}/>
          </div>}

          {['create', 'edit'].indexOf(this.confirmType) > -1 && <div class={this.$style.formItem}>
            <a-select value={this.confirmObj.level} onChange={value => this.setConfirmObj('level', value)}
                      placeholder={'普通/测试/VIP用户'}>
              <a-select-option value={0}>测试用户</a-select-option>
              <a-select-option value={1}>普通用户</a-select-option>
              <a-select-option value={2}>vip用户</a-select-option>
            </a-select>
          </div>}

          {this.confirmType === 'edit' && <div class={this.$style.formItem}>
            <a-input value={this.confirmObj.outdate} onChange={e => this.setConfirmObj('outdate', e.target.value)}
                     placeholder={'到期日期'}/>
          </div>}

          {['create', 'reset'].indexOf(this.confirmType) > -1 && <div class={this.$style.formItem}>
            <a-input value={this.confirmObj.password} onChange={e => this.setConfirmObj('password', e.target.value)}
                     placeholder={this.confirmType === 'create' ? '初始密码' : '新的初始密码'}/>
          </div>}

          {this.confirmType === 'delete' && <span class={this.$style.warnColor}>确定注销用户？</span>}
        </a-modal>
      </div>
    )
  }
}
