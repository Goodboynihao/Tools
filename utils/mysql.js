/**
 * Created by nihaitong on 2017/8/13.
 */
var mysql = require('mysql');
var assert = require('assert');
var db = require('../config/db');

var query_db = (sql, con) => {
  return new Promise( (resolve, reject)=> {
    con.query(sql, function (err, result) {
      assert.equal(err, null);
      resolve(result);
    })
  })
}

module.exports = {
  query: async (sql, db_name)=>{
    var con = mysql.createConnection(db['mysql_config'][db_name]);
    con.connect();
    let res = await query_db(sql, con);
    con.end();
    return res;
  },
  insert: async (sql, db_name)=>{
    var con = mysql.createConnection(db['mysql_config'][db_name]);
    con.connect();
    let res = await query_db(sql, con);
    con.end();
    return res;
  }
}