/**
 * Created by nihaitong on 2017/7/10.
 */

var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
const TESTURL = 'mongodb://10.200.20.23:27017/fusiontester',
      SSLCERTURL = 'mongodb://10.200.20.23:27118/fusionsslcert',
      LINEURL = 'mongodb://10.200.20.30:7001/fusionline',
      LINECOVER = 'mongodb://10.200.20.23:27017/fusionlinecover',
      FILINGURL = 'mongodb://10.200.20.30:7001/fusiondomain',
      DOMAINURL = 'mongodb://10.200.20.23:27118/fusiondomain',
      COLLINE = 'line_v4',
      COLFILING = 'filing_user_domain',
      COLDOMAIN = 'domainInfo',
      COLTEST = 'mtasks',
      COLSSLCERTORDER = 'order',
      COLSSLCERTCERT = 'sslcert';


var find = (condition, fields, db, col) => {
  return new Promise( (resolve, reject)=> {
    MongoClient.connect(db, function (err, db) {
      assert.equal(null, err);
      if (fields === {}){
        db.collection(col).find(condition).toArray(function (err, result) {
          assert.equal(err, null);
          resolve(result);
        })
      }
      else{
        db.collection(col).find(condition, fields).toArray(function (err, result) {
          assert.equal(err, null);
          resolve(result);
        })
      }
    });
  })
}

var aggregate = (condition, db, col) => {
  return new Promise( (resolve, reject)=> {
    MongoClient.connect(db, function (err, db) {
      assert.equal(null, err);
      db.collection(col).aggregate(condition).toArray(function (err, result) {
        assert.equal(err, null);
        resolve(result);
      })
    });
  })
}


module.exports = {
  find: {
    line: (condition, fields = {}) => {
      return find(condition, fields, LINEURL, COLLINE);
    },
    filing: (condition, fields = {}) => {
      return find(condition, fields, FILINGURL, COLFILING);
    },
    domain: (condition, fields = {}) => {
      return find(condition, fields, DOMAINURL, COLDOMAIN);
    }
  },
  aggregate: {
    domainTest: (condition)=> {
      return aggregate(condition, TESTURL, COLTEST);
    },
    sslcertOrder: (condition)=> {
      return aggregate(condition, SSLCERTURL, COLSSLCERTORDER);
    },
    sslcertCert: (condition)=> {
      return aggregate(condition, SSLCERTURL, COLSSLCERTCERT);
    },
    domain: (condition)=> {
      return aggregate(condition, DOMAINURL, COLDOMAIN);
    }
  }
};


