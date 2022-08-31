const axios = require('../api.request');

const getRepoList = params => {
  return axios.request({  //定义远程仓库
    url: 'https://api.github.com/users/shenyWill/repos',
    params,
    method: 'get'
  })
}

module.exports = {
  getRepoList
}