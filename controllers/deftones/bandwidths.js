/**
 * Created by nihaitong on 2017/8/13.
 */

var mysql = require('../../utils/mysql');
const TABLE = 'bandwidths';

var strToList = (str) => {
  let resStr = str.substr(1, str.length-2);
  return resStr.split(',');
};

module.exports = {
  bandwidth: async (ctx) => {
    let provider = ctx.params.provider;
    if (provider === ''){
      ctx.response.body = {
        'message': 'No provider'
      }
    }
    else{
      let date = ctx.request.body.date;
      let domains = ctx.request.body.domains;
      let sql = 'SELECT * FROM ' + TABLE + ' WHERE provider=\"' + provider + '\" AND date=\"' + date + '\" AND domain in (\"' + domains.join('\",\"') + '\")';
      let ret = await mysql.query(sql, 'deftones');
      let res = {};
      for (let x in ret){
        if (!(ret[x]['domain'] in res)) {
          res[ret[x]['domain']] = {};
          res[ret[x]['domain']][[ret[x]['area']]] = [strToList(ret[x]['bandwidth'])];
        }
        else {
          if (!(ret[x]['area'] in res[ret[x]['domain']])) {
            res[ret[x]['domain']][[ret[x]['area']]] = [strToList(ret[x]['bandwidth'])];
          }
          else {
            res[ret[x]['domain']][[ret[x]['area']]].push(strToList(ret[x]['bandwidth']));
          }
        }
      }
      ctx.response.body = res;
    }
  }
}