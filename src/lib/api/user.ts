import {fetchTimeout} from '../fetch'

class User {
  getUserList(options) {
    const {pn, ps, search} = options
    return fetchTimeout(`${SERVER}/admin/get_user_list?page=${pn}&size=${ps}&search=${search}`)
  }

  createUser(options) {
    const {username, password, level} = options
    return fetchTimeout(`${SERVER}/admin/add_user`, {
      method: 'POST',
      body: {username, password, level}
    })
  }

  updateUser(options) {
    const {username, level, expire_date} = options
    return fetchTimeout(`${SERVER}/admin/update_user`, {
      method: 'POST',
      body: {username, level, expire_date}
    })
  }

  calcExpireDate(options) {
    const {username, level} = options
    return fetchTimeout(`${SERVER}/admin/calc_expire_date?username=${username}&level=${level}`)
  }

  deleteUser(options) {
    const {username} = options
    return fetchTimeout(`${SERVER}/admin/del_user`, {
      method: 'POST',
      body: {username}
    })
  }

  resetUserPswd(options) {
    const {username, password} = options
    return fetchTimeout(`${SERVER}/reset_user_pswd`, {
      method: 'POST',
      body: {username, password}
    })
  }
}

export default new User()
