'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CodeActionProvider = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

var _nuclideOpenFiles;

function _load_nuclideOpenFiles() {
  return _nuclideOpenFiles = require('../../nuclide-open-files');
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class CodeActionProvider {

  constructor(name, grammarScopes, priority, analyticsEventName, connectionToLanguageService) {
    this.name = name;
    this.grammarScopes = grammarScopes;
    this.priority = priority;
    this._analyticsEventName = analyticsEventName;
    this._connectionToLanguageService = connectionToLanguageService;
  }

  static register(name, grammarScopes, config, connectionToLanguageService) {
    return atom.packages.serviceHub.provide('code-actions', config.version, new CodeActionProvider(name, grammarScopes, config.priority, config.analyticsEventName, connectionToLanguageService));
  }

  getCodeActions(editor, range, diagnostics) {
    var _this = this;

    return (0, (_nuclideAnalytics || _load_nuclideAnalytics()).trackTiming)(this._analyticsEventName, (0, _asyncToGenerator.default)(function* () {
      const fileVersion = yield (0, (_nuclideOpenFiles || _load_nuclideOpenFiles()).getFileVersionOfEditor)(editor);
      const languageService = _this._connectionToLanguageService.getForUri(editor.getPath());
      if (languageService == null || fileVersion == null) {
        return [];
      }

      return (yield languageService).getCodeActions(fileVersion, range, diagnostics);
    }));
  }
}

exports.CodeActionProvider = CodeActionProvider; // Ensures that CodeActionProvider has all the fields and methods defined in
// the CodeActionProvider type in the atom-ide-code-actions package.
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

null;