var request = require('sync-request');

class SyncHttpService {

  constructor(baseUrl) {
    this.baseUrl = baseUrl;
    this.authHeadder = null;
  }

  setAuth(url, user) {
    const res = request('POST', this.baseUrl + url, { json: user });
    if (res.statusCode == 201) {
      var payload = JSON.parse(res.getBody('utf8'));
      if (payload.success) {
        this.authHeadder = { Authorization: 'bearer ' + payload.token, };
        return true;
      }
    }

    this.authHeadder = null;
    return false;
  }

  clearAuth() {
    this.authHeadder = null;
  }

  get(url) {
    var returnedObj = null;
    var res = request('GET', this.baseUrl + url, { headers: this.authHeadder });
    if (res.statusCode < 300) {
      returnedObj = JSON.parse(res.getBody('utf8'));
    }

    return returnedObj;
  }

  post(url, obj) {
    var returnedObj = null;
    var res = request('POST', this.baseUrl + url, { json: obj, headers: this.authHeadder });
    if (res.statusCode < 300) {
      returnedObj = JSON.parse(res.getBody('utf8'));
    }

    return returnedObj;
  }

  delete(url) {
    var res = request('DELETE', this.baseUrl + url, { headers: this.authHeadder });
    return res.statusCode;
  }
}

module.exports = SyncHttpService;