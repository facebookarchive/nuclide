"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CodeHighlightProvider = void 0;

function _nuclideAnalytics() {
  const data = require("../../nuclide-analytics");

  _nuclideAnalytics = function () {
    return data;
  };

  return data;
}

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

var _atom = require("atom");

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
class CodeHighlightProvider {
  constructor(name, grammarScopes, priority, analyticsEventName, connectionToLanguageService) {
    this.name = name;
    this.grammarScopes = grammarScopes;
    this.priority = priority;
    this._analyticsEventName = analyticsEventName;
    this._connectionToLanguageService = connectionToLanguageService;
  }

  highlight(editor, position) {
    return (0, _nuclideAnalytics().trackTiming)(this._analyticsEventName, async () => {
      const fileVersion = await (0, _nuclideOpenFiles().getFileVersionOfEditor)(editor);

      const languageService = this._connectionToLanguageService.getForUri(editor.getPath());

      if (languageService == null || fileVersion == null) {
        return null;
      }

      const result = await (await languageService).highlight(fileVersion, position);

      if (result == null) {
        return null;
      }

      return result.map(range => new _atom.Range(range.start, range.end));
    });
  }

  static register(name, grammarScopes, config, connectionToLanguageService) {
    return atom.packages.serviceHub.provide('code-highlight', config.version, new CodeHighlightProvider(name, grammarScopes, config.priority, config.analyticsEventName, connectionToLanguageService));
  }

}

exports.CodeHighlightProvider = CodeHighlightProvider;
null;