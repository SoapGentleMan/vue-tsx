import Vue from 'vue'
import Component from 'vue-class-component'
import './components'
import { message } from 'ant-design-vue'

@Component({})
export default class Word extends Vue {
  data = [
    {
      searchWord: 'John Brown1',
      relatedWord: '2018-1-1',
      relation: '1'
    },
    {
      searchWord: 'John Brown12',
      relatedWord: '2018-1-1',
      relation: '0'
    },
    {
      searchWord: 'John Brown13',
      relatedWord: '2018-1-1',
      relation: '1'
    },
  ];

  loading: boolean = false;
  pn: number = 1;
  ps: number = 10;

  showConfirm: boolean = false;
  confirmType: string = '';
  confirmObj = {
    searchWord: '',
    relatedWord: '',
    relation: ''
  };

  searchValue: string = '';

  columns(h) {
    return [
      {
        title: '搜索词',
        dataIndex: 'searchWord',
      },
      {
        title: '关联词',
        dataIndex: 'relatedWord'
      },
      {
        title: '相关度',
        dataIndex: 'relation'
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
          title: '添加关联词',
          okText: '保存'
        }
      }
      case 'edit': {
        return {
          title: '编辑关联词',
          okText: '保存'
        }
      }
      case 'delete': {
        return {
          title: '删除关联词',
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
        searchWord: '',
        relatedWord: '',
        relation: ''
      } : {
        searchWord: data.searchWord,
        relatedWord: data.relatedWord,
        relation: data.relation
      }
    }
  }

  setConfirmObj(type, value) {
    this.$set(this.confirmObj, type, value);
  }

  doAction() {
    console.log(this.confirmObj);
    if (!this.confirmObj.searchWord) {
      return message.error('请输入搜索词', 1.5)
    }
    if (!this.confirmObj.relatedWord) {
      return message.error('请输入关联词', 1.5)
    }
    if (!this.confirmObj.relation) {
      return message.error('请输入关联度', 1.5)
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
        <header class={this.$style.header}>关联词管理</header>

        <div class={this.$style.line}>
          <a-input placeholder={'搜索关联词'} onPressEnter={e => this.search(e.target.value)}/>

          <a-button type={'primary'} onClick={() => this.toggleConfirm('create')}>添加关联词</a-button>
        </div>

        <a-table columns={this.columns(h)} dataSource={this.data}
                 rowKey={record => record.searchWord}
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
            <a-input value={this.confirmObj.searchWord} onChange={e => this.setConfirmObj('searchWord', e.target.value)}
                     placeholder={'搜索词'}/>
          </div>}

          {this.confirmType !== 'delete' && <div class={this.$style.formItem}>
            <a-input value={this.confirmObj.relatedWord} onChange={e => this.setConfirmObj('relatedWord', e.target.value)}
                     placeholder={'关联词'}/>
          </div>}

          {this.confirmType !== 'delete' && <div class={this.$style.formItem}>
            <a-input value={this.confirmObj.relation} onChange={e => this.setConfirmObj('relation', e.target.value)}
                     placeholder={'关联度'}/>
          </div>}

          {this.confirmType === 'delete' && <span class={this.$style.warnColor}>确定删除关联词？</span>}
        </a-modal>
      </div>
    )
  }
}
