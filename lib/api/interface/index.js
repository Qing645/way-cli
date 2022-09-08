const axios = require('../api.request');

const getRepoList = params => {
  //获取gitlab项目分支信息
  return axios.request({ 
    url: 'https://test.tailingcloud.cn:8086/api/v4/projects/79/repository/branches', 
    params,
    method: 'get'
  })
}

module.exports = {
  getRepoList
}