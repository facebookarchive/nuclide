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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

var _commonsAtomLoadingNotification;

function _load_commonsAtomLoadingNotification() {
  return _commonsAtomLoadingNotification = _interopRequireDefault(require('../../commons-atom/loading-notification'));
}

var _nuclideOpenFiles;

function _load_nuclideOpenFiles() {
  return _nuclideOpenFiles = require('../../nuclide-open-files');
}

var FindReferencesProvider = (function () {
  function FindReferencesProvider(name, grammarScopes, analyticsEventName, connectionToLanguageService) {
    _classCallCheck(this, FindReferencesProvider);

    this.name = name;
    this.grammarScopes = grammarScopes;
    this._analyticsEventName = analyticsEventName;
    this._connectionToLanguageService = connectionToLanguageService;
  }

  _createClass(FindReferencesProvider, [{
    key: 'isEditorSupported',
    value: _asyncToGenerator(function* (textEditor) {
      return textEditor.getPath() != null && this.grammarScopes.includes(textEditor.getGrammar().scopeName);
    })
  }, {
    key: 'findReferences',
    value: function findReferences(editor, position) {
      var _this = this;

      return (0, (_nuclideAnalytics || _load_nuclideAnalytics()).trackOperationTiming)(this._analyticsEventName, _asyncToGenerator(function* () {
        var fileVersion = yield (0, (_nuclideOpenFiles || _load_nuclideOpenFiles()).getFileVersionOfEditor)(editor);
        var languageService = _this._connectionToLanguageService.getForUri(editor.getPath());
        if (languageService == null || fileVersion == null) {
          return null;
        }

        return yield (0, (_commonsAtomLoadingNotification || _load_commonsAtomLoadingNotification()).default)((yield languageService).findReferences(fileVersion, position), 'Loading references from ' + _this.name + ' server...');
      }));
    }
  }], [{
    key: 'register',
    value: function register(name, grammarScopes, config, connectionToLanguageService) {
      return atom.packages.serviceHub.provide('nuclide-find-references.provider', config.version, new FindReferencesProvider(name, grammarScopes, config.analyticsEventName, connectionToLanguageService));
    }
  }]);

  return FindReferencesProvider;
})();

exports.FindReferencesProvider = FindReferencesProvider;