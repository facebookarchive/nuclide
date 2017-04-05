'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AutocompleteProvider = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

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

var _AutocompleteCacher;

function _load_AutocompleteCacher() {
  return _AutocompleteCacher = _interopRequireDefault(require('../../commons-atom/AutocompleteCacher'));
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
 */

class AutocompleteProvider {

  constructor(name, selector, inclusionPriority, suggestionPriority, disableForSelector, excludeLowerPriority, analyticsEventName, onDidInsertSuggestion, onDidInsertSuggestionAnalyticsEventName, autocompleteCacherConfig, connectionToLanguageService) {
    this.name = name;
    this.selector = selector;
    this.inclusionPriority = inclusionPriority;
    this.suggestionPriority = suggestionPriority;
    this.disableForSelector = disableForSelector;
    this.excludeLowerPriority = excludeLowerPriority;
    this._analyticsEventName = analyticsEventName;
    this._connectionToLanguageService = connectionToLanguageService;

    if (autocompleteCacherConfig != null) {
      this._autocompleteCacher = new (_AutocompleteCacher || _load_AutocompleteCacher()).default(request => this._getSuggestionsFromLanguageService(request), autocompleteCacherConfig);
    }

    this._onDidInsertSuggestion = onDidInsertSuggestion;

    this.onDidInsertSuggestion = arg => {
      (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)(onDidInsertSuggestionAnalyticsEventName);
      if (this._onDidInsertSuggestion != null) {
        this._onDidInsertSuggestion(arg);
      }
    };
  }

  static register(name, grammars, config, onDidInsertSuggestion, connectionToLanguageService) {
    return atom.packages.serviceHub.provide('autocomplete.provider', config.version, new AutocompleteProvider(name, grammars.map(grammar => '.' + grammar).join(', '), config.inclusionPriority, config.suggestionPriority, config.disableForSelector, config.excludeLowerPriority, config.analyticsEventName, onDidInsertSuggestion, config.onDidInsertSuggestionAnalyticsEventName, config.autocompleteCacherConfig, connectionToLanguageService));
  }

  getSuggestions(request) {
    var _this = this;

    return (0, (_nuclideAnalytics || _load_nuclideAnalytics()).trackTiming)(this._analyticsEventName, (0, _asyncToGenerator.default)(function* () {
      let result;
      if (_this._autocompleteCacher != null) {
        result = yield _this._autocompleteCacher.getSuggestions(request);
      } else {
        result = yield _this._getSuggestionsFromLanguageService(request);
      }
      return result != null ? result.items : null;
    }));
  }

  _getSuggestionsFromLanguageService(request) {
    var _this2 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const { editor, activatedManually, prefix } = request;
      const position = editor.getLastCursor().getBufferPosition();
      const path = editor.getPath();
      const fileVersion = yield (0, (_nuclideOpenFiles || _load_nuclideOpenFiles()).getFileVersionOfEditor)(editor);

      const languageService = _this2._connectionToLanguageService.getForUri(path);
      if (languageService == null || fileVersion == null) {
        return { isIncomplete: false, items: [] };
      }

      return (yield languageService).getAutocompleteSuggestions(fileVersion, position, activatedManually == null ? false : activatedManually, prefix);
    })();
  }
}
exports.AutocompleteProvider = AutocompleteProvider;