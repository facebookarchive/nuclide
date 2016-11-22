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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let AutocompleteProvider = exports.AutocompleteProvider = class AutocompleteProvider {

  constructor(name, selector, inclusionPriority, suggestionPriority, excludeLowerPriority, analyticsEventName, connectionToLanguageService) {
    this.name = name;
    this.selector = selector;
    this.inclusionPriority = inclusionPriority;
    this.suggestionPriority = suggestionPriority;
    this.excludeLowerPriority = excludeLowerPriority;
    this._analyticsEventName = analyticsEventName;
    this._connectionToLanguageService = connectionToLanguageService;
  }

  static register(name, grammars, config, connectionToLanguageService) {
    return atom.packages.serviceHub.provide('autocomplete.provider', config.version, new AutocompleteProvider(name, grammars.map(grammar => '.' + grammar).join(', '), config.inclusionPriority, config.suggestionPriority, config.excludeLowerPriority, config.analyticsEventName, connectionToLanguageService));
  }

  getSuggestions(request) {
    var _this = this;

    return (0, (_nuclideAnalytics || _load_nuclideAnalytics()).trackOperationTiming)(this._analyticsEventName, (0, _asyncToGenerator.default)(function* () {
      const editor = request.editor,
            activatedManually = request.activatedManually;

      const fileVersion = yield (0, (_nuclideOpenFiles || _load_nuclideOpenFiles()).getFileVersionOfEditor)(editor);
      const languageService = _this._connectionToLanguageService.getForUri(editor.getPath());
      if (languageService == null || fileVersion == null) {
        return [];
      }
      const position = editor.getLastCursor().getBufferPosition();

      return yield (yield languageService).getAutocompleteSuggestions(fileVersion, position, activatedManually == null ? false : activatedManually);
    }));
  }
};