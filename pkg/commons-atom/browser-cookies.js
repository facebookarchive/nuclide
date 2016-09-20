Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _electron2;

function _electron() {
  return _electron2 = _interopRequireDefault(require('electron'));
}

var remote = (_electron2 || _electron()).default.remote;

(0, (_assert2 || _assert()).default)(remote != null);

exports.default = {
  getCookies: function getCookies(domain) {
    return new Promise(function (resolve, reject) {
      // $FlowFixMe: Add types for electron$WebContents
      remote.getCurrentWindow().webContents.session.cookies.get({
        domain: domain
      }, function (error, cookies) {
        if (error) {
          reject(error);
        } else {
          (function () {
            var cookieMap = {};
            cookies.forEach(function (cookie) {
              cookieMap[cookie.name] = cookie.value;
            });
            resolve(cookieMap);
          })();
        }
      });
    });
  },

  setCookie: function setCookie(url, domain, name, value) {
    return new Promise(function (resolve, reject) {
      // $FlowFixMe: Add types for electron$WebContents
      remote.getCurrentWindow().webContents.session.cookies.set({
        url: url,
        domain: domain,
        name: name,
        value: value
      }, function (error) {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }
};
module.exports = exports.default;