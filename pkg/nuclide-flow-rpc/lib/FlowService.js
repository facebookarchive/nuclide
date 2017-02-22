'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.initialize = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let initialize = exports.initialize = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (fileNotifier) {
    return new (_nuclideLanguageServiceRpc || _load_nuclideLanguageServiceRpc()).ServerLanguageService(fileNotifier, new FlowSingleFileLanguageService(fileNotifier));
  });

  return function initialize(_x) {
    return _ref.apply(this, arguments);
  };
})();

exports.dispose = dispose;
exports.getServerStatusUpdates = getServerStatusUpdates;
exports.flowGetAst = flowGetAst;
exports.allowServerRestart = allowServerRestart;

var _nuclideLanguageServiceRpc;

function _load_nuclideLanguageServiceRpc() {
  return _nuclideLanguageServiceRpc = require('../../nuclide-language-service-rpc');
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
let state = null; /**
                   * Copyright (c) 2015-present, Facebook, Inc.
                   * All rights reserved.
                   *
                   * This source code is licensed under the license found in the LICENSE file in
                   * the root directory of this source tree.
                   *
                   * 
                   */

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

class FlowSingleFileLanguageService {
  constructor(fileNotifier) {}

  dispose() {}

  getDiagnostics(filePath, buffer) {
    return getState().getRootContainer().runWithRoot(filePath, root => root.getDiagnostics(filePath, buffer));
  }

  observeDiagnostics() {
    throw new Error('Not Yet Implemented');
  }

  getAutocompleteSuggestions(filePath, buffer, position, activatedManually, prefix) {
    return getState().getRootContainer().runWithRoot(filePath, root => root.getAutocompleteSuggestions(filePath, buffer, position, activatedManually, prefix));
  }

  getDefinition(filePath, buffer, position) {
    return getState().getRootContainer().runWithRoot(filePath, root => root.getDefinition(filePath, buffer, position));
  }

  getDefinitionById(file, id) {
    throw new Error('Not Yet Implemented');
  }

  findReferences(filePath, buffer, position) {
    throw new Error('Not Yet Implemented');
  }

  getCoverage(filePath) {
    return getState().getRootContainer().runWithRoot(filePath, root => root.getCoverage(filePath));
  }

  getOutline(filePath, buffer) {
    return getState().getRootContainer().runWithOptionalRoot(filePath, root => (_FlowSingleProjectLanguageService || _load_FlowSingleProjectLanguageService()).FlowSingleProjectLanguageService.getOutline(filePath, buffer, root, getState().getExecInfoContainer()));
  }

  typeHint(filePath, buffer, position) {
    return getState().getRootContainer().runWithRoot(filePath, root => root.typeHint(filePath, buffer, position));
  }

  highlight(filePath, buffer, position) {
    return getState().getRootContainer().runWithRoot(filePath, root => root.highlight(filePath, buffer, position));
  }

  formatSource(filePath, buffer, range) {
    throw new Error('Not Yet Implemented');
  }

  formatEntireFile(filePath, buffer, range) {
    throw new Error('Not implemented');
  }

  getEvaluationExpression(filePath, buffer, position) {
    throw new Error('Not Yet Implemented');
  }

  getProjectRoot(fileUri) {
    return (0, _asyncToGenerator.default)(function* () {
      const flowRoot = yield getState().getRootContainer().getRootForPath(fileUri);
      return flowRoot == null ? null : flowRoot.getPathToRoot();
    })();
  }

  isFileInProject(fileUri) {
    throw new Error('Not Yet Implemented');
  }
}

function getServerStatusUpdates() {
  return getState().getRootContainer().getServerStatusUpdates().publish();
}

function flowGetAst(file, currentContents) {
  return getState().getRootContainer().runWithOptionalRoot(file, root => (_FlowSingleProjectLanguageService || _load_FlowSingleProjectLanguageService()).FlowSingleProjectLanguageService.flowGetAst(root, currentContents, getState().getExecInfoContainer()));
}

function allowServerRestart() {
  for (const root of getState().getRootContainer().getAllRoots()) {
    root.allowServerRestart();
  }
}