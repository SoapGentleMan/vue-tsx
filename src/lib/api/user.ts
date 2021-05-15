import {fetchTimeout} from '../fetch'

class User {
  getUserList(options) {
    const {pn, ps, search} = options
    return fetchTimeout(`${SERVER}/admin/get_user_list?page=${pn}&size=${ps}&search=${search}`)
  }

  createUser(options) {
    return fetchTimeout(`${SERVER}/admin/add_user`, {
      method: 'POST',
      body: options
    })
  }

  updateUser(options) {
    return fetchTimeout(`${SERVER}/admin/update_user`, {
      method: 'POST',
      body: options
    })
  }

  calcExpireDate(options) {
    const {username, level} = options
    return fetchTimeout(`${SERVER}/admin/calc_expire_date?username=${username}&level=${level}`)
  }

  deleteUser(options) {
    return fetchTimeout(`${SERVER}/admin/del_user`, {
      method: 'POST',
      body: options
    })
  }

  resetUserPswd(options) {
    return fetchTimeout(`${SERVER}/reset_user_pswd`, {
      method: 'POST',
      body: options
    })
  }
}

export default new User()
