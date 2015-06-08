'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var fs = require('fs-plus');
var path = require('path');

function fileTypeClass(filename: string): string {
  var typeClass;
  var ext = path.extname(filename);

  if (fs.isReadmePath(filename)) {
    typeClass = 'icon-book';
  } else if (fs.isCompressedExtension(ext)) {
    typeClass = 'icon-file-zip';
  } else if (fs.isImageExtension(ext)) {
    typeClass = 'icon-file-media';
  } else if (fs.isPdfExtension(ext)) {
    typeClass = 'icon-file-pdf';
  } else if (fs.isBinaryExtension(ext)) {
    typeClass = 'icon-file-binary';
  } else {
    typeClass = 'icon-file-text';
  }

  return typeClass;
}

module.exports = fileTypeClass;
