'use babel';
/* @flow */

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

  getCookies(domain: string): Promise<{[key: string]: string}> {
    return new Promise((resolve, reject) => {
      getBrowserWindow().webContents.session.cookies.get({
        domain: domain,
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

  setCookie(url: string, domain: string, name: string, value: string): Promise<void> {
    return new Promise((resolve, reject) => {
      getBrowserWindow().webContents.session.cookies.set({
        url: url,
        domain: domain,
        name: name,
        value: value,
      }, error => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  },

};
