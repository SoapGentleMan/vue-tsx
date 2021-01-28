import {fetchTimeout} from '../fetch'

class Seed {
  getSeedList(options) {
    const {pn, ps, search} = options
    return fetchTimeout(`${SERVER}/admin/get_seed_list?page=${pn}&size=${ps}&search=${search}`)
  }

  createSeed(options) {
    const {url, country_code} = options
    return fetchTimeout(`${SERVER}/admin/add_seed`, {
      method: 'POST',
      body: {url, country_code}
    })
  }

  setSeedStatus(options) {
    const {id, act} = options
    return fetchTimeout(`${SERVER}/admin/set_seed_status`, {
      method: 'POST',
      body: {id, act}
    })
  }

  deleteSeed(options) {
    const {id} = options
    return fetchTimeout(`${SERVER}/admin/del_seed`, {
      method: 'POST',
      body: {id}
    })
  }
}

export default new Seed()
