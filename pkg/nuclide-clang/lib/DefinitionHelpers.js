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

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _libclang2;

function _libclang() {
  return _libclang2 = require('./libclang');
}

var _findWholeRangeOfSymbol2;

function _findWholeRangeOfSymbol() {
  return _findWholeRangeOfSymbol2 = _interopRequireDefault(require('./findWholeRangeOfSymbol'));
}

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _commonsAtomRange2;

function _commonsAtomRange() {
  return _commonsAtomRange2 = require('../../commons-atom/range');
}

var _nuclideAnalytics2;

function _nuclideAnalytics() {
  return _nuclideAnalytics2 = require('../../nuclide-analytics');
}

var _constants2;

function _constants() {
  return _constants2 = require('./constants');
}

var DefinitionHelpers = (function () {
  function DefinitionHelpers() {
    _classCallCheck(this, DefinitionHelpers);
  }

  _createDecoratedClass(DefinitionHelpers, null, [{
    key: 'getDefinition',
    decorators: [(0, (_nuclideAnalytics2 || _nuclideAnalytics()).trackTiming)('clang.get-definition')],
    value: _asyncToGenerator(function* (editor, position) {
      (0, (_assert2 || _assert()).default)((_constants2 || _constants()).GRAMMAR_SET.has(editor.getGrammar().scopeName));

      var src = editor.getPath();
      if (src == null) {
        return null;
      }

      var contents = editor.getText();

      var wordMatch = (0, (_commonsAtomRange2 || _commonsAtomRange()).wordAtPosition)(editor, position, (_constants2 || _constants()).IDENTIFIER_REGEXP);
      if (wordMatch == null) {
        return null;
      }

      var range = wordMatch.range;

      var result = yield (0, (_libclang2 || _libclang()).getDeclaration)(editor, position.row, position.column);
      if (result == null) {
        return null;
      }

      var wholeRange = (0, (_findWholeRangeOfSymbol2 || _findWholeRangeOfSymbol()).default)(editor, contents, range, result.spelling, result.extent);
      var definition = {
        path: result.file,
        position: result.point,
        range: result.extent,
        language: 'clang'
      };

      // TODO: projectRoot
      if (result.spelling != null) {
        definition.id = result.spelling;
        definition.name = result.spelling;
      }

      return {
        queryRange: wholeRange,
        definitions: [definition]
      };
    })
  }, {
    key: 'getDefinitionById',
    decorators: [(0, (_nuclideAnalytics2 || _nuclideAnalytics()).trackTiming)('clang.get-definition-by-id')],
    value: _asyncToGenerator(function* (filePath, id) {
      // TODO:
      return null;
    })
  }]);

  return DefinitionHelpers;
})();

exports.default = DefinitionHelpers;
module.exports = exports.default;