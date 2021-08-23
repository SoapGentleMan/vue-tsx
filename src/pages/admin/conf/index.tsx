import Vue from 'vue'
import Component from 'vue-class-component'
import './components'
import { message } from 'ant-design-vue'
import conf from '../../../lib/api/conf'

@Component({})
export default class Conf extends Vue {
  data = [];

  loading: boolean = false;
  pn: number = 1;
  ps: number = 10;
  totalPage: number = 0;

  confirmLoading: boolean = false;
  showConfirm: boolean = false;
  confirmType: string = '';
  confirmObj = {
    name: '',
    value: ''
  };
  searchValue: string = '';
  searchShowValue: string = '';

  created() {
    this.getConfList()
  }

  columns(h) {
    return [
      {
        title: '参数名',
        dataIndex: 'name',
      },
      {
        title: '参数值',
        dataIndex: 'value'
      },
      {
        title: '备注',
        dataIndex: 'remark'
      },
      {
        title: '更新日期',
        dataIndex: 'update_date'
      },
      {
        title: '编辑人',
        dataIndex: 'update_by'
      },
      {
        title: '操作',
        key: 'operate',
        customRender: data => {
          return <span>
            <a onClick={() => this.toggleConfirm('edit', data)}>编辑</a>
          </span>
        }
      },
    ]
  }

  getConfList() {
    if (this.loading) {
      return
    }
    this.loading = true;
    return conf.getConfList({
      pn: this.pn, ps: this.ps, search: this.searchValue
    }).then(data => {
      if (data.success === true) {
        this.data = data.conf_list;
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
    this.getConfList()
  }

  get confirmTextObj() {
    switch (this.confirmType) {
      case 'edit': {
        return {
          title: '编辑参数',
          okText: '保存'
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
      this.confirmObj = {
        name: data.name,
        value: data.value
      }
    }
  }

  setConfirmObj(type, value) {
    this.$set(this.confirmObj, type, value);
  }

  doAction() {
    if (!this.confirmObj.name) {
      return message.error('请输入参数名', 1.5)
    }
    if (!this.confirmObj.value) {
      return message.error('请输入参数值', 1.5)
    }
    if (this.confirmLoading) {
      return
    }
    this.confirmLoading = true;
    let fetchPromise;
    let options;
    switch (this.confirmType) {
      case 'edit': {
        fetchPromise = conf.updateConf;
        options = {
          name: this.confirmObj.name,
          value: this.confirmObj.value
        }
        break
      }
    }
    fetchPromise = fetchPromise.bind(conf);
    return fetchPromise(options)
      .then(data => {
        if (data.success === true) {
          if (this.confirmType === 'edit') {
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
        <header class={this.$style.header}>参数设置</header>

        <div class={this.$style.line}>
          <a-input placeholder={'搜索参数名'} value={this.searchShowValue}
                   onPressEnter={e => this.search(e.target.value)}
                   onChange={e => this.searchShowValue = e.target.value}/>
        </div>

        <a-table columns={this.columns(h)} dataSource={this.data}
                 rowKey={record => record.name}
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
            <div class={this.$style.formItem}>
              <a-input value={this.confirmObj.name} onChange={e => this.setConfirmObj('name', e.target.value)}
                       placeholder={'参数名'}/>
            </div>

            <div class={this.$style.formItem}>
              <a-input value={this.confirmObj.value} onChange={e => this.setConfirmObj('value', e.target.value)}
                       placeholder={'参数值'}/>
            </div>
          </a-spin>
        </a-modal>
      </div>
    )
  }
}
