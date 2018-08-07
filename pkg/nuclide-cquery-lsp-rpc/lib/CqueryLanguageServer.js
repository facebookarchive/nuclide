"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _fsPromise() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/fsPromise"));

  _fsPromise = function () {
    return data;
  };

  return data;
}

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _nuclideLanguageServiceRpc() {
  const data = require("../../nuclide-language-service-rpc");

  _nuclideLanguageServiceRpc = function () {
    return data;
  };

  return data;
}

function _CqueryLanguageClient() {
  const data = require("./CqueryLanguageClient");

  _CqueryLanguageClient = function () {
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
class CqueryLanguageServer extends _nuclideLanguageServiceRpc().MultiProjectLanguageService {
  constructor(host) {
    super();
    this._host = host;
    this._languageId = 'cquery';
  }

  async restartProcessForFile(file) {
    const projectDir = await this.findProjectDir(file);
    const cqueryProcess = await this.getLanguageServiceForFile(file);

    if (projectDir != null && cqueryProcess != null) {
      const cacheDir = cqueryProcess.getCacheDirectory();

      this._processes.delete(projectDir);

      await _fsPromise().default.rimraf(cacheDir);
    } else {
      this._host.consoleNotification(this._languageId, 'warning', 'Could not restart: no cquery index found for ' + file);
    }
  }

  observeStatus(fileVersion) {
    this._observeStatusPromiseResolver(); // Concat the observable to itself in case the language service for a file
    // changes but the version has not (e.g. the underlying service restarts).


    const factory = () => _RxMin.Observable.fromPromise(this.getLanguageServiceForFile(fileVersion.filePath)).flatMap(ls => // If we receive a null language service then don't restart.
    ls != null ? ls.observeStatus(fileVersion).refCount().concat(_RxMin.Observable.defer(factory)) : _RxMin.Observable.empty());

    return factory().publish();
  }

}

exports.default = CqueryLanguageServer;