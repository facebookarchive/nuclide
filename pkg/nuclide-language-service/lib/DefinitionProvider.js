'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DefinitionProvider = undefined;

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

class DefinitionProvider {

  constructor(name, grammars, priority, definitionEventName, wordRegExp, connectionToLanguageService) {
    this.name = name;
    this.priority = priority;
    this.grammarScopes = grammars;
    this.wordRegExp = wordRegExp;
    this._definitionEventName = definitionEventName;
    this._connectionToLanguageService = connectionToLanguageService;
  }

  static register(name, grammars, config, connectionToLanguageService) {
    return atom.packages.serviceHub.provide('definitions', config.version, new DefinitionProvider(name, grammars, config.priority, config.definitionEventName, config.wordRegExp, connectionToLanguageService));
  }

  async getDefinition(editor, position) {
    return (0, (_nuclideAnalytics || _load_nuclideAnalytics()).trackTiming)(this._definitionEventName, async () => {
      const fileVersion = await (0, (_nuclideOpenFiles || _load_nuclideOpenFiles()).getFileVersionOfEditor)(editor);
      const languageService = this._connectionToLanguageService.getForUri(editor.getPath());
      if (languageService == null || fileVersion == null) {
        return null;
      }
      return (await languageService).getDefinition(fileVersion, position);
    });
  }
}
exports.DefinitionProvider = DefinitionProvider; /**
                                                  * Copyright (c) 2015-present, Facebook, Inc.
                                                  * All rights reserved.
                                                  *
                                                  * This source code is licensed under the license found in the LICENSE file in
                                                  * the root directory of this source tree.
                                                  *
                                                  *  strict-local
                                                  * @format
                                                  */