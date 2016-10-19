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

var AutocompleteProvider = (function () {
  function AutocompleteProvider(name, selector, inclusionPriority, suggestionPriority, excludeLowerPriority, analyticsEventName, connectionToLanguageService) {
    _classCallCheck(this, AutocompleteProvider);

    this.name = name;
    this.selector = selector;
    this.inclusionPriority = inclusionPriority;
    this.suggestionPriority = suggestionPriority;
    this.excludeLowerPriority = excludeLowerPriority;
    this._analyticsEventName = analyticsEventName;
    this._connectionToLanguageService = connectionToLanguageService;
  }

  _createClass(AutocompleteProvider, [{
    key: 'getSuggestions',
    value: function getSuggestions(request) {
      var _this = this;

      return (0, (_nuclideAnalytics || _load_nuclideAnalytics()).trackOperationTiming)(this._analyticsEventName, _asyncToGenerator(function* () {
        var editor = request.editor;
        var activatedManually = request.activatedManually;

        var fileVersion = yield (0, (_nuclideOpenFiles || _load_nuclideOpenFiles()).getFileVersionOfEditor)(editor);
        var languageService = _this._connectionToLanguageService.getForUri(editor.getPath());
        if (languageService == null || fileVersion == null) {
          return [];
        }
        var position = editor.getLastCursor().getBufferPosition();

        return yield (yield languageService).getAutocompleteSuggestions(fileVersion, position, activatedManually == null ? false : activatedManually);
      }));
    }
  }], [{
    key: 'register',
    value: function register(name, grammars, config, connectionToLanguageService) {
      return atom.packages.serviceHub.provide('autocomplete.provider', config.version, new AutocompleteProvider(name, grammars.map(function (grammar) {
        return '.' + grammar;
      }).join(', '), config.inclusionPriority, config.suggestionPriority, config.excludeLowerPriority, config.analyticsEventName, connectionToLanguageService));
    }
  }]);

  return AutocompleteProvider;
})();

exports.AutocompleteProvider = AutocompleteProvider;