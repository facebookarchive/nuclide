Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.compress = compress;
exports.decompress = decompress;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _zlib2;

function _zlib() {
  return _zlib2 = _interopRequireDefault(require('zlib'));
}

function compress(data) {
  return (_zlib2 || _zlib()).default.deflateSync(data);
}

function decompress(data) {
  return (_zlib2 || _zlib()).default.inflateSync(data).toString('utf-8');
}