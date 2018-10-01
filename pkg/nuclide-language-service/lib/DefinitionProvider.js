"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DefinitionProvider = void 0;

function _nuclideRemoteConnection() {
  const data = require("../../nuclide-remote-connection");

  _nuclideRemoteConnection = function () {
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

function _nuclideOpenFiles() {
  const data = require("../../nuclide-open-files");

  _nuclideOpenFiles = function () {
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
 *  strict-local
 * @format
 */
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
    return (0, _nuclideAnalytics().trackTiming)(this._definitionEventName, async () => {
      const fileVersion = await (0, _nuclideOpenFiles().getFileVersionOfEditor)(editor);

      const languageService = this._connectionToLanguageService.getForUri(editor.getPath());

      if (languageService == null || fileVersion == null) {
        return null;
      }

      return (await languageService).getDefinition(fileVersion, position);
    });
  }

}

exports.DefinitionProvider = DefinitionProvider;