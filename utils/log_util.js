/**
 * Created by nihaitong on 2017/8/13.
 */
const HOST = 'http://10.200.20.32:8889/';

module.exports = {
  download_url: (provider, domain, time) => {
    if (provider === 'aliyun'){
      return HOST + provider + '/' + domain + '/' + time.substr(0,4) + '-' + time.substr(4,2) + '-' + time.substr(6,2) + '-' + time.substr(8,4) + '00.gz';
    }
  }
};
