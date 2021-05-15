import {fetchTimeout} from '../fetch'

class Param {
  getConfList(options) {
    const {pn, ps, search} = options
    return fetchTimeout(`${SERVER}/admin/get_conf_list?page=${pn}&size=${ps}&search=${search}`)
  }

  updateConf(options) {
    return fetchTimeout(`${SERVER}/admin/update_conf`, {
      method: 'POST',
      body: options
    })
  }
}

export default new Param()
