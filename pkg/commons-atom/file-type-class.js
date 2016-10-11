Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.default = fileTypeClass;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _fsPlus;

function _load_fsPlus() {
  return _fsPlus = _interopRequireDefault(require('fs-plus'));
}

var _commonsNodeNuclideUri;

function _load_commonsNodeNuclideUri() {
  return _commonsNodeNuclideUri = _interopRequireDefault(require('../commons-node/nuclideUri'));
}

function fileTypeClass(filename) {
  var typeClass = undefined;
  var ext = (_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.extname(filename);

  if ((_fsPlus || _load_fsPlus()).default.isReadmePath(filename)) {
    typeClass = 'icon-book';
  } else if ((_fsPlus || _load_fsPlus()).default.isCompressedExtension(ext)) {
    typeClass = 'icon-file-zip';
  } else if ((_fsPlus || _load_fsPlus()).default.isImageExtension(ext)) {
    typeClass = 'icon-file-media';
  } else if ((_fsPlus || _load_fsPlus()).default.isPdfExtension(ext)) {
    typeClass = 'icon-file-pdf';
  } else if ((_fsPlus || _load_fsPlus()).default.isBinaryExtension(ext)) {
    typeClass = 'icon-file-binary';
  } else {
    typeClass = 'icon-file-text';
  }

  return typeClass;
}

module.exports = exports.default;