import {fetchTimeout} from '../fetch'

class Seed {
  getSeedList(options) {
    const {pn, ps, search} = options
    return fetchTimeout(`${SERVER}/admin/get_seed_list?page=${pn}&size=${ps}&search=${search}`)
  }

  createSeed(options) {
    return fetchTimeout(`${SERVER}/admin/add_seed`, {
      method: 'POST',
      body: options
    })
  }

  setSeedStatus(options) {
    return fetchTimeout(`${SERVER}/admin/set_seed_status`, {
      method: 'POST',
      body: options
    })
  }

  deleteSeed(options) {
    return fetchTimeout(`${SERVER}/admin/del_seed`, {
      method: 'POST',
      body: options
    })
  }
}

export default new Seed()
