"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.dispose = dispose;
exports.initialize = initialize;
exports.flowGetAst = flowGetAst;

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _config() {
  const data = require("./config");

  _config = function () {
    return data;
  };

  return data;
}

function _nuclideLanguageServiceRpc() {
  const data = require("../../nuclide-language-service-rpc");

  _nuclideLanguageServiceRpc = function () {
    return data;
  };

  return data;
}

function _nuclideOpenFilesRpc() {
  const data = require("../../nuclide-open-files-rpc");

  _nuclideOpenFilesRpc = function () {
    return data;
  };

  return data;
}

function _log4js() {
  const data = require("log4js");

  _log4js = function () {
    return data;
  };

  return data;
}

function _FlowSingleProjectLanguageService() {
  const data = require("./FlowSingleProjectLanguageService");

  _FlowSingleProjectLanguageService = function () {
    return data;
  };

  return data;
}

function _FlowServiceState() {
  const data = require("./FlowServiceState");

  _FlowServiceState = function () {
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
 * 
 * @format
 */
let state = null;

function getState() {
  if (state == null) {
    state = new (_FlowServiceState().FlowServiceState)();
  }

  return state;
}

function dispose() {
  if (state != null) {
    state.dispose();
    state = null;
  }
}

async function initialize(fileNotifier, host, config) {
  if (!(fileNotifier instanceof _nuclideOpenFilesRpc().FileCache)) {
    throw new Error("Invariant violation: \"fileNotifier instanceof FileCache\"");
  }

  const fileCache = fileNotifier;
  return new FlowLanguageService(fileCache, host, config);
}

class FlowLanguageService extends _nuclideLanguageServiceRpc().MultiProjectLanguageService {
  constructor(fileCache, host, config) {
    const logger = (0, _log4js().getLogger)('Flow');
    super();
    this.initialize(logger, fileCache, host, ['.flowconfig'], 'nearest', ['.js', '.jsx'], projectDir => {
      const execInfoContainer = getState().getExecInfoContainer();
      const singleProjectLS = new (_FlowSingleProjectLanguageService().FlowSingleProjectLanguageService)(projectDir, execInfoContainer, fileCache);
      const languageService = new (_nuclideLanguageServiceRpc().ServerLanguageService)(fileCache, singleProjectLS);
      return Promise.resolve(languageService);
    });

    for (const key of Object.keys(config)) {
      (0, _config().setConfig)(key, config[key]);
    }
  }

  async getOutline(fileVersion) {
    const ls = await this.getLanguageServiceForFile(fileVersion.filePath);

    if (ls != null) {
      return ls.getOutline(fileVersion);
    } else {
      const buffer = await (0, _nuclideOpenFilesRpc().getBufferAtVersion)(fileVersion);

      if (buffer == null) {
        return null;
      }

      return _FlowSingleProjectLanguageService().FlowSingleProjectLanguageService.getOutline(fileVersion.filePath, buffer, null, getState().getExecInfoContainer());
    }
  }

  customFindReferences(fileVersion, position, global_, multiHop) {
    return _RxMin.Observable.defer(async () => {
      const ls = await this.getLanguageServiceForFile(fileVersion.filePath);

      if (ls == null) {
        return;
      }

      const flowLs = ls.getSingleFileLanguageService();
      const buffer = await (0, _nuclideOpenFilesRpc().getBufferAtVersion)(fileVersion);

      if (buffer == null) {
        return null;
      }

      return flowLs.customFindReferences(fileVersion.filePath, buffer, position, global_, multiHop);
    }).publish();
  }

  getServerStatusUpdates() {
    return this.observeLanguageServices().mergeMap(languageService => {
      const singleProjectLS = languageService.getSingleFileLanguageService();
      const pathToRoot = singleProjectLS.getPathToRoot();
      return singleProjectLS.getServerStatusUpdates().map(status => ({
        pathToRoot,
        status
      }));
    }).publish();
  }

  async allowServerRestart() {
    const languageServices = await this.getAllLanguageServices();
    const flowLanguageServices = languageServices.map(ls => ls.getSingleFileLanguageService());
    flowLanguageServices.forEach(ls => ls.allowServerRestart());
  }

} // Unfortunately we have to duplicate a lot of things here to make FlowLanguageService remotable.


function flowGetAst(file, currentContents) {
  return _FlowSingleProjectLanguageService().FlowSingleProjectLanguageService.flowGetAst(null, currentContents, getState().getExecInfoContainer());
}