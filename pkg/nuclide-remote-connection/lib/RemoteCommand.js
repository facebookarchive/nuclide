'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.readFile = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

/**
 * This function receives a connection, timeout and a file path and returns the
 * remote file's content.
 */
let readFile = exports.readFile = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (connection, timeout, filePath) {
    return new Promise(function (resolve, reject) {
      let sftpTimer = setTimeout(function () {
        sftpTimer = null;
        resolve({ type: 'timeout' });
      }, timeout);

      connection.sftp(function (error, sftp) {
        if (sftpTimer == null) {
          // Just exit since timer already triggered and this execution timed out.
          return;
        }
        clearTimeout(sftpTimer);
        if (error) {
          resolve({ type: 'fail-to-start-connection', error });
          return;
        }
        sftp.readFile(filePath, function (sftpError, data) {
          sftp.end();
          if (sftpError) {
            resolve({ type: 'fail-to-transfer-data', error: sftpError });
            return;
          }
          resolve({ type: 'success', data });
          return;
        });
      });
    });
  });

  return function readFile(_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
})(); /**
       * Copyright (c) 2015-present, Facebook, Inc.
       * All rights reserved.
       *
       * This source code is licensed under the license found in the LICENSE file in
       * the root directory of this source tree.
       *
       * 
       * @format
       */

var _ssh;

function _load_ssh() {
  return _ssh = require('ssh2');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }