import {fetchTimeout} from '../fetch'

class Search {
  getHotWords(options) {
    const {pn, ps} = options
    return fetchTimeout(`${SERVER}//hot_words?page=${pn}&size=${ps}`)
  }

  getSearchConf() {
    return fetchTimeout(`${SERVER}/search_conf`)
  }

  searchContent(options) {
    return fetchTimeout(`${SERVER}/search`, {
      method: 'POST',
      body: options
    })
  }
}

export default new Search()
