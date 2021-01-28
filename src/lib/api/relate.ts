import {fetchTimeout} from '../fetch'

class Relate {
  getRelateList(options) {
    const {pn, ps, search} = options
    return fetchTimeout(`${SERVER}/admin/get_relword_list?page=${pn}&size=${ps}&search=${search}`)
  }

  createRelate(options) {
    const {text, search_word, rel_level} = options
    return fetchTimeout(`${SERVER}/admin/save_relword`, {
      method: 'POST',
      body: {text, search_word, rel_level}
    })
  }

  updateRelate(options) {
    const {id, text, search_word, rel_level} = options
    return fetchTimeout(`${SERVER}/admin/save_relword`, {
      method: 'POST',
      body: {id, text, search_word, rel_level}
    })
  }

  deleteRelate(options) {
    const {id} = options
    return fetchTimeout(`${SERVER}/admin/del_relword`, {
      method: 'POST',
      body: {id}
    })
  }
}

export default new Relate()
