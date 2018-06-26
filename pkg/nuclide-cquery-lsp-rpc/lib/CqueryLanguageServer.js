'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _fsPromise;

function _load_fsPromise() {
  return _fsPromise = _interopRequireDefault(require('../../../modules/nuclide-commons/fsPromise'));
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _nuclideLanguageServiceRpc;

function _load_nuclideLanguageServiceRpc() {
  return _nuclideLanguageServiceRpc = require('../../nuclide-language-service-rpc');
}

var _CqueryLanguageClient;

function _load_CqueryLanguageClient() {
  return _CqueryLanguageClient = require('./CqueryLanguageClient');
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

class CqueryLanguageServer extends (_nuclideLanguageServiceRpc || _load_nuclideLanguageServiceRpc()).MultiProjectLanguageService {

  constructor(host) {
    super();
    this._host = host;
    this._languageId = 'cquery';
  }

  async requestLocationsCommand(methodName, path, point) {
    const cqueryProcess = await this.getLanguageServiceForFile(path);
    if (cqueryProcess) {
      return cqueryProcess.requestLocationsCommand(methodName, path, point);
    } else {
      this._host.consoleNotification(this._languageId, 'warning', 'Could not freshen: no cquery index found for ' + path);
      return [];
    }
  }

  async freshenIndexForFile(file) {
    const cqueryProcess = await this.getLanguageServiceForFile(file);
    if (cqueryProcess) {
      cqueryProcess.freshenIndex();
    } else {
      this._host.consoleNotification(this._languageId, 'warning', 'Could not freshen: no cquery index found for ' + file);
    }
  }

  async restartProcessForFile(file) {
    const projectDir = await this.findProjectDir(file);
    const cqueryProcess = await this.getLanguageServiceForFile(file);
    if (projectDir != null && cqueryProcess != null) {
      const cacheDir = cqueryProcess.getCacheDirectory();
      this._processes.delete(projectDir);
      await (_fsPromise || _load_fsPromise()).default.rimraf(cacheDir);
    } else {
      this._host.consoleNotification(this._languageId, 'warning', 'Could not restart: no cquery index found for ' + file);
    }
  }

  observeStatus(fileVersion) {
    this._observeStatusPromiseResolver();
    // Concat the observable to itself in case the language service for a file
    // changes but the version has not (e.g. the underlying service restarts).
    const factory = () => _rxjsBundlesRxMinJs.Observable.fromPromise(this.getLanguageServiceForFile(fileVersion.filePath)).flatMap(ls =>
    // If we receive a null language service then don't restart.
    ls != null ? ls.observeStatus(fileVersion).refCount().concat(_rxjsBundlesRxMinJs.Observable.defer(factory)) : _rxjsBundlesRxMinJs.Observable.empty());
    return factory().publish();
  }
}
exports.default = CqueryLanguageServer;