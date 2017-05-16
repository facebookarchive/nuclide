'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

var _libclang;

function _load_libclang() {
  return _libclang = require('./libclang');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Types longer than this will be truncated.
const MAX_LENGTH = 256; /**
                         * Copyright (c) 2015-present, Facebook, Inc.
                         * All rights reserved.
                         *
                         * This source code is licensed under the license found in the LICENSE file in
                         * the root directory of this source tree.
                         *
                         * 
                         * @format
                         */

class TypeHintHelpers {
  static typeHint(editor, position) {
    return (0, (_nuclideAnalytics || _load_nuclideAnalytics()).trackTiming)('nuclide-clang-atom.typeHint', (0, _asyncToGenerator.default)(function* () {
      const decl = yield (0, (_libclang || _load_libclang()).getDeclaration)(editor, position.row, position.column);
      if (decl == null) {
        return null;
      }
      const { type, extent: range } = decl;
      if (type == null || type.trim() === '') {
        return null;
      }
      let hint = type;
      if (type.length > MAX_LENGTH) {
        hint = type.substr(0, MAX_LENGTH) + '...';
      }
      return { hint, range };
    }));
  }
}
exports.default = TypeHintHelpers;