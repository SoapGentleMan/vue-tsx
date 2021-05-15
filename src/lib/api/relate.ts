import {fetchTimeout} from '../fetch'

class Relate {
  getRelateList(options) {
    const {pn, ps, search} = options
    return fetchTimeout(`${SERVER}/admin/get_relword_list?page=${pn}&size=${ps}&search=${search}`)
  }

  createRelate(options) {
    return fetchTimeout(`${SERVER}/admin/save_relword`, {
      method: 'POST',
      body: options
    })
  }

  updateRelate(options) {
    return fetchTimeout(`${SERVER}/admin/save_relword`, {
      method: 'POST',
      body: options
    })
  }

  deleteRelate(options) {
    return fetchTimeout(`${SERVER}/admin/del_relword`, {
      method: 'POST',
      body: options
    })
  }
}

export default new Relate()
