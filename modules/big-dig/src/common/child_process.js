'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.execFile = execFile;

var _child_process = _interopRequireDefault(require('child_process'));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function execFile(file, args, options) {
  return new Promise((resolve, reject) => {
    _child_process.default.execFile(file, args, options, (error, stdout, stderr) => {
      if (error != null) {
        reject(error);
        return;
      }

      resolve();
    });
  });
} /**
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