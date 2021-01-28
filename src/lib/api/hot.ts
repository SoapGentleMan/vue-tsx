import {fetchTimeout} from '../fetch'

class Hot {
  getHotList(options) {
    const {pn, ps, search} = options
    return fetchTimeout(`${SERVER}/admin/get_hotword_list?page=${pn}&size=${ps}&search=${search}`)
  }

  createHot(options) {
    const {text, start_date, end_date} = options
    return fetchTimeout(`${SERVER}/admin/save_hotword`, {
      method: 'POST',
      body: {text, start_date, end_date}
    })
  }

  updateHot(options) {
    const {id, text, start_date, end_date} = options
    return fetchTimeout(`${SERVER}/admin/save_hotword`, {
      method: 'POST',
      body: {id, text, start_date, end_date}
    })
  }

  deleteHot(options) {
    const {id} = options
    return fetchTimeout(`${SERVER}/admin/del_hotword`, {
      method: 'POST',
      body: {id}
    })
  }
}

export default new Hot()
