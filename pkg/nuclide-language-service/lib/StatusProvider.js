'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.StatusProvider = undefined;

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

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

  constructor(name, grammars, priority, observeEventName, clickEventName, connectionToLanguageService, icon) {
    this.name = name;
    this.priority = priority;
    this.grammarScopes = grammars;
    this.icon = icon;
    this._observeEventName = observeEventName;
    this._clickEventName = clickEventName;
    this._connectionToLanguageService = connectionToLanguageService;
  }

  static register(name, grammars, config, connectionToLanguageService) {
    return atom.packages.serviceHub.provide('nuclide-language-status', config.version, new StatusProvider(name, grammars, config.priority, config.observeEventName, config.clickEventName, connectionToLanguageService));
  }

  observeStatus(editor) {
    return _rxjsBundlesRxMinJs.Observable.fromPromise(Promise.all([this._connectionToLanguageService.getForUri(editor.getPath()), (0, (_nuclideOpenFiles || _load_nuclideOpenFiles()).getFileVersionOfEditor)(editor)])).flatMap(([languageService, fileVersion]) => {
      if (languageService == null || fileVersion == null) {
        return _rxjsBundlesRxMinJs.Observable.of({ kind: 'null' });
      }
      return languageService.observeStatus(fileVersion).refCount().map(status => {
        (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)(this._observeEventName, { status });
        return status;
      });
    });
  }

  async clickStatus(editor, id, button) {
    return (0, (_nuclideAnalytics || _load_nuclideAnalytics()).trackTiming)(this._clickEventName, async () => {
      const fileVersion = await (0, (_nuclideOpenFiles || _load_nuclideOpenFiles()).getFileVersionOfEditor)(editor);
      const languageService = await this._connectionToLanguageService.getForUri(editor.getPath());
      if (languageService == null || fileVersion == null) {
        return;
      }
      await languageService.clickStatus(fileVersion, id, button);
    });
  }
}
exports.StatusProvider = StatusProvider;