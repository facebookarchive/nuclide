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

var _assert;

function _load_assert() {
  return _assert = _interopRequireDefault(require('assert'));
}

var _atom;

function _load_atom() {
  return _atom = require('atom');
}

var _commonsAtomRange;

function _load_commonsAtomRange() {
  return _commonsAtomRange = require('../../commons-atom/range');
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

var DefinitionHelpers = (function () {
  function DefinitionHelpers() {
    _classCallCheck(this, DefinitionHelpers);
  }

  _createDecoratedClass(DefinitionHelpers, null, [{
    key: 'getDefinition',
    decorators: [(0, (_nuclideAnalytics || _load_nuclideAnalytics()).trackTiming)('python.get-definition')],
    value: _asyncToGenerator(function* (editor, position) {
      (0, (_assert || _load_assert()).default)((_constants || _load_constants()).GRAMMAR_SET.has(editor.getGrammar().scopeName));

      var src = editor.getPath();
      if (src == null) {
        return null;
      }

      var line = position.row;
      var column = position.column;
      var contents = editor.getText();

      var wordMatch = (0, (_commonsAtomRange || _load_commonsAtomRange()).wordAtPosition)(editor, position);
      if (wordMatch == null) {
        return null;
      }

      var range = wordMatch.range;

      var service = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getServiceByNuclideUri)('PythonService', src);
      if (service == null) {
        return null;
      }

      var result = yield service.getDefinitions(src, contents, line, column);
      if (result == null) {
        return null;
      }

      if (result.length === 0) {
        return null;
      }

      var definitions = result.map(function (definition) {
        return {
          path: definition.file,
          position: new (_atom || _load_atom()).Point(definition.line, definition.column),
          id: definition.text,
          name: definition.text,
          language: 'python'
        };
      });

      return {
        queryRange: [range],
        definitions: definitions
      };
    })
  }, {
    key: 'getDefinitionById',
    decorators: [(0, (_nuclideAnalytics || _load_nuclideAnalytics()).trackTiming)('python.get-definition-by-id')],
    value: _asyncToGenerator(function* (filePath, id) {
      // TODO:
      return null;
    })
  }]);

  return DefinitionHelpers;
})();

exports.default = DefinitionHelpers;
module.exports = exports.default;