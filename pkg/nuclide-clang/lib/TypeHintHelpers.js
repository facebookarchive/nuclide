'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

var _nuclideLanguageServiceRpc;

function _load_nuclideLanguageServiceRpc() {
  return _nuclideLanguageServiceRpc = require('../../nuclide-language-service-rpc');
}

var _libclang;

function _load_libclang() {
  return _libclang = require('./libclang');
}

// Types longer than this will be truncated.
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 *  strict-local
 * @format
 */

const MAX_LENGTH = 256;

class TypeHintHelpers {
  static typeHint(editor, position) {
    return (0, (_nuclideAnalytics || _load_nuclideAnalytics()).trackTiming)('nuclide-clang-atom.typeHint', async () => {
      const decl = await (0, (_libclang || _load_libclang()).getDeclaration)(editor, position.row, position.column);
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
      return (0, (_nuclideLanguageServiceRpc || _load_nuclideLanguageServiceRpc()).typeHintFromSnippet)(hint, range);
    });
  }
}
exports.default = TypeHintHelpers;