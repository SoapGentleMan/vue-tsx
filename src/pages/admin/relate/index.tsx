import Vue from 'vue'
import Component from 'vue-class-component'
import './components'
import { message } from 'ant-design-vue'
import relate from '../../../lib/api/relate'

@Component({})
export default class Word extends Vue {
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
    search_word: '',
    rel_level: 0
  };
  searchValue: string = '';
  searchShowValue: string = '';

  created() {
    this.getRelateList()
  }

  columns(h) {
    return [
      {
        title: '关联词',
        dataIndex: 'text',
      },
      {
        title: '搜索词',
        dataIndex: 'search_word'
      },
      {
        title: '相关度',
        dataIndex: 'rel_level'
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

  getRelateList() {
    if (this.loading) {
      return
    }
    this.loading = true;
    return relate.getRelateList({
      pn: this.pn, ps: this.ps, search: this.searchValue
    }).then(data => {
      if (data.success === true) {
        this.data = data.relword_list;
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
    this.getRelateList()
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
        id: '',
        text: '',
        search_word: '',
        rel_level: '0.10'
      } : {
        id: data.id,
        text: data.text,
        search_word: data.search_word,
        rel_level: data.rel_level
      }
    }
  }

  setConfirmObj(type, value) {
    this.$set(this.confirmObj, type, value);
  }

  checkRelLevel(value) {
    value = +value;
    if (!value || value < 0 || value > 1) {
      return false
    }
    value = value + '';
    if (!value.match(/^(1|0|(0\.[0-9]{1,2}))$/)) {
      return false
    }
    return true
  }

  doAction() {
    if (!this.confirmObj.text && this.confirmType !== 'delete') {
      return message.error('请输入关联词', 1.5)
    }
    if (!this.confirmObj.search_word && this.confirmType !== 'delete') {
      return message.error('请输入搜索词', 1.5)
    }
    if (!this.confirmObj.rel_level && this.confirmType !== 'delete') {
      return message.error('请输入关联度', 1.5)
    }
    if (!this.checkRelLevel(this.confirmObj.rel_level) && this.confirmType !== 'delete') {
      return message.error('关联度为0-1之间浮点数，最多两位小数', 1.5)
    }
    if (this.confirmLoading) {
      return
    }
    this.confirmLoading = true;
    let fetchPromise;
    let options;
    switch (this.confirmType) {
      case 'create': {
        fetchPromise = relate.createRelate;
        options = {
          text: this.confirmObj.text,
          search_word: this.confirmObj.search_word,
          rel_level: +this.confirmObj.rel_level
        }
        break
      }
      case 'edit': {
        fetchPromise = relate.updateRelate;
        options = {
          id: this.confirmObj.id,
          text: this.confirmObj.text,
          search_word: this.confirmObj.search_word,
          rel_level: +this.confirmObj.rel_level
        }
        break
      }
      case 'delete': {
        fetchPromise = relate.deleteRelate;
        options = {
          id: this.confirmObj.id
        }
        break
      }
    }
    fetchPromise = fetchPromise.bind(relate);
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

  search(value) {
    this.searchValue = value;
    this.changePage(1)
  }

  render(h) {
    return (
      <div>
        <header class={this.$style.header}>关联词管理</header>

        <div class={this.$style.line}>
          <a-input placeholder={'搜索关联词'} value={this.searchShowValue}
                   onPressEnter={e => this.search(e.target.value)}
                   onChange={e => this.searchShowValue = e.target.value}/>

          <a-button type={'primary'} onClick={() => this.toggleConfirm('create')}>添加关联词</a-button>
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
                       placeholder={'关联词'}/>
            </div>}

            {this.confirmType !== 'delete' && <div class={this.$style.formItem}>
              <a-input value={this.confirmObj.search_word} onChange={e => this.setConfirmObj('search_word', e.target.value)}
                       placeholder={'搜索词'}/>
            </div>}

            {this.confirmType !== 'delete' && <div class={this.$style.formItem}>
              <a-input value={this.confirmObj.rel_level} onChange={e => this.setConfirmObj('rel_level', e.target.value)}
                       placeholder={'关联度'}/>
            </div>}

            {this.confirmType === 'delete' && <span class={this.$style.warnColor}>确定删除关联词？</span>}
          </a-spin>
        </a-modal>
      </div>
    )
  }
}
