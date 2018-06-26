'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FindReferencesProvider = undefined;

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

class FindReferencesProvider {

  constructor(name, grammarScopes, analyticsEventName, connectionToLanguageService) {
    this.name = name;
    this.grammarScopes = grammarScopes;
    this._analyticsEventName = analyticsEventName;
    this._connectionToLanguageService = connectionToLanguageService;
  }

  static register(name, grammarScopes, config, connectionToLanguageService) {
    return atom.packages.serviceHub.provide('find-references', config.version, new FindReferencesProvider(name, grammarScopes, config.analyticsEventName, connectionToLanguageService));
  }

  async isEditorSupported(textEditor) {
    return textEditor.getPath() != null && this.grammarScopes.includes(textEditor.getGrammar().scopeName);
  }

  findReferences(editor, position) {
    return (0, (_nuclideAnalytics || _load_nuclideAnalytics()).trackTiming)(this._analyticsEventName, async () => {
      const fileVersion = await (0, (_nuclideOpenFiles || _load_nuclideOpenFiles()).getFileVersionOfEditor)(editor);
      const languageService = this._connectionToLanguageService.getForUri(editor.getPath());
      if (languageService == null || fileVersion == null) {
        return null;
      }

      return (await languageService).findReferences(fileVersion, position).refCount().toPromise();
    });
  }
}

exports.FindReferencesProvider = FindReferencesProvider; /**
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