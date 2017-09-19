/**
 * Created by nihaitong on 2017/8/13.
 */

var mysql = require('../../utils/mysql');
const TABLE = 'tests';


module.exports = {
  test: async (ctx) => {
    let date = ctx.request.body.date || '';
    let provider = ctx.request.body.provider || '';
    let comment = ctx.request.body.comment || '';
    if (date === '' || provider === '' || comment === ''){
      ctx.response.body = {
        "message": "参数错误"
      }
      return;
    }
    let sql = 'INSERT INTO ' + TABLE + ' (provider, date, comment, createtime) VALUES(\"' + provider + '\",\"' + date + '\",\"' + comment + '\",\"' + new Date().toLocaleString() + '\")';
    let ret = await mysql.query(sql, 'deftones');
    ctx.response.body = {
      code: 200
    };
  },
  query: async (ctx) => {
    let date = ctx.request.body.date || '';
    let provider = ctx.request.body.provider || '';
    let comment = ctx.request.body.comment || '';
    if (date === '' || provider === ''){
      ctx.response.body = {
        "message": "参数错误"
      }
      return;
    }
    let sql = 'SELECT provider,date,comment,result,createtime FROM ' + TABLE + ' WHERE date=\"' + date + '\"';
    if (provider !== 'all'){
      sql = sql + ' AND provider=\"' + provider + '\"';
    }
    if (comment !== ''){
      sql = sql + ' AND comment=\"' + comment + '\"';
    }
    console.log(sql);
    let ret = await mysql.query(sql, 'deftones');
    ctx.response.body = {
      code: 200,
      result: ret
    };
  }
}