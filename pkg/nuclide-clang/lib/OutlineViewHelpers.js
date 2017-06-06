'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

exports.outlineFromClangOutline = outlineFromClangOutline;

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

var _promise;

function _load_promise() {
  return _promise = require('nuclide-commons/promise');
}

var _nuclideClangRpc;

function _load_nuclideClangRpc() {
  return _nuclideClangRpc = require('../../nuclide-clang-rpc');
}

var _tokenizedText;

function _load_tokenizedText() {
  return _tokenizedText = require('nuclide-commons/tokenized-text');
}

var _libclang;

function _load_libclang() {
  return _libclang = require('./libclang');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Display friendly names for all class-like types.
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

const CLASS_KIND_NAMES = {
  [(_nuclideClangRpc || _load_nuclideClangRpc()).ClangCursorTypes.STRUCT_DECL]: 'struct',
  [(_nuclideClangRpc || _load_nuclideClangRpc()).ClangCursorTypes.UNION_DECL]: 'union',
  [(_nuclideClangRpc || _load_nuclideClangRpc()).ClangCursorTypes.CLASS_DECL]: 'class',
  [(_nuclideClangRpc || _load_nuclideClangRpc()).ClangCursorTypes.ENUM_DECL]: 'enum',
  [(_nuclideClangRpc || _load_nuclideClangRpc()).ClangCursorTypes.OBJC_INTERFACE_DECL]: '@interface',
  [(_nuclideClangRpc || _load_nuclideClangRpc()).ClangCursorTypes.OBJC_CATEGORY_DECL]: '@interface',
  [(_nuclideClangRpc || _load_nuclideClangRpc()).ClangCursorTypes.OBJC_PROTOCOL_DECL]: '@protocol',
  [(_nuclideClangRpc || _load_nuclideClangRpc()).ClangCursorTypes.OBJC_IMPLEMENTATION_DECL]: '@implementation',
  [(_nuclideClangRpc || _load_nuclideClangRpc()).ClangCursorTypes.OBJC_CATEGORY_IMPL_DECL]: '@implementation',
  [(_nuclideClangRpc || _load_nuclideClangRpc()).ClangCursorTypes.CLASS_TEMPLATE]: 'class',
  [(_nuclideClangRpc || _load_nuclideClangRpc()).ClangCursorTypes.CLASS_TEMPLATE_PARTIAL_SPECIALIZATION]: 'class',
  [(_nuclideClangRpc || _load_nuclideClangRpc()).ClangCursorTypes.NAMESPACE]: 'namespace'
};

// Collapse template arguments for long types.
const LONG_TYPE_LENGTH = 50;

// TODO(hansonw): Highlight tokens inside types.
function tokenizeType(type) {
  if (type.length > LONG_TYPE_LENGTH) {
    const openIndex = type.indexOf('<');
    if (openIndex !== -1) {
      const closeIndex = type.lastIndexOf('>');
      if (closeIndex !== -1) {
        return [(0, (_tokenizedText || _load_tokenizedText()).plain)(type.substring(0, openIndex + 1)), (0, (_tokenizedText || _load_tokenizedText()).string)('...'), (0, (_tokenizedText || _load_tokenizedText()).plain)(type.substring(closeIndex))];
      }
    }
  }
  return [(0, (_tokenizedText || _load_tokenizedText()).plain)(type)];
}

function tokenizeCursor(cursor) {
  if (cursor.children != null) {
    return [(0, (_tokenizedText || _load_tokenizedText()).keyword)(CLASS_KIND_NAMES[cursor.cursor_kind] || 'class'), (0, (_tokenizedText || _load_tokenizedText()).whitespace)(' '), (0, (_tokenizedText || _load_tokenizedText()).className)(cursor.name)];
  }
  if (cursor.params != null) {
    const { params, tparams } = cursor;
    const paramTokens = [];
    params.forEach(fparam => {
      if (paramTokens.length > 0) {
        paramTokens.push((0, (_tokenizedText || _load_tokenizedText()).plain)(', '));
      }
      paramTokens.push((0, (_tokenizedText || _load_tokenizedText()).param)(fparam));
    });
    const tparamTokens = [];
    if (tparams != null && tparams.length > 0) {
      tparamTokens.push((0, (_tokenizedText || _load_tokenizedText()).plain)('<'));
      tparams.forEach(tparam => {
        if (tparamTokens.length > 1) {
          tparamTokens.push((0, (_tokenizedText || _load_tokenizedText()).plain)(', '));
        }
        tparamTokens.push((0, (_tokenizedText || _load_tokenizedText()).plain)(tparam));
      });
      tparamTokens.push((0, (_tokenizedText || _load_tokenizedText()).plain)('>'));
    }
    return [(0, (_tokenizedText || _load_tokenizedText()).method)(cursor.name), ...tparamTokens, (0, (_tokenizedText || _load_tokenizedText()).plain)('('), ...paramTokens, (0, (_tokenizedText || _load_tokenizedText()).plain)(')')];
  }
  if (cursor.cursor_type != null) {
    return [...tokenizeType(cursor.cursor_type), (0, (_tokenizedText || _load_tokenizedText()).whitespace)(' '), (0, (_tokenizedText || _load_tokenizedText()).className)(cursor.name)];
  }
  return [(0, (_tokenizedText || _load_tokenizedText()).plain)(cursor.name)];
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
    return (0, (_nuclideAnalytics || _load_nuclideAnalytics()).trackTiming)('nuclide-clang-atom:outline-view', (0, _asyncToGenerator.default)(function* () {
      // HACK: Since outline view and diagnostics both trigger on save, favor diagnostics.
      yield (0, (_promise || _load_promise()).sleep)(0);
      const clangOutline = yield (0, (_libclang || _load_libclang()).getOutline)(editor);
      if (clangOutline == null) {
        return null;
      }
      return {
        outlineTrees: outlineFromClangOutline(clangOutline)
      };
    }));
  }
}
exports.default = OutlineViewHelpers;