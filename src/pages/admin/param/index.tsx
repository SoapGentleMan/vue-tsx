import Vue from 'vue'
import Component from 'vue-class-component'
import './components'
import { message } from 'ant-design-vue'

@Component({})
export default class Param extends Vue {
  data = [
    {
      config: 'John Brown23',
      data: '2018-1-1',
      desc: '1',
      update: '1',
      editor: 'ww'
    },
    {
      config: 'John Brown22',
      data: '2018-1-1',
      desc: '1',
      update: '1',
      editor: 'ww2'
    },
    {
      config: 'John Brown12',
      data: '2018-1-1',
      desc: '1',
      update: '1',
      editor: 'ww3'
    }
  ];

  loading: boolean = false;
  pn: number = 1;
  ps: number = 10;

  showConfirm: boolean = false;
  confirmType: string = '';
  confirmObj = {
    data: ''
  };

  columns(h) {
    return [
      {
        title: '配置项',
        dataIndex: 'config',
      },
      {
        title: '数据',
        dataIndex: 'data'
      },
      {
        title: '备注',
        dataIndex: 'desc'
      },
      {
        title: '更新时间',
        dataIndex: 'update'
      },
      {
        title: '编辑人',
        dataIndex: 'editor'
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

  changePage(pn) {
    this.pn = pn
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
        data: data.data
      }
    }
  }

  setConfirmObj(type, value) {
    this.$set(this.confirmObj, type, value);
  }

  doAction() {
    console.log(this.confirmObj);
    if (!this.confirmObj.data) {
      return message.error('请输入数据')
    }
    this.toggleConfirm('')
  }

  render(h) {
    return (
      <div>
        <header class={this.$style.header}>参数设置</header>

        <a-table columns={this.columns(h)} dataSource={this.data}
                 rowKey={record => record.config}
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
          <div class={this.$style.formItem}>
            <a-input value={this.confirmObj.data} onChange={e => this.setConfirmObj('data', e.target.value)}
                     placeholder={'数据'}/>
          </div>
        </a-modal>
      </div>
    )
  }
}
