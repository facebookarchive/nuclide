"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.StatusProvider = void 0;

var _RxMin = require("rxjs/bundles/Rx.min.js");

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
class StatusProvider {
  constructor(name, grammars, connectionToLanguageService, config) {
    this.name = name;
    this.grammarScopes = grammars;
    this._connectionToLanguageService = connectionToLanguageService;
    this.priority = config.priority;
    this.description = config.description;
    this.icon = config.icon;
    this.iconMarkdown = config.iconMarkdown;
    this._observeEventName = config.observeEventName;
    this._clickEventName = config.clickEventName;
  }

  static register(name, grammars, config, connectionToLanguageService) {
    return atom.packages.serviceHub.provide('nuclide-language-status', config.version, new StatusProvider(name, grammars, connectionToLanguageService, config));
  }

  observeStatus(editor) {
    return _RxMin.Observable.fromPromise(Promise.all([this._connectionToLanguageService.getForUri(editor.getPath()), (0, _nuclideOpenFiles().getFileVersionOfEditor)(editor)])).flatMap(([languageService, fileVersion]) => {
      if (languageService == null || fileVersion == null) {
        return _RxMin.Observable.of({
          kind: 'null'
        });
      }

      return languageService.observeStatus(fileVersion).refCount().map(status => {
        (0, _nuclideAnalytics().track)(this._observeEventName, {
          status
        });
        return status;
      });
    });
  }

  async clickStatus(editor, id, button) {
    return (0, _nuclideAnalytics().trackTiming)(this._clickEventName, async () => {
      const fileVersion = await (0, _nuclideOpenFiles().getFileVersionOfEditor)(editor);
      const languageService = await this._connectionToLanguageService.getForUri(editor.getPath());

      if (languageService == null || fileVersion == null) {
        return;
      }

      await languageService.clickStatus(fileVersion, id, button);
    });
  }

}

exports.StatusProvider = StatusProvider;