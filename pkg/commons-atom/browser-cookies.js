'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _electron = _interopRequireDefault(require('electron'));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const remote = _electron.default.remote;

if (!(remote != null)) {
  throw new Error('Invariant violation: "remote != null"');
}

exports.default = {
  getCookies: function (domain) {
    return new Promise((resolve, reject) => {
      // $FlowFixMe: Add types for electron$WebContents
      remote.getCurrentWindow().webContents.session.cookies.get({
        domain: domain
      }, (error, cookies) => {
        if (error) {
          reject(error);
        } else {
          const cookieMap = {};
          cookies.forEach(cookie => {
            cookieMap[cookie.name] = cookie.value;
          });
          resolve(cookieMap);
        }
      });
    });
  },
  setCookie: function (url, domain, name, value) {
    return new Promise((resolve, reject) => {
      // $FlowFixMe: Add types for electron$WebContents
      remote.getCurrentWindow().webContents.session.cookies.set({
        url: url,
        domain: domain,
        name: name,
        value: value
      }, error => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }
};
module.exports = exports['default'];