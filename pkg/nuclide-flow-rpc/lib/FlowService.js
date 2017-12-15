'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.initialize = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let initialize = exports.initialize = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (fileNotifier, host, config) {
    if (!(fileNotifier instanceof (_nuclideOpenFilesRpc || _load_nuclideOpenFilesRpc()).FileCache)) {
      throw new Error('Invariant violation: "fileNotifier instanceof FileCache"');
    }

    const fileCache = fileNotifier;
    return new FlowLanguageService(fileCache, host, config);
  });

  return function initialize(_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
})();

exports.dispose = dispose;
exports.flowGetAst = flowGetAst;

var _config;

function _load_config() {
  return _config = require('./config');
}

var _nuclideLanguageServiceRpc;

function _load_nuclideLanguageServiceRpc() {
  return _nuclideLanguageServiceRpc = require('../../nuclide-language-service-rpc');
}

var _nuclideOpenFilesRpc;

function _load_nuclideOpenFilesRpc() {
  return _nuclideOpenFilesRpc = require('../../nuclide-open-files-rpc');
}

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

var _FlowSingleProjectLanguageService;

function _load_FlowSingleProjectLanguageService() {
  return _FlowSingleProjectLanguageService = require('./FlowSingleProjectLanguageService');
}

var _FlowServiceState;

function _load_FlowServiceState() {
  return _FlowServiceState = require('./FlowServiceState');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// If types are added here, make sure to also add them to FlowConstants.js. This needs to be the
// canonical type definition so that we can use these in the service framework.
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
    state = new (_FlowServiceState || _load_FlowServiceState()).FlowServiceState();
  }
  return state;
}

function dispose() {
  if (state != null) {
    state.dispose();
    state = null;
  }
}

class FlowLanguageService extends (_nuclideLanguageServiceRpc || _load_nuclideLanguageServiceRpc()).MultiProjectLanguageService {
  constructor(fileCache, host, config) {
    const logger = (0, (_log4js || _load_log4js()).getLogger)('Flow');
    super();
    this.initialize(logger, fileCache, host, ['.flowconfig'], ['.js', '.jsx'], projectDir => {
      const execInfoContainer = getState().getExecInfoContainer();
      const singleProjectLS = new (_FlowSingleProjectLanguageService || _load_FlowSingleProjectLanguageService()).FlowSingleProjectLanguageService(projectDir, execInfoContainer, fileCache);
      const languageService = new (_nuclideLanguageServiceRpc || _load_nuclideLanguageServiceRpc()).ServerLanguageService(fileCache, singleProjectLS);
      return Promise.resolve(languageService);
    });
    for (const key of Object.keys(config)) {
      (0, (_config || _load_config()).setConfig)(key, config[key]);
    }
  }

  getOutline(fileVersion) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      const ls = yield _this.getLanguageServiceForFile(fileVersion.filePath);
      if (ls != null) {
        return ls.getOutline(fileVersion);
      } else {
        const buffer = yield (0, (_nuclideOpenFilesRpc || _load_nuclideOpenFilesRpc()).getBufferAtVersion)(fileVersion);
        if (buffer == null) {
          return null;
        }
        return (_FlowSingleProjectLanguageService || _load_FlowSingleProjectLanguageService()).FlowSingleProjectLanguageService.getOutline(fileVersion.filePath, buffer, null, getState().getExecInfoContainer());
      }
    })();
  }

  getServerStatusUpdates() {
    return this.observeLanguageServices().mergeMap(languageService => {
      const singleProjectLS = languageService.getSingleFileLanguageService();
      const pathToRoot = singleProjectLS.getPathToRoot();
      return singleProjectLS.getServerStatusUpdates().map(status => ({ pathToRoot, status }));
    }).publish();
  }

  allowServerRestart() {
    var _this2 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const languageServices = yield _this2.getAllLanguageServices();
      const flowLanguageServices = languageServices.map(function (ls) {
        return ls.getSingleFileLanguageService();
      });
      flowLanguageServices.forEach(function (ls) {
        return ls.allowServerRestart();
      });
    })();
  }
}

// Unfortunately we have to duplicate a lot of things here to make FlowLanguageService remotable.
function flowGetAst(file, currentContents) {
  return (_FlowSingleProjectLanguageService || _load_FlowSingleProjectLanguageService()).FlowSingleProjectLanguageService.flowGetAst(null, currentContents, getState().getExecInfoContainer());
}