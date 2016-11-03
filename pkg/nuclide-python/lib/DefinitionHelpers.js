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
exports.default = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _dec, _dec2, _desc, _value, _class;

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

function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) {
  var desc = {};
  Object['ke' + 'ys'](descriptor).forEach(function (key) {
    desc[key] = descriptor[key];
  });
  desc.enumerable = !!desc.enumerable;
  desc.configurable = !!desc.configurable;

  if ('value' in desc || desc.initializer) {
    desc.writable = true;
  }

  desc = decorators.slice().reverse().reduce(function (desc, decorator) {
    return decorator(target, property, desc) || desc;
  }, desc);

  if (context && desc.initializer !== void 0) {
    desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
    desc.initializer = undefined;
  }

  if (desc.initializer === void 0) {
    Object['define' + 'Property'](target, property, desc);
    desc = null;
  }

  return desc;
}

let DefinitionHelpers = (_dec = (0, (_nuclideAnalytics || _load_nuclideAnalytics()).trackTiming)('python.get-definition'), _dec2 = (0, (_nuclideAnalytics || _load_nuclideAnalytics()).trackTiming)('python.get-definition-by-id'), (_class = class DefinitionHelpers {
  static getDefinition(editor, position) {
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

      const range = wordMatch.range;


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
        definitions: definitions
      };
    })();
  }

  static getDefinitionById(filePath, id) {
    return (0, _asyncToGenerator.default)(function* () {
      // TODO:
      return null;
    })();
  }
}, (_applyDecoratedDescriptor(_class, 'getDefinition', [_dec], Object.getOwnPropertyDescriptor(_class, 'getDefinition'), _class), _applyDecoratedDescriptor(_class, 'getDefinitionById', [_dec2], Object.getOwnPropertyDescriptor(_class, 'getDefinitionById'), _class)), _class));
exports.default = DefinitionHelpers;
module.exports = exports['default'];