'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _libclang;

function _load_libclang() {
  return _libclang = require('./libclang');
}

var _findWholeRangeOfSymbol;

function _load_findWholeRangeOfSymbol() {
  return _findWholeRangeOfSymbol = _interopRequireDefault(require('./findWholeRangeOfSymbol'));
}

var _range;

function _load_range() {
  return _range = require('nuclide-commons-atom/range');
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

var _constants;

function _load_constants() {
  return _constants = require('./constants');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

class DefinitionHelpers {
  static getDefinition(editor, position) {
    return (0, (_nuclideAnalytics || _load_nuclideAnalytics()).trackTiming)('clang.get-definition', () => DefinitionHelpers._getDefinition(editor, position));
  }

  static _getDefinition(editor, position) {
    return (0, _asyncToGenerator.default)(function* () {
      if (!(_constants || _load_constants()).GRAMMAR_SET.has(editor.getGrammar().scopeName)) {
        throw new Error('Invariant violation: "GRAMMAR_SET.has(editor.getGrammar().scopeName)"');
      }

      const src = editor.getPath();
      if (src == null) {
        return null;
      }

      const contents = editor.getText();

      const wordMatch = (0, (_range || _load_range()).wordAtPosition)(editor, position, (_constants || _load_constants()).IDENTIFIER_REGEXP);
      if (wordMatch == null) {
        return null;
      }

      const { range } = wordMatch;

      const result = yield (0, (_libclang || _load_libclang()).getDeclaration)(editor, position.row, position.column);
      if (result == null) {
        return null;
      }

      const wholeRange = (0, (_findWholeRangeOfSymbol || _load_findWholeRangeOfSymbol()).default)(editor, contents, range, result.spelling, result.extent);
      const definition = {
        path: result.file,
        position: result.point,
        range: result.extent,
        language: 'clang'
      };

      if (result.spelling != null) {
        definition.name = result.spelling;
      }

      return {
        queryRange: wholeRange,
        definitions: [definition]
      };
    })();
  }
}
exports.default = DefinitionHelpers;