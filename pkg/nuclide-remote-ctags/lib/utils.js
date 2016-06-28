Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var getLineNumberForTag = _asyncToGenerator(function* (tag) {
  var lineNumber = tag.lineNumber;
  var pattern = tag.pattern;

  if (lineNumber) {
    lineNumber--; // ctags line numbers start at 1
  } else if (pattern != null) {
      // ctags does not escape regexps properly.
      // However, it should never create anything beyond /x/ or /^x$/.
      var exactMatch = false;
      if (pattern.startsWith('/') && pattern.endsWith('/')) {
        pattern = pattern.substr(1, pattern.length - 2);
        if (pattern.startsWith('^') && pattern.endsWith('$')) {
          pattern = pattern.substr(1, pattern.length - 2);
          exactMatch = true;
        }
      }
      try {
        // Search for the pattern in the file.
        var service = (0, (_nuclideRemoteConnection2 || _nuclideRemoteConnection()).getServiceByNuclideUri)('FileSystemService', tag.file);
        (0, (_assert2 || _assert()).default)(service);
        var contents = yield service.readFile((_nuclideRemoteUri2 || _nuclideRemoteUri()).default.getPath(tag.file));
        var lines = contents.toString('utf8').split('\n');
        lineNumber = 0;
        for (var i = 0; i < lines.length; i++) {
          if (exactMatch ? lines[i] === pattern : lines[i].indexOf(pattern) !== -1) {
            lineNumber = i;
            break;
          }
        }
      } catch (e) {
        (0, (_nuclideLogging2 || _nuclideLogging()).getLogger)().warn('nuclide-remote-ctags: Could not locate pattern in ' + tag.file, e);
      }
    }

  return lineNumber;
});

exports.getLineNumberForTag = getLineNumberForTag;

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _nuclideLogging2;

function _nuclideLogging() {
  return _nuclideLogging2 = require('../../nuclide-logging');
}

var _nuclideRemoteConnection2;

function _nuclideRemoteConnection() {
  return _nuclideRemoteConnection2 = require('../../nuclide-remote-connection');
}

var _nuclideRemoteUri2;

function _nuclideRemoteUri() {
  return _nuclideRemoteUri2 = _interopRequireDefault(require('../../nuclide-remote-uri'));
}

// Taken from http://ctags.sourceforge.net/FORMAT
var CTAGS_KIND_NAMES = {
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
};

exports.CTAGS_KIND_NAMES = CTAGS_KIND_NAMES;
var CTAGS_KIND_ICONS = {
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

exports.CTAGS_KIND_ICONS = CTAGS_KIND_ICONS;