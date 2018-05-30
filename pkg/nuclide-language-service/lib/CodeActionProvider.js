'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CodeActionProvider = undefined;

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

class CodeActionProvider {

  constructor(name, grammarScopes, config, connectionToLanguageService) {
    this.name = name;
    this.grammarScopes = grammarScopes;
    this.priority = config.priority;
    this._analyticsEventName = config.analyticsEventName;
    this._applyAnalyticsEventName = config.applyAnalyticsEventName;
    this._connectionToLanguageService = connectionToLanguageService;
  }

  static register(name, grammarScopes, config, connectionToLanguageService) {
    return atom.packages.serviceHub.provide('code-actions', config.version, new CodeActionProvider(name, grammarScopes, config, connectionToLanguageService));
  }

  getCodeActions(editor, range, diagnostics) {
    return (0, (_nuclideAnalytics || _load_nuclideAnalytics()).trackTiming)(this._analyticsEventName, async () => {
      const fileVersion = await (0, (_nuclideOpenFiles || _load_nuclideOpenFiles()).getFileVersionOfEditor)(editor);
      const languageService = this._connectionToLanguageService.getForUri(editor.getPath());
      if (languageService == null || fileVersion == null) {
        return [];
      }

      const codeActions = await (await languageService).getCodeActions(fileVersion, range,
      // $FlowIssue: Flow doesn't understand this.
      diagnostics.map(d => Object.assign({}, d, { actions: undefined })));

      return codeActions.map(action => ({
        apply: () => {
          return (0, (_nuclideAnalytics || _load_nuclideAnalytics()).trackTiming)(this._applyAnalyticsEventName, action.apply.bind(action));
        },
        getTitle() {
          return action.getTitle();
        },
        dispose() {
          return action.dispose();
        }
      }));
    });
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