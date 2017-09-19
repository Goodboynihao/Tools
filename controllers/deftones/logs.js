/**
 * Created by nihaitong on 2017/8/13.
 */

var mysql = require('../../utils/mysql');
var log_util = require('../../utils/log_util');
const TABLE = 'downloads';

module.exports = {
  link: async (ctx) => {
    let provider = ctx.params.provider;
    if (provider === ''){
      ctx.response.body = {
        'message': 'No provider'
      }
    }
    else{
      let domains = ctx.request.body.domains;
      let startTime = ctx.request.body.startTime;
      let endTime = ctx.request.body.endTime;
      if (domains === undefined || startTime === undefined || endTime === undefined){
        ctx.response.body = {
          'message': 'Parameters Error!'
        }
        return;
      }
      let sql = 'SELECT domain,time,area FROM ' + TABLE + ' WHERE log=1 AND provider=\"' + provider + '\" AND time BETWEEN \"' + startTime + '\" AND \"' + endTime + '\" AND domain in (\"' + domains.join('\",\"') + '\")';
      let ret = await mysql.query(sql, 'deftones');
      let res = {};
      for (let x in ret){
        if (!(ret[x]['domain'] in res)) {
          res[ret[x]['domain']] = {};
          res[ret[x]['domain']][[ret[x]['area']]] = [log_util.download_url(provider, ret[x]['domain'], ret[x]['time'])];
        }
        else {
          if (!(ret[x]['area'] in res[ret[x]['domain']])) {
            res[ret[x]['domain']][[ret[x]['area']]] = [log_util.download_url(provider, ret[x]['domain'], ret[x]['time'])];
          }
          else {
            res[ret[x]['domain']][[ret[x]['area']]].push([log_util.download_url(provider, ret[x]['domain'], ret[x]['time'])]);
          }
        }
      }
      ctx.response.body = res;
    }
  }
}