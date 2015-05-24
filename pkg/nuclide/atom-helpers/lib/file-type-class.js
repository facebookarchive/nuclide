'use babel';
/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
/* @flow */

var fs = require('fs-plus');
var path = require('path');

var CODE_EXTENSIONS = {
  '.coffee': true,
  '.cpp': true,
  '.css': true,
  '.go': true,
  '.h': true,
  '.hh': true,
  '.hpp': true,
  '.html': true,
  '.java': true,
  '.js': true,
  '.json': true,
  '.less': true,
  '.m': true,
  '.mm': true,
  '.php': true,
  '.py': true,
  '.rb': true,
  '.sh': true,
  '.swift': true,
  '.xml': true,
  '.yaml': true,
};

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
  } else if (CODE_EXTENSIONS.hasOwnProperty(ext)) {
    typeClass = 'icon-file-code';
  } else {
    typeClass = 'icon-file-text';
  }

  return typeClass;
}

module.exports = fileTypeClass;
