"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _nuclideAnalytics() {
  const data = require("../../nuclide-analytics");

  _nuclideAnalytics = function () {
    return data;
  };

  return data;
}

function _nuclideLanguageServiceRpc() {
  const data = require("../../nuclide-language-service-rpc");

  _nuclideLanguageServiceRpc = function () {
    return data;
  };

  return data;
}

function _libclang() {
  const data = require("./libclang");

  _libclang = function () {
    return data;
  };

  return data;
}

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
// Types longer than this will be truncated.
const MAX_LENGTH = 256;

class TypeHintHelpers {
  static typeHint(editor, position) {
    return (0, _nuclideAnalytics().trackTiming)('nuclide-clang-atom.typeHint', async () => {
      const decl = await (0, _libclang().getDeclaration)(editor, position.row, position.column);

      if (decl == null) {
        return null;
      }

      const {
        type,
        extent: range
      } = decl;

      if (type == null || type.trim() === '') {
        return null;
      }

      let hint = type;

      if (type.length > MAX_LENGTH) {
        hint = type.substr(0, MAX_LENGTH) + '...';
      }

      return (0, _nuclideLanguageServiceRpc().typeHintFromSnippet)(hint, range);
    });
  }

}

exports.default = TypeHintHelpers;