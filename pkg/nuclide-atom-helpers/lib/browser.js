

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

// This function is abstracted in case the (undocumented) Atom API beneath ever changes.
function getBrowserWindow() {
  return atom.getCurrentWindow();
}

module.exports = {

  getCookies: function getCookies(domain) {
    return new Promise(function (resolve, reject) {
      getBrowserWindow().webContents.session.cookies.get({
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
      getBrowserWindow().webContents.session.cookies.set({
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