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

var _assert;

function _load_assert() {
  return _assert = _interopRequireDefault(require('assert'));
}

var _electron;

function _load_electron() {
  return _electron = _interopRequireDefault(require('electron'));
}

var remote = (_electron || _load_electron()).default.remote;

(0, (_assert || _load_assert()).default)(remote != null);

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