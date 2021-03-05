import Vue from 'vue'
import Component from 'vue-class-component'
import './components'
import { message } from 'ant-design-vue'
import moment from 'moment'
import user from '../../../lib/api/user'

@Component({})
export default class User extends Vue {
  data = [];

  loading: boolean = false;
  pn: number = 1;
  ps: number = 10;
  totalPage: number = 0;

  confirmLoading: boolean = false;
  showConfirm: boolean = false;
  confirmType: string = '';
  confirmObj = {
    username: '',
    password: '',
    expire_date: '',
    level: undefined
  };
  expireCount: number = 0;
  searchValue: string = '';
  searchShowValue: string = '';

  created() {
    this.getUserList()
  }

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
        dataIndex: 'begin_date',
      },
      {
        title: '到期日期',
        dataIndex: 'expire_date'
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

  getUserList() {
    if (this.loading) {
      return
    }
    this.loading = true;
    return user.getUserList({
      pn: this.pn, ps: this.ps, search: this.searchValue
    }).then(data => {
      if (data.success === true) {
        this.data = data.users;
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
    location.href = `${CLIENT}/login`
  }

  changePage(pn) {
    this.pn = pn;
    this.getUserList()
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
        expire_date: '',
        level: undefined
      } : {
        username: data.username,
        password: '',
        expire_date: data.expire_date,
        level: data.level
      }
    }
  }

  setConfirmObj(type, value) {
    this.$set(this.confirmObj, type, value);
    if (type === 'level' && this.confirmType === 'edit') {
      this.getExpireDate()
    }
    if (type === 'expire_date') {
      this.expireCount = this.expireCount + 1
    }
  }

  doAction() {
    console.log(this.confirmObj);
    if (!this.confirmObj.username && ['create', 'edit', 'reset'].indexOf(this.confirmType) > -1) {
      return message.error('请输入用户名', 1.5)
    }
    if (!this.confirmObj.password && ['create', 'reset'].indexOf(this.confirmType) > -1) {
      return message.error('请输入密码', 1.5)
    }
    if (!this.confirmObj.level && ['create', 'edit'].indexOf(this.confirmType) > -1) {
      return message.error('请选择用户等级', 1.5)
    }
    if (!this.confirmObj.expire_date && this.confirmType === 'edit') {
      return message.error('请选择到期日期', 1.5)
    }
    if (this.confirmLoading) {
      return
    }
    this.confirmLoading = true;
    let fetchPromise;
    let options;
    switch (this.confirmType) {
      case 'create': {
        fetchPromise = user.createUser;
        options = {
          username: this.confirmObj.username,
          password: this.confirmObj.password,
          level: this.confirmObj.level
        }
        break
      }
      case 'edit': {
        fetchPromise = user.updateUser;
        options = {
          username: this.confirmObj.username,
          level: this.confirmObj.level,
          expire_date: this.confirmObj.expire_date
        }
        break
      }
      case 'reset': {
        fetchPromise = user.resetUserPswd;
        options = {
          username: this.confirmObj.username,
          password: this.confirmObj.password
        }
        break
      }
      case 'delete': {
        fetchPromise = user.deleteUser;
        options = {
          username: this.confirmObj.username
        }
        break
      }
    }
    fetchPromise = fetchPromise.bind(user);
    return fetchPromise(options)
      .then(data => {
        if (data.success === true) {
          if (this.confirmType === 'create') {
            this.searchValue = '';
            this.searchShowValue = '';
            this.changePage(1)
          }
          if (this.confirmType === 'edit' || this.confirmType === 'delete') {
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

  getExpireDate() {
    this.expireCount = this.expireCount + 1;
    const expireCount = this.expireCount;
    return user.calcExpireDate({
      username: this.confirmObj.username,
      level: this.confirmObj.level
    }) .then(data => {
      if (data.success === true) {
        expireCount === this.expireCount && (this.confirmObj.expire_date = data.expire_date)
      } else {
        throw new Error(data.message)
      }
    }).catch(e => {
      if (e.message === '未登录') {
        return this.doNoLoginAction()
      }
    })
  }

  search(value) {
    this.searchValue = value;
    this.changePage(1)
  }

  render(h) {
    return (
      <div>
        <header class={this.$style.header}>用户列表</header>

        <div class={this.$style.line}>
          <a-input placeholder={'搜索用户'} value={this.searchShowValue}
                   onPressEnter={e => this.search(e.target.value)}
                   onChange={e => this.searchShowValue = e.target.value}/>

          <a-button type={'primary'} onClick={() => this.toggleConfirm('create')}>新建用户</a-button>
        </div>

        <a-table columns={this.columns(h)} dataSource={this.data}
                 rowKey={record => record.username}
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
            {['create', 'edit', 'reset'].indexOf(this.confirmType) > -1 && <div class={this.$style.formItem}>
              <a-input value={this.confirmObj.username} onChange={e => this.setConfirmObj('username', e.target.value)}
                       placeholder={'用户名'} disabled={this.confirmType !== 'create'}/>
            </div>}

            {['create', 'edit'].indexOf(this.confirmType) > -1 && <div class={this.$style.formItem}>
              <a-select value={this.confirmObj.level} placeholder={'普通/测试/VIP用户'}
                        onChange={value => this.setConfirmObj('level', value)}>
                <a-select-option value={1}>普通用户</a-select-option>
                <a-select-option value={2}>vip用户</a-select-option>
                <a-select-option value={3}>测试用户</a-select-option>
              </a-select>
            </div>}

            {this.confirmType === 'edit' && <div class={this.$style.formItem}>
              <a-date-picker value={!!this.confirmObj.expire_date ? moment(this.confirmObj.expire_date) : null} allowClear={false}
                             onChange={(date, dateString) => this.setConfirmObj('expire_date', dateString)}
                             placeholder={'到期日期'}/>
            </div>}

            {['create', 'reset'].indexOf(this.confirmType) > -1 && <div class={this.$style.formItem}>
              <a-input value={this.confirmObj.password} onChange={e => this.setConfirmObj('password', e.target.value)}
                       placeholder={this.confirmType === 'create' ? '初始密码' : '新的密码'}/>
            </div>}

            {this.confirmType === 'delete' && <span class={this.$style.warnColor}>确定注销用户？</span>}
          </a-spin>
        </a-modal>
      </div>
    )
  }
}
