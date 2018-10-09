"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _libclang() {
  const data = require("./libclang");

  _libclang = function () {
    return data;
  };

  return data;
}

function _findWholeRangeOfSymbol() {
  const data = _interopRequireDefault(require("./findWholeRangeOfSymbol"));

  _findWholeRangeOfSymbol = function () {
    return data;
  };

  return data;
}

function _range() {
  const data = require("../../../modules/nuclide-commons-atom/range");

  _range = function () {
    return data;
  };

  return data;
}

function _nuclideAnalytics() {
  const data = require("../../nuclide-analytics");

  _nuclideAnalytics = function () {
    return data;
  };

  return data;
}

function _constants() {
  const data = require("./constants");

  _constants = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
class DefinitionHelpers {
  static getDefinition(editor, position) {
    return (0, _nuclideAnalytics().trackTiming)('clang.get-definition', () => DefinitionHelpers._getDefinition(editor, position));
  }

  static async _getDefinition(editor, position) {
    if (!_constants().GRAMMAR_SET.has(editor.getGrammar().scopeName)) {
      throw new Error("Invariant violation: \"GRAMMAR_SET.has(editor.getGrammar().scopeName)\"");
    }

    const src = editor.getPath();

    if (src == null) {
      return null;
    }

    const contents = editor.getText();
    const wordMatch = (0, _range().wordAtPosition)(editor, position, _constants().IDENTIFIER_REGEXP);

    if (wordMatch == null) {
      return null;
    }

    const {
      range
    } = wordMatch;
    const result = await (0, _libclang().getDeclaration)(editor, position.row, position.column);

    if (result == null) {
      return null;
    }

    const wholeRange = (0, _findWholeRangeOfSymbol().default)(editor, contents, range, result.spelling, result.extent);
    const definition = {
      path: result.file,
      position: result.point,
      range: result.extent,
      language: 'clang' // TODO: projectRoot

    };

    if (result.spelling != null) {
      definition.name = result.spelling;
    }

    return {
      queryRange: wholeRange,
      definitions: [definition]
    };
  }

}

exports.default = DefinitionHelpers;