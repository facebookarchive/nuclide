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

var _HackLanguage2;

function _HackLanguage() {
  return _HackLanguage2 = require('./HackLanguage');
}

var _nuclideHackCommon2;

function _nuclideHackCommon() {
  return _nuclideHackCommon2 = require('../../nuclide-hack-common');
}

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _nuclideAnalytics2;

function _nuclideAnalytics() {
  return _nuclideAnalytics2 = require('../../nuclide-analytics');
}

var HackDefinitionProvider = (function () {
  function HackDefinitionProvider() {
    _classCallCheck(this, HackDefinitionProvider);

    this.name = 'HackDefinitionProvider';
    this.priority = 20;
    this.grammarScopes = (_nuclideHackCommon2 || _nuclideHackCommon()).HACK_GRAMMARS;
  }

  _createDecoratedClass(HackDefinitionProvider, [{
    key: 'getDefinition',
    decorators: [(0, (_nuclideAnalytics2 || _nuclideAnalytics()).trackTiming)('hack.get-definition')],
    value: _asyncToGenerator(function* (editor, position) {
      (0, (_assert2 || _assert()).default)((_nuclideHackCommon2 || _nuclideHackCommon()).HACK_GRAMMARS_SET.has(editor.getGrammar().scopeName));

      var filePath = editor.getPath();
      if (filePath == null) {
        return null;
      }

      var hackLanguage = yield (0, (_HackLanguage2 || _HackLanguage()).getHackLanguageForUri)(filePath);
      if (hackLanguage == null) {
        return null;
      }

      var line = position.row;
      var column = position.column;
      var contents = editor.getText();

      var definitions = yield hackLanguage.getIdeDefinition(filePath, contents, line + 1, column + 1);
      if (definitions.length === 0) {
        return null;
      }

      function convertDefinition(definition) {
        return {
          path: definition.path,
          position: new (_atom2 || _atom()).Point(definition.line - 1, definition.column - 1),
          // TODO: range, projectRoot
          id: definition.name,
          name: definition.name
        };
      }
      return {
        queryRange: definitions[0].queryRange,
        definitions: definitions.map(convertDefinition)
      };
    })
  }]);

  return HackDefinitionProvider;
})();

exports.HackDefinitionProvider = HackDefinitionProvider;