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

var _createDecoratedClass = (function () { function defineProperties(target, descriptors, initializers) { for (var i = 0; i < descriptors.length; i++) { var descriptor = descriptors[i]; var decorators = descriptor.decorators; var key = descriptor.key; delete descriptor.key; delete descriptor.decorators; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor || descriptor.initializer) descriptor.writable = true; if (decorators) { for (var f = 0; f < decorators.length; f++) { var decorator = decorators[f]; if (typeof decorator === 'function') { descriptor = decorator(target, key, descriptor) || descriptor; } else { throw new TypeError('The decorator for method ' + descriptor.key + ' is of the invalid type ' + typeof decorator); } } if (descriptor.initializer !== undefined) { initializers[key] = descriptor; continue; } } Object.defineProperty(target, key, descriptor); } } return function (Constructor, protoProps, staticProps, protoInitializers, staticInitializers) { if (protoProps) defineProperties(Constructor.prototype, protoProps, protoInitializers); if (staticProps) defineProperties(Constructor, staticProps, staticInitializers); return Constructor; }; })();

var _CLASS_KIND_NAMES;

exports.outlineFromClangOutline = outlineFromClangOutline;

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _nuclideAnalytics2;

function _nuclideAnalytics() {
  return _nuclideAnalytics2 = require('../../nuclide-analytics');
}

var _commonsNodePromise2;

function _commonsNodePromise() {
  return _commonsNodePromise2 = require('../../commons-node/promise');
}

var _nuclideClang2;

function _nuclideClang() {
  return _nuclideClang2 = require('../../nuclide-clang');
}

var _nuclideTokenizedText2;

function _nuclideTokenizedText() {
  return _nuclideTokenizedText2 = require('../../nuclide-tokenized-text');
}

var _libclang2;

function _libclang() {
  return _libclang2 = require('./libclang');
}

// Display friendly names for all class-like types.
var CLASS_KIND_NAMES = (_CLASS_KIND_NAMES = {}, _defineProperty(_CLASS_KIND_NAMES, (_nuclideClang2 || _nuclideClang()).ClangCursorTypes.STRUCT_DECL, 'struct'), _defineProperty(_CLASS_KIND_NAMES, (_nuclideClang2 || _nuclideClang()).ClangCursorTypes.UNION_DECL, 'union'), _defineProperty(_CLASS_KIND_NAMES, (_nuclideClang2 || _nuclideClang()).ClangCursorTypes.CLASS_DECL, 'class'), _defineProperty(_CLASS_KIND_NAMES, (_nuclideClang2 || _nuclideClang()).ClangCursorTypes.ENUM_DECL, 'enum'), _defineProperty(_CLASS_KIND_NAMES, (_nuclideClang2 || _nuclideClang()).ClangCursorTypes.OBJC_INTERFACE_DECL, '@interface'), _defineProperty(_CLASS_KIND_NAMES, (_nuclideClang2 || _nuclideClang()).ClangCursorTypes.OBJC_CATEGORY_DECL, '@interface'), _defineProperty(_CLASS_KIND_NAMES, (_nuclideClang2 || _nuclideClang()).ClangCursorTypes.OBJC_PROTOCOL_DECL, '@protocol'), _defineProperty(_CLASS_KIND_NAMES, (_nuclideClang2 || _nuclideClang()).ClangCursorTypes.OBJC_IMPLEMENTATION_DECL, '@implementation'), _defineProperty(_CLASS_KIND_NAMES, (_nuclideClang2 || _nuclideClang()).ClangCursorTypes.OBJC_CATEGORY_IMPL_DECL, '@implementation'), _defineProperty(_CLASS_KIND_NAMES, (_nuclideClang2 || _nuclideClang()).ClangCursorTypes.CLASS_TEMPLATE, 'class'), _defineProperty(_CLASS_KIND_NAMES, (_nuclideClang2 || _nuclideClang()).ClangCursorTypes.CLASS_TEMPLATE_PARTIAL_SPECIALIZATION, 'class'), _defineProperty(_CLASS_KIND_NAMES, (_nuclideClang2 || _nuclideClang()).ClangCursorTypes.NAMESPACE, 'namespace'), _CLASS_KIND_NAMES);

// Collapse template arguments for long types.
var LONG_TYPE_LENGTH = 50;

// TODO(hansonw): Highlight tokens inside types.
function tokenizeType(type) {
  if (type.length > LONG_TYPE_LENGTH) {
    var openIndex = type.indexOf('<');
    if (openIndex !== -1) {
      var closeIndex = type.lastIndexOf('>');
      if (closeIndex !== -1) {
        return [(0, (_nuclideTokenizedText2 || _nuclideTokenizedText()).plain)(type.substring(0, openIndex + 1)), (0, (_nuclideTokenizedText2 || _nuclideTokenizedText()).string)('...'), (0, (_nuclideTokenizedText2 || _nuclideTokenizedText()).plain)(type.substring(closeIndex))];
      }
    }
  }
  return [(0, (_nuclideTokenizedText2 || _nuclideTokenizedText()).plain)(type)];
}

function tokenizeCursor(cursor) {
  if (cursor.children != null) {
    return [(0, (_nuclideTokenizedText2 || _nuclideTokenizedText()).keyword)(CLASS_KIND_NAMES[cursor.cursor_kind] || 'class'), (0, (_nuclideTokenizedText2 || _nuclideTokenizedText()).whitespace)(' '), (0, (_nuclideTokenizedText2 || _nuclideTokenizedText()).className)(cursor.name)];
  }
  if (cursor.params != null) {
    var _ret = (function () {
      var params = cursor.params;
      var tparams = cursor.tparams;

      var paramTokens = [];
      params.forEach(function (fparam) {
        if (paramTokens.length > 0) {
          paramTokens.push((0, (_nuclideTokenizedText2 || _nuclideTokenizedText()).plain)(', '));
        }
        paramTokens.push((0, (_nuclideTokenizedText2 || _nuclideTokenizedText()).param)(fparam));
      });
      var tparamTokens = [];
      if (tparams != null && tparams.length > 0) {
        tparamTokens.push((0, (_nuclideTokenizedText2 || _nuclideTokenizedText()).plain)('<'));
        tparams.forEach(function (tparam) {
          if (tparamTokens.length > 1) {
            tparamTokens.push((0, (_nuclideTokenizedText2 || _nuclideTokenizedText()).plain)(', '));
          }
          tparamTokens.push((0, (_nuclideTokenizedText2 || _nuclideTokenizedText()).plain)(tparam));
        });
        tparamTokens.push((0, (_nuclideTokenizedText2 || _nuclideTokenizedText()).plain)('>'));
      }
      return {
        v: [(0, (_nuclideTokenizedText2 || _nuclideTokenizedText()).method)(cursor.name)].concat(tparamTokens, [(0, (_nuclideTokenizedText2 || _nuclideTokenizedText()).plain)('(')], paramTokens, [(0, (_nuclideTokenizedText2 || _nuclideTokenizedText()).plain)(')')])
      };
    })();

    if (typeof _ret === 'object') return _ret.v;
  }
  if (cursor.cursor_type != null) {
    return [].concat(_toConsumableArray(tokenizeType(cursor.cursor_type)), [(0, (_nuclideTokenizedText2 || _nuclideTokenizedText()).whitespace)(' '), (0, (_nuclideTokenizedText2 || _nuclideTokenizedText()).className)(cursor.name)]);
  }
  return [(0, (_nuclideTokenizedText2 || _nuclideTokenizedText()).plain)(cursor.name)];
}

function outlineFromClangOutline(outline) {
  return outline.map(function (cursor) {
    return {
      tokenizedText: tokenizeCursor(cursor),
      representativeName: cursor.name,
      startPosition: new (_atom2 || _atom()).Point(cursor.extent.start.line, cursor.extent.start.column),
      endPosition: new (_atom2 || _atom()).Point(cursor.extent.end.line, cursor.extent.end.column),
      children: cursor.children ? outlineFromClangOutline(cursor.children) : []
    };
  });
}

var OutlineViewHelpers = (function () {
  function OutlineViewHelpers() {
    _classCallCheck(this, OutlineViewHelpers);
  }

  _createDecoratedClass(OutlineViewHelpers, null, [{
    key: 'getOutline',
    decorators: [(0, (_nuclideAnalytics2 || _nuclideAnalytics()).trackTiming)('nuclide-clang-atom:outline-view')],
    value: _asyncToGenerator(function* (editor) {
      // HACK: Since outline view and diagnostics both trigger on save, favor diagnostics.
      yield (0, (_commonsNodePromise2 || _commonsNodePromise()).sleep)(0);
      var clangOutline = yield (0, (_libclang2 || _libclang()).getOutline)(editor);
      if (clangOutline == null) {
        return null;
      }
      return {
        outlineTrees: outlineFromClangOutline(clangOutline)
      };
    })
  }]);

  return OutlineViewHelpers;
})();

exports.default = OutlineViewHelpers;