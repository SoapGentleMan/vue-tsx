import {fetchTimeout} from '../fetch'

class Param {
  getConfList(options) {
    const {pn, ps, search} = options
    return fetchTimeout(`${SERVER}/admin/get_conf_list?page=${pn}&size=${ps}&search=${search}`)
  }

  updateConf(options) {
    const {name, value} = options
    return fetchTimeout(`${SERVER}/admin/update_conf`, {
      method: 'POST',
      body: {name, value}
    })
  }
}

export default new Param()
