'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.flowFindRefs = exports.flowGetCoverage = exports.flowGetType = exports.initialize = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let initialize = exports.initialize = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (fileNotifier) {
    return new (_nuclideLanguageServiceRpc || _load_nuclideLanguageServiceRpc()).ServerLanguageService(fileNotifier, new FlowSingleFileLanguageService(fileNotifier));
  });

  return function initialize(_x) {
    return _ref.apply(this, arguments);
  };
})();

let flowGetType = exports.flowGetType = (() => {
  var _ref2 = (0, _asyncToGenerator.default)(function* (file, currentContents, line, column) {
    return getState().getRootContainer().runWithRoot(file, function (root) {
      return root.flowGetType(file, currentContents, line, column);
    });
  });

  return function flowGetType(_x2, _x3, _x4, _x5) {
    return _ref2.apply(this, arguments);
  };
})();

let flowGetCoverage = exports.flowGetCoverage = (() => {
  var _ref3 = (0, _asyncToGenerator.default)(function* (file) {
    return getState().getRootContainer().runWithRoot(file, function (root) {
      return root.flowGetCoverage(file);
    });
  });

  return function flowGetCoverage(_x6) {
    return _ref3.apply(this, arguments);
  };
})();

let flowFindRefs = exports.flowFindRefs = (() => {
  var _ref4 = (0, _asyncToGenerator.default)(function* (file, currentContents, position) {
    return getState().getRootContainer().runWithRoot(file, function (root) {
      return root.flowFindRefs(file, currentContents, position);
    });
  });

  return function flowFindRefs(_x7, _x8, _x9) {
    return _ref4.apply(this, arguments);
  };
})();

exports.dispose = dispose;
exports.getServerStatusUpdates = getServerStatusUpdates;
exports.flowFindDefinition = flowFindDefinition;
exports.flowFindDiagnostics = flowFindDiagnostics;
exports.flowGetAutocompleteSuggestions = flowGetAutocompleteSuggestions;
exports.flowGetOutline = flowGetOutline;
exports.flowGetAst = flowGetAst;
exports.allowServerRestart = allowServerRestart;

var _nuclideLanguageServiceRpc;

function _load_nuclideLanguageServiceRpc() {
  return _nuclideLanguageServiceRpc = require('../../nuclide-language-service-rpc');
}

var _range;

function _load_range() {
  return _range = require('../../commons-node/range');
}

var _nuclideFlowCommon;

function _load_nuclideFlowCommon() {
  return _nuclideFlowCommon = require('../../nuclide-flow-common');
}

var _FlowRoot;

function _load_FlowRoot() {
  return _FlowRoot = require('./FlowRoot');
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
    return flowFindDiagnostics(filePath, null);
  }

  observeDiagnostics() {
    throw new Error('Not Yet Implemented');
  }

  getAutocompleteSuggestions(filePath, buffer, position, activatedManually, prefix) {
    return (0, _asyncToGenerator.default)(function* () {
      const results = yield flowGetAutocompleteSuggestions(filePath, buffer.getText(), position, activatedManually, prefix);
      return (0, (_nuclideFlowCommon || _load_nuclideFlowCommon()).filterResultsByPrefix)(prefix, results);
    })();
  }

  getDefinition(filePath, buffer, position) {
    return (0, _asyncToGenerator.default)(function* () {
      const match = (0, (_range || _load_range()).wordAtPositionFromBuffer)(buffer, position, (_nuclideFlowCommon || _load_nuclideFlowCommon()).JAVASCRIPT_WORD_REGEX);
      if (match == null) {
        return null;
      }
      const loc = yield flowFindDefinition(filePath, buffer.getText(), position.row + 1, position.column + 1);
      if (loc == null) {
        return null;
      }
      return {
        queryRange: [match.range],
        definitions: [{
          path: loc.file,
          position: loc.point,
          language: 'Flow'
        }]
      };
    })();
  }

  getDefinitionById(file, id) {
    throw new Error('Not Yet Implemented');
  }

  findReferences(filePath, buffer, position) {
    throw new Error('Not Yet Implemented');
  }

  getCoverage(filePath) {
    return flowGetCoverage(filePath);
  }

  getOutline(filePath, buffer) {
    return flowGetOutline(filePath, buffer.getText());
  }

  typeHint(filePath, buffer, position) {
    throw new Error('Not Yet Implemented');
  }

  highlight(filePath, buffer, position) {
    return flowFindRefs(filePath, buffer.getText(), position);
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

function flowFindDefinition(file, currentContents, line, column) {
  return getState().getRootContainer().runWithRoot(file, root => root.flowFindDefinition(file, currentContents, line, column));
}

function flowFindDiagnostics(file, currentContents) {
  return getState().getRootContainer().runWithRoot(file, root => root.flowFindDiagnostics(file, currentContents));
}

function flowGetAutocompleteSuggestions(file, currentContents, position, activatedManually, prefix) {
  return getState().getRootContainer().runWithRoot(file, root => root.flowGetAutocompleteSuggestions(file, currentContents, position, activatedManually, prefix));
}

function flowGetOutline(file, currentContents) {
  return getState().getRootContainer().runWithOptionalRoot(file, root => (_FlowRoot || _load_FlowRoot()).FlowRoot.flowGetOutline(root, currentContents, getState().getExecInfoContainer()));
}

function flowGetAst(file, currentContents) {
  return getState().getRootContainer().runWithOptionalRoot(file, root => (_FlowRoot || _load_FlowRoot()).FlowRoot.flowGetAst(root, currentContents, getState().getExecInfoContainer()));
}

function allowServerRestart() {
  for (const root of getState().getRootContainer().getAllRoots()) {
    root.allowServerRestart();
  }
}