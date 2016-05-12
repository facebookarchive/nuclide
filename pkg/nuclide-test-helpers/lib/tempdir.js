Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.mkdir = mkdir;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _temp2;

function _temp() {
  return _temp2 = _interopRequireDefault(require('temp'));
}

// Automatically track and cleanup files at exit.
var tempWithAutoCleanup = (_temp2 || _temp()).default.track();

/**
 * Creates a temporary directory with the given name.
 */

function mkdir(dirname) {
  return new Promise(function (resolve, reject) {
    tempWithAutoCleanup.mkdir(dirname, function (err, dirPath) {
      if (err) {
        reject(err);
      } else {
        resolve(dirPath);
      }
    });
  });
}