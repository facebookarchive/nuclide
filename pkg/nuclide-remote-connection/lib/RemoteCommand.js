"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.readFile = readFile;

function _ssh() {
  const data = require("ssh2");

  _ssh = function () {
    return data;
  };

  return data;
}

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 *  strict
 * @format
 */

/**
 * This function receives a connection, timeout and a file path and returns the
 * remote file's content.
 */
async function readFile(connection, timeout, filePath) {
  return new Promise((resolve, reject) => {
    let sftpTimer = setTimeout(() => {
      sftpTimer = null;
      resolve({
        type: 'timeout'
      });
    }, timeout);
    connection.sftp((error, sftp) => {
      if (sftpTimer == null) {
        // Just exit since timer already triggered and this execution timed out.
        return;
      }

      clearTimeout(sftpTimer);

      if (error) {
        resolve({
          type: 'fail-to-start-connection',
          error
        });
        return;
      }

      sftp.readFile(filePath, (sftpError, data) => {
        sftp.end();

        if (sftpError) {
          resolve({
            type: 'fail-to-transfer-data',
            error: sftpError
          });
          return;
        }

        resolve({
          type: 'success',
          data
        });
        return;
      });
    });
  });
}