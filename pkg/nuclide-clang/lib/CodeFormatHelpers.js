'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

var _libclang;

function _load_libclang() {
  return _libclang = _interopRequireDefault(require('./libclang'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class CodeFormatHelpers {
  static formatEntireFile(editor, range) {
    return (0, (_nuclideAnalytics || _load_nuclideAnalytics()).trackTiming)('nuclide-clang-format.formatCode', (0, _asyncToGenerator.default)(function* () {
      try {
        return yield (_libclang || _load_libclang()).default.formatCode(editor, range);
      } catch (e) {
        (0, (_log4js || _load_log4js()).getLogger)('nuclide-clang').error('Could not run clang-format:', e);
        throw new Error('Could not run clang-format.<br>Ensure it is installed and in your $PATH.');
      }
    }));
  }
}
exports.default = CodeFormatHelpers; /**
                                      * Copyright (c) 2015-present, Facebook, Inc.
                                      * All rights reserved.
                                      *
                                      * This source code is licensed under the license found in the LICENSE file in
                                      * the root directory of this source tree.
                                      *
                                      * 
                                      * @format
                                      */