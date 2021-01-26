import Vue from 'vue'
import Component from 'vue-class-component'
import './components'
import { message } from 'ant-design-vue'

@Component({})
export default class Hot extends Vue {
  data = [
    {
      hotWord: 'John Brown1',
      sort: '1',
      start: '2018-1-1',
      end: '2018-1-1',
      status: '显示中'
    },
    {
      hotWord: 'John Brown2',
      sort: '1',
      start: '2018-1-1',
      end: '2018-1-1',
      status: '已过期'
    },
    {
      hotWord: 'John Brown3',
      sort: '1',
      start: '2018-1-1',
      end: '2018-1-1',
      status: '显示中'
    },
  ];

  loading: boolean = false;
  pn: number = 1;
  ps: number = 10;

  showConfirm: boolean = false;
  confirmType: string = '';
  confirmObj = {
    hotWord: '',
    sort: '',
    start: '',
    end: ''
  };

  searchValue: string = '';

  columns(h) {
    return [
      {
        title: '热点词',
        dataIndex: 'hotWord',
      },
      {
        title: '排序',
        dataIndex: 'sort'
      },
      {
        title: '开始日期',
        dataIndex: 'start'
      },
      {
        title: '结束日期',
        dataIndex: 'end'
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
        hotWord: '',
        sort: '',
        start: '',
        end: ''
      } : {
        hotWord: data.hotWord,
        sort: data.sort,
        start: data.start,
        end: data.end
      }
    }
  }

  setConfirmObj(type, value) {
    this.$set(this.confirmObj, type, value);
  }

  doAction() {
    console.log(this.confirmObj);
    if (!this.confirmObj.hotWord) {
      return message.error('请输入热点词', 1.5)
    }
    if (!this.confirmObj.sort) {
      return message.error('请输入排序', 1.5)
    }
    if (!this.confirmObj.start) {
      return message.error('请输入开始日期', 1.5)
    }
    if (!this.confirmObj.end) {
      return message.error('请输入结束日期', 1.5)
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
        <header class={this.$style.header}>今日热点</header>

        <div class={this.$style.line}>
          <a-input placeholder={'搜索热点词'} onPressEnter={e => this.search(e.target.value)}/>

          <a-button type={'primary'} onClick={() => this.toggleConfirm('create')}>添加热点词</a-button>
        </div>

        <a-table columns={this.columns(h)} dataSource={this.data}
                 rowKey={record => record.hotWord}
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
          {this.confirmType !== 'delete' && <div class={this.$style.formItem}>
            <a-input value={this.confirmObj.hotWord} onChange={e => this.setConfirmObj('hotWord', e.target.value)}
                     placeholder={'热点词'}/>
          </div>}

          {this.confirmType !== 'delete' && <div class={this.$style.formItem}>
            <a-input value={this.confirmObj.sort} onChange={e => this.setConfirmObj('sort', e.target.value)}
                     placeholder={'排序'}/>
          </div>}

          {this.confirmType !== 'delete' && <div class={this.$style.formItem}>
            <a-input value={this.confirmObj.start} onChange={e => this.setConfirmObj('start', e.target.value)}
                     placeholder={'开始日期'}/>
          </div>}

          {this.confirmType !== 'delete' && <div class={this.$style.formItem}>
            <a-input value={this.confirmObj.end} onChange={e => this.setConfirmObj('end', e.target.value)}
                     placeholder={'结束日期'}/>
          </div>}

          {this.confirmType === 'delete' && <span class={this.$style.warnColor}>确定删除热点词？</span>}
        </a-modal>
      </div>
    )
  }
}
