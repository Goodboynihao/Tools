/**
 * Created by nihaitong on 2017/8/13.
 */

var mysql = require('../../utils/mysql');
const TABLE = 'domains';

module.exports = {
  domain: async (ctx) => {
    let provider = ctx.params.provider;
    if (provider === ''){
      ctx.response.body = {
        'message': 'No provider'
      }
    }
    else{
      let sql = 'SELECT domain FROM ' + TABLE + ' WHERE provider=\"' + provider + '\"';
      let ret = await mysql.query(sql, 'deftones');
      let res = [];
      for (let x in ret){
        res.push(ret[x]['domain']);
      }
      ctx.response.body = res;
    }
  }
}