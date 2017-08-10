'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.tempfile = tempfile;

var _fs = _interopRequireDefault(require('fs'));

var _temp;

function _load_temp() {
  return _temp = _interopRequireDefault(require('temp'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @return path to a temporary file. The caller is responsible for cleaning up
 *     the file.
 */
/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 * @format
 */

function tempfile(options) {
  return new Promise((resolve, reject) => {
    (_temp || _load_temp()).default.open(options, (err, info) => {
      if (err) {
        reject(err);
      } else {
        _fs.default.close(info.fd, closeErr => {
          if (closeErr) {
            reject(closeErr);
          } else {
            resolve(info.path);
          }
        });
      }
    });
  });
}