import {fetchTimeout} from '../fetch'

class Hot {
  getHotList(options) {
    const {pn, ps, search} = options
    return fetchTimeout(`${SERVER}/admin/get_hotword_list?page=${pn}&size=${ps}&search=${search}`)
  }

  createHot(options) {
    return fetchTimeout(`${SERVER}/admin/save_hotword`, {
      method: 'POST',
      body: options
    })
  }

  updateHot(options) {
    return fetchTimeout(`${SERVER}/admin/save_hotword`, {
      method: 'POST',
      body: options
    })
  }

  deleteHot(options) {
    return fetchTimeout(`${SERVER}/admin/del_hotword`, {
      method: 'POST',
      body: options
    })
  }

  moveHot(type, options) {
    return fetchTimeout(`${SERVER}/admin/hotword_move_${type}`, {
      method: 'POST',
      body: options
    })
  }
}

export default new Hot()
