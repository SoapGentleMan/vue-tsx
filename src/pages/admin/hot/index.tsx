import Vue from 'vue'
import Component from 'vue-class-component'
import './components'
import { message } from 'ant-design-vue'
import hot from '../../../lib/api/hot'
import moment from 'moment'

@Component({})
export default class Hot extends Vue {
  data = [];

  loading: boolean = false;
  pn: number = 1;
  ps: number = 10;
  totalPage: number = 0;

  confirmLoading: boolean = false;
  showConfirm: boolean = false;
  confirmType: string = '';
  confirmObj = {
    id: '',
    text: '',
    start_date: '',
    end_date: ''
  };
  searchValue: string = '';
  searchShowValue: string = '';

  created() {
    this.getHotList()
  }

  columns(h) {
    return [
      {
        title: '热点词',
        dataIndex: 'text',
      },
      {
        title: '开始日期',
        dataIndex: 'start_date'
      },
      {
        title: '结束日期',
        dataIndex: 'end_date'
      },
      {
        title: '状态',
        dataIndex: 'status',
        customRender: text => {
          return text === 0 ? '待显示' : (text === 1 ? '显示中' : '已过期')
        }
      },
      {
        title: '操作',
        key: 'operate',
        customRender: data => {
          const needMove = data.status === 0 || data.status === 1;
          return <span>
            <a onClick={() => this.toggleConfirm('edit', data)}>编辑</a>
            <a-divider type={'vertical'}/>
            <a onClick={() => this.toggleConfirm('delete', data)}>删除</a>
            {needMove && <a-divider type={'vertical'}/>}
            {needMove && <a onClick={() => this.move('up', data)}>上移</a>}
            {needMove && <a-divider type={'vertical'}/>}
            {needMove && <a onClick={() => this.move('down', data)}>下移</a>}
          </span>
        }
      },
    ]
  }

  getHotList() {
    if (this.loading) {
      return
    }
    this.loading = true;
    return hot.getHotList({
      pn: this.pn, ps: this.ps, search: this.searchValue
    }).then(data => {
      if (data.success === true) {
        this.data = data.hotword_list;
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
    this.getHotList()
  }

  get confirmTextObj() {
    switch (this.confirmType) {
      case 'create': {
        return {
          title: '添加热点词',
          okText: '保存'
        }
      }
      case 'edit': {
        return {
          title: '编辑热点词',
          okText: '保存'
        }
      }
      case 'delete': {
        return {
          title: '删除热点词',
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
        text: '',
        start_date: '',
        end_date: ''
      } : {
        id: data.id,
        text: data.text,
        start_date: data.start_date,
        end_date: data.end_date
      }
    }
  }

  setConfirmObj(type, value) {
    this.$set(this.confirmObj, type, value);
  }

  doAction() {
    if (!this.confirmObj.text && this.confirmType !== 'delete') {
      return message.error('请输入热点词', 1.5)
    }
    if (!this.confirmObj.start_date && this.confirmType !== 'delete') {
      return message.error('请选择开始日期', 1.5)
    }
    if (!this.confirmObj.end_date && this.confirmType !== 'delete') {
      return message.error('请选择结束日期', 1.5)
    }
    if (this.confirmLoading) {
      return
    }
    this.confirmLoading = true;
    let fetchPromise;
    let options;
    switch (this.confirmType) {
      case 'create': {
        fetchPromise = hot.createHot;
        options = {
          text: this.confirmObj.text,
          start_date: this.confirmObj.start_date,
          end_date: this.confirmObj.end_date
        }
        break
      }
      case 'edit': {
        fetchPromise = hot.updateHot;
        options = {
          id: this.confirmObj.id,
          text: this.confirmObj.text,
          start_date: this.confirmObj.start_date,
          end_date: this.confirmObj.end_date
        }
        break
      }
      case 'delete': {
        fetchPromise = hot.deleteHot;
        options = {
          id: this.confirmObj.id
        }
        break
      }
    }
    fetchPromise = fetchPromise.bind(hot);
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

  move(type, hotWord) {
    if (this.loading) {
      return
    }
    this.loading = true;
    hot.moveHot(type, {id: hotWord.id})
      .finally(() => this.loading = false)
      .then(data => {
        if (data.success === true) {
          this.changePage(this.pn)
        } else {
          throw new Error(data.message)
        }
      }).catch(e => {
        if (e.message === '未登录') {
          return this.doNoLoginAction();
        }
        message.error(e.message, 1.5);
      })
  }

  search(value) {
    this.searchValue = value;
    this.changePage(1)
  }

  render(h) {
    return (
      <div>
        <header class={this.$style.header}>今日热点</header>

        <div class={this.$style.line}>
          <a-input placeholder={'搜索热点词'} value={this.searchShowValue}
                   onPressEnter={e => this.search(e.target.value)}
                   onChange={e => this.searchShowValue = e.target.value}/>

          <a-button type={'primary'} onClick={() => this.toggleConfirm('create')}>添加热点词</a-button>
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
            {this.confirmType !== 'delete' && <div class={this.$style.formItem}>
              <a-input value={this.confirmObj.text} onChange={e => this.setConfirmObj('text', e.target.value)}
                       placeholder={'热点词'}/>
            </div>}

            {this.confirmType !== 'delete' && <div class={this.$style.formItem}>
              <a-range-picker value={
                                !!this.confirmObj.start_date && !!this.confirmObj.end_date ?
                                  [moment(this.confirmObj.start_date), moment(this.confirmObj.end_date)] : []
                              }
                              allowClear={false}
                              onChange={(dates, dateStrings) => {
                                this.setConfirmObj('start_date', dateStrings[0]);
                                this.setConfirmObj('end_date', dateStrings[1])
                              }}/>
            </div>}

            {this.confirmType === 'delete' && <span class={this.$style.warnColor}>确定删除热点词？</span>}
          </a-spin>
        </a-modal>
      </div>
    )
  }
}
