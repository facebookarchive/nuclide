function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _fsPlus2;

function _fsPlus() {
  return _fsPlus2 = _interopRequireDefault(require('fs-plus'));
}

var _path2;

function _path() {
  return _path2 = _interopRequireDefault(require('path'));
}

function fileTypeClass(filename) {
  var typeClass = undefined;
  var ext = (_path2 || _path()).default.extname(filename);

  if ((_fsPlus2 || _fsPlus()).default.isReadmePath(filename)) {
    typeClass = 'icon-book';
  } else if ((_fsPlus2 || _fsPlus()).default.isCompressedExtension(ext)) {
    typeClass = 'icon-file-zip';
  } else if ((_fsPlus2 || _fsPlus()).default.isImageExtension(ext)) {
    typeClass = 'icon-file-media';
  } else if ((_fsPlus2 || _fsPlus()).default.isPdfExtension(ext)) {
    typeClass = 'icon-file-pdf';
  } else if ((_fsPlus2 || _fsPlus()).default.isBinaryExtension(ext)) {
    typeClass = 'icon-file-binary';
  } else {
    typeClass = 'icon-file-text';
  }

  return typeClass;
}

module.exports = fileTypeClass;