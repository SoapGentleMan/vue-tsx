import {fetchTimeout} from '../fetch'

class Search {
  getHotWords(options) {
    const {pn, ps} = options
    return fetchTimeout(`${SERVER}/hot_words?page=${pn}&size=${ps}`)
  }

  getSearchConf() {
    return fetchTimeout(`${SERVER}/search_conf`)
  }

  getSearchResult(options) {
    return fetchTimeout(`${SERVER}/search`, {
      method: 'POST',
      body: options
    })
  }

  editDoc(options) {
    return fetchTimeout(`${SERVER}/admin/updateDoc`, {
      method: 'POST',
      body: options
    })
  }
}

export default new Search()
