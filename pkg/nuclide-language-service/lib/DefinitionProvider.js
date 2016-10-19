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

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

var _nuclideOpenFiles;

function _load_nuclideOpenFiles() {
  return _nuclideOpenFiles = require('../../nuclide-open-files');
}

var DefinitionProvider = (function () {
  function DefinitionProvider(name, grammars, priority, definitionEventName, definitionByIdEventName, connectionToLanguageService) {
    _classCallCheck(this, DefinitionProvider);

    this.name = name;
    this.priority = priority;
    this.grammarScopes = grammars;
    this._definitionEventName = definitionEventName;
    this._definitionByIdEventName = definitionByIdEventName;
    this._connectionToLanguageService = connectionToLanguageService;
  }

  _createClass(DefinitionProvider, [{
    key: 'getDefinition',
    value: _asyncToGenerator(function* (editor, position) {
      var _this = this;

      return (0, (_nuclideAnalytics || _load_nuclideAnalytics()).trackOperationTiming)(this._definitionEventName, _asyncToGenerator(function* () {
        var fileVersion = yield (0, (_nuclideOpenFiles || _load_nuclideOpenFiles()).getFileVersionOfEditor)(editor);
        var languageService = _this._connectionToLanguageService.getForUri(editor.getPath());
        if (languageService == null || fileVersion == null) {
          return null;
        }
        return yield (yield languageService).getDefinition(fileVersion, position);
      }));
    })
  }, {
    key: 'getDefinitionById',
    value: function getDefinitionById(filePath, id) {
      var _this2 = this;

      return (0, (_nuclideAnalytics || _load_nuclideAnalytics()).trackOperationTiming)(this._definitionByIdEventName, _asyncToGenerator(function* () {
        var languageService = _this2._connectionToLanguageService.getForUri(filePath);
        if (languageService == null) {
          return null;
        }

        return yield (yield languageService).getDefinitionById(filePath, id);
      }));
    }
  }], [{
    key: 'register',
    value: function register(name, grammars, config, connectionToLanguageService) {
      return atom.packages.serviceHub.provide('nuclide-definition-provider', config.version, new DefinitionProvider(name, grammars, config.priority, config.definitionEventName, config.definitionByIdEventName, connectionToLanguageService));
    }
  }]);

  return DefinitionProvider;
})();

exports.DefinitionProvider = DefinitionProvider;