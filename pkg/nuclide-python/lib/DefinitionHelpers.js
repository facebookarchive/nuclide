'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _atom = require('atom');

var _range;

function _load_range() {
  return _range = require('../../commons-atom/range');
}

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
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

class DefinitionHelpers {

  static getDefinition(editor, position) {
    return (0, (_nuclideAnalytics || _load_nuclideAnalytics()).trackOperationTiming)('python.get-definition', () => DefinitionHelpers._getDefinition(editor, position));
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

      const line = position.row;
      const column = position.column;
      const contents = editor.getText();

      const wordMatch = (0, (_range || _load_range()).wordAtPosition)(editor, position);
      if (wordMatch == null) {
        return null;
      }

      const { range } = wordMatch;

      const service = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getServiceByNuclideUri)('PythonService', src);
      if (service == null) {
        return null;
      }

      const result = yield service.getDefinitions(src, contents, line, column);
      if (result == null) {
        return null;
      }

      if (result.length === 0) {
        return null;
      }

      const definitions = result.map(function (definition) {
        return {
          path: definition.file,
          position: new _atom.Point(definition.line, definition.column),
          id: definition.text,
          name: definition.text,
          language: 'python'
        };
      });

      return {
        queryRange: [range],
        definitions
      };
    })();
  }

  static getDefinitionById(filePath, id) {
    return (0, (_nuclideAnalytics || _load_nuclideAnalytics()).trackOperationTiming)('python.get-definition-by-id', (0, _asyncToGenerator.default)(function* () {
      // TODO:
      return null;
    }));
  }
}
exports.default = DefinitionHelpers;
module.exports = exports['default'];