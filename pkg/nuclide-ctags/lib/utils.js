'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getLineNumberForTag = exports.CTAGS_KIND_ICONS = exports.CTAGS_KIND_NAMES = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let getLineNumberForTag = exports.getLineNumberForTag = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (tag) {
    let { lineNumber, pattern } = tag;
    if (lineNumber) {
      lineNumber--; // ctags line numbers start at 1
    } else if (pattern != null) {
      // ctags does not escape regexps properly.
      // However, it should never create anything beyond /x/ or /^x$/.
      let exactMatch = false;
      if (pattern.startsWith('/') && pattern.endsWith('/')) {
        pattern = pattern.substr(1, pattern.length - 2);
        if (pattern.startsWith('^') && pattern.endsWith('$')) {
          pattern = pattern.substr(1, pattern.length - 2);
          exactMatch = true;
        }
      }
      try {
        // Search for the pattern in the file.
        const service = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getFileSystemServiceByNuclideUri)(tag.file);
        const contents = yield service.readFile(tag.file);
        const lines = contents.toString('utf8').split('\n');
        lineNumber = 0;
        for (let i = 0; i < lines.length; i++) {
          if (exactMatch ? lines[i] === pattern : lines[i].indexOf(pattern) !== -1) {
            lineNumber = i;
            break;
          }
        }
      } catch (e) {
        (0, (_log4js || _load_log4js()).getLogger)('nuclide-ctags').warn(`nuclide-ctags: Could not locate pattern in ${tag.file}`, e);
      }
    }

    return lineNumber;
  });

  return function getLineNumberForTag(_x) {
    return _ref.apply(this, arguments);
  };
})();

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Taken from http://ctags.sourceforge.net/FORMAT
const CTAGS_KIND_NAMES = exports.CTAGS_KIND_NAMES = {
  c: 'class',
  d: 'define',
  e: 'enum',
  f: 'function',
  F: 'file',
  g: 'enum',
  m: 'member',
  p: 'function',
  s: 'struct',
  t: 'typedef',
  u: 'union',
  v: 'var'
}; /**
    * Copyright (c) 2015-present, Facebook, Inc.
    * All rights reserved.
    *
    * This source code is licensed under the license found in the LICENSE file in
    * the root directory of this source tree.
    *
    * 
    * @format
    */

const CTAGS_KIND_ICONS = exports.CTAGS_KIND_ICONS = {
  c: 'icon-code',
  d: 'icon-quote',
  e: 'icon-quote',
  f: 'icon-zap',
  F: 'icon-file-binary',
  g: 'icon-quote',
  m: 'icon-zap',
  p: 'icon-zap',
  s: 'icon-code',
  t: 'icon-tag',
  u: 'icon-code',
  v: 'icon-code'
};