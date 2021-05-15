import {fetchTimeout} from '../fetch'

class SearchAdmin {
  getSearchDirection() {
    return fetchTimeout(`${SERVER}/admin/get_all_search_direction`)
  }
}

export default new SearchAdmin()
