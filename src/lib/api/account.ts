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

  getUserStatus() {
    return fetchTimeout(`${SERVER}/user_profile`)
  }

  resetUserPswd(password, passwordNew) {
    return fetchTimeout(`${SERVER}/reset_user_pswd`, {
      method: 'POST',
      body: {password_old: password, password: passwordNew}
    })
  }
}

export default new Account()
