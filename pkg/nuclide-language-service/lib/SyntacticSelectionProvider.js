"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SyntacticSelectionProvider = void 0;

function _nuclideRemoteConnection() {
  const data = require("../../nuclide-remote-connection");

  _nuclideRemoteConnection = function () {
    return data;
  };

  return data;
}

function _nuclideOpenFiles() {
  const data = require("../../nuclide-open-files");

  _nuclideOpenFiles = function () {
    return data;
  };

  return data;
}

function _nuclideAnalytics() {
  const data = require("../../nuclide-analytics");

  _nuclideAnalytics = function () {
    return data;
  };

  return data;
}

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
class SyntacticSelectionProvider {
  constructor(name, grammarScopes, priority, expandAnalyticsEventName, collapseAnalyticsEventName, connectionToLanguageService) {
    this.name = name;
    this.grammarScopes = grammarScopes;
    this.priority = priority;
    this._expandAnalyticsEventName = expandAnalyticsEventName;
    this._collapseAnalyticsEventName = collapseAnalyticsEventName;
    this._connectionToLanguageService = connectionToLanguageService;
  }

  static register(name, grammarScopes, config, connectionToLanguageService) {
    return atom.packages.serviceHub.provide('nuclide-syntactic-selection', config.version, new SyntacticSelectionProvider(name, grammarScopes, config.priority, config.expandAnalyticsEventName, config.collapseAnalyticsEventName, connectionToLanguageService));
  }

  getExpandedSelectionRange(editor) {
    return (0, _nuclideAnalytics().trackTiming)(this._expandAnalyticsEventName, async () => {
      const fileVersion = await (0, _nuclideOpenFiles().getFileVersionOfEditor)(editor);

      const languageService = this._connectionToLanguageService.getForUri(editor.getPath());

      if (languageService == null || fileVersion == null) {
        return null;
      }

      return (await languageService).getExpandedSelectionRange(fileVersion, editor.getSelectedBufferRange());
    });
  }

  getCollapsedSelectionRange(editor, originalCursorPosition) {
    return (0, _nuclideAnalytics().trackTiming)(this._collapseAnalyticsEventName, async () => {
      const fileVersion = await (0, _nuclideOpenFiles().getFileVersionOfEditor)(editor);

      const languageService = this._connectionToLanguageService.getForUri(editor.getPath());

      if (languageService == null || fileVersion == null) {
        return null;
      }

      return (await languageService).getCollapsedSelectionRange(fileVersion, editor.getSelectedBufferRange(), originalCursorPosition);
    });
  }

} // Ensures that SyntacticSelectionProvider has all the fields and methods defined in
// the SyntacticSelectionProvider type in the atom-ide-syntactic-selection package.


exports.SyntacticSelectionProvider = SyntacticSelectionProvider;
null;