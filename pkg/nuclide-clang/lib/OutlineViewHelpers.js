"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.outlineFromClangOutline = outlineFromClangOutline;
exports.default = void 0;

function _nuclideAnalytics() {
  const data = require("../../nuclide-analytics");

  _nuclideAnalytics = function () {
    return data;
  };

  return data;
}

function _promise() {
  const data = require("../../../modules/nuclide-commons/promise");

  _promise = function () {
    return data;
  };

  return data;
}

function _nuclideClangRpc() {
  const data = require("../../nuclide-clang-rpc");

  _nuclideClangRpc = function () {
    return data;
  };

  return data;
}

function _tokenizedText() {
  const data = require("../../../modules/nuclide-commons/tokenized-text");

  _tokenizedText = function () {
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
// Display friendly names for all class-like types.
const CLASS_KIND_NAMES = {
  [_nuclideClangRpc().ClangCursorTypes.STRUCT_DECL]: 'struct',
  [_nuclideClangRpc().ClangCursorTypes.UNION_DECL]: 'union',
  [_nuclideClangRpc().ClangCursorTypes.CLASS_DECL]: 'class',
  [_nuclideClangRpc().ClangCursorTypes.ENUM_DECL]: 'enum',
  [_nuclideClangRpc().ClangCursorTypes.OBJC_INTERFACE_DECL]: '@interface',
  [_nuclideClangRpc().ClangCursorTypes.OBJC_CATEGORY_DECL]: '@interface',
  [_nuclideClangRpc().ClangCursorTypes.OBJC_PROTOCOL_DECL]: '@protocol',
  [_nuclideClangRpc().ClangCursorTypes.OBJC_IMPLEMENTATION_DECL]: '@implementation',
  [_nuclideClangRpc().ClangCursorTypes.OBJC_CATEGORY_IMPL_DECL]: '@implementation',
  [_nuclideClangRpc().ClangCursorTypes.CLASS_TEMPLATE]: 'class',
  [_nuclideClangRpc().ClangCursorTypes.CLASS_TEMPLATE_PARTIAL_SPECIALIZATION]: 'class',
  [_nuclideClangRpc().ClangCursorTypes.NAMESPACE]: 'namespace'
}; // Collapse template arguments for long types.

const LONG_TYPE_LENGTH = 50; // TODO(hansonw): Highlight tokens inside types.

function tokenizeType(type) {
  if (type.length > LONG_TYPE_LENGTH) {
    const openIndex = type.indexOf('<');

    if (openIndex !== -1) {
      const closeIndex = type.lastIndexOf('>');

      if (closeIndex !== -1) {
        return [(0, _tokenizedText().plain)(type.substring(0, openIndex + 1)), (0, _tokenizedText().string)('...'), (0, _tokenizedText().plain)(type.substring(closeIndex))];
      }
    }
  }

  return [(0, _tokenizedText().plain)(type)];
}

function tokenizeCursor(cursor) {
  if (cursor.children != null) {
    return [(0, _tokenizedText().keyword)(CLASS_KIND_NAMES[cursor.cursor_kind] || 'class'), (0, _tokenizedText().whitespace)(' '), (0, _tokenizedText().className)(cursor.name)];
  }

  if (cursor.params != null) {
    const {
      params,
      tparams
    } = cursor;
    const paramTokens = [];
    params.forEach(fparam => {
      if (paramTokens.length > 0) {
        paramTokens.push((0, _tokenizedText().plain)(', '));
      }

      paramTokens.push((0, _tokenizedText().param)(fparam));
    });
    const tparamTokens = [];

    if (tparams != null && tparams.length > 0) {
      tparamTokens.push((0, _tokenizedText().plain)('<'));
      tparams.forEach(tparam => {
        if (tparamTokens.length > 1) {
          tparamTokens.push((0, _tokenizedText().plain)(', '));
        }

        tparamTokens.push((0, _tokenizedText().plain)(tparam));
      });
      tparamTokens.push((0, _tokenizedText().plain)('>'));
    }

    return [(0, _tokenizedText().method)(cursor.name), ...tparamTokens, (0, _tokenizedText().plain)('('), ...paramTokens, (0, _tokenizedText().plain)(')')];
  }

  if (cursor.cursor_type != null) {
    return [...tokenizeType(cursor.cursor_type), (0, _tokenizedText().whitespace)(' '), (0, _tokenizedText().className)(cursor.name)];
  }

  return [(0, _tokenizedText().plain)(cursor.name)];
}

function outlineFromClangOutline(outline) {
  return outline.map(cursor => {
    return {
      tokenizedText: tokenizeCursor(cursor),
      representativeName: cursor.name,
      startPosition: cursor.extent.start,
      endPosition: cursor.extent.end,
      children: cursor.children ? outlineFromClangOutline(cursor.children) : []
    };
  });
}

class OutlineViewHelpers {
  static getOutline(editor) {
    return (0, _nuclideAnalytics().trackTiming)('nuclide-clang-atom:outline-view', async () => {
      // HACK: Since outline view and diagnostics both trigger on save, favor diagnostics.
      await (0, _promise().sleep)(0);
      const clangOutline = await (0, _libclang().getOutline)(editor);

      if (clangOutline == null) {
        return null;
      }

      return {
        outlineTrees: outlineFromClangOutline(clangOutline)
      };
    });
  }

}

exports.default = OutlineViewHelpers;