import {fetchTimeout} from '../fetch'

class Account {
  login(username, password) {
    return fetchTimeout(`${SERVER}/login`, {
      method: 'POST',
      body: {
        username, password
      }
    })
  }

  logout() {
    return fetchTimeout(`${SERVER}/logout`, {
      method: 'POST'
    })
  }
}

export default new Account()
