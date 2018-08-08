"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RenameProvider = void 0;

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
class RenameProvider {
  constructor(name, grammarScopes, priority, analyticsEventName, connectionToLanguageService) {
    this.name = name;
    this.grammarScopes = grammarScopes;
    this.priority = priority;
    this._analyticsEventName = analyticsEventName;
    this._connectionToLanguageService = connectionToLanguageService;
  }

  static register(name, grammarScopes, config, connectionToLanguageService) {
    const disposable = new (_UniversalDisposable().default)(atom.packages.serviceHub.provide('nuclide-refactor', config.version, new RenameProvider(name, grammarScopes, config.priority, config.analyticsEventName, connectionToLanguageService).provide()));
    return disposable;
  }

  provide() {
    return {
      rename: this.rename.bind(this),
      grammarScopes: this.grammarScopes,
      priority: this.priority
    };
  }

  rename(editor, position, newName) {
    return (0, _nuclideAnalytics().trackTiming)(this._analyticsEventName, async () => {
      const fileVersion = await (0, _nuclideOpenFiles().getFileVersionOfEditor)(editor);

      const languageService = this._connectionToLanguageService.getForUri(editor.getPath());

      if (languageService == null || fileVersion == null) {
        return null;
      }

      return (await languageService).rename(fileVersion, position, newName).refCount().toPromise();
    });
  }

}

exports.RenameProvider = RenameProvider;