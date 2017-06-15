'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.compress = compress;
exports.decompress = decompress;

var _zlib = _interopRequireDefault(require('zlib'));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function compress(data) {
  return _zlib.default.deflateSync(data);
} /**
   * Copyright (c) 2015-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the license found in the LICENSE file in
   * the root directory of this source tree.
   *
   * 
   * @format
   */

function decompress(data) {
  return _zlib.default.inflateSync(data).toString('utf-8');
}