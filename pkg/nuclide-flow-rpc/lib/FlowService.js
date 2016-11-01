'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.flowGetCoverage = exports.flowGetType = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let flowGetType = exports.flowGetType = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (file, currentContents, line, column, includeRawType) {
    return getState().getRootContainer().runWithRoot(file, function (root) {
      return root.flowGetType(file, currentContents, line, column, includeRawType);
    });
  });

  return function flowGetType(_x, _x2, _x3, _x4, _x5) {
    return _ref.apply(this, arguments);
  };
})();

let flowGetCoverage = exports.flowGetCoverage = (() => {
  var _ref2 = (0, _asyncToGenerator.default)(function* (file) {
    return getState().getRootContainer().runWithRoot(file, function (root) {
      return root.flowGetCoverage(file);
    });
  });

  return function flowGetCoverage(_x6) {
    return _ref2.apply(this, arguments);
  };
})();

exports.dispose = dispose;
exports.getServerStatusUpdates = getServerStatusUpdates;
exports.flowFindDefinition = flowFindDefinition;
exports.flowFindDiagnostics = flowFindDiagnostics;
exports.flowGetAutocompleteSuggestions = flowGetAutocompleteSuggestions;
exports.flowGetOutline = flowGetOutline;
exports.allowServerRestart = allowServerRestart;

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


// Diagnostic information, returned from findDiagnostics.
let state = null;

/*
 * Each error or warning can consist of any number of different messages from
 * Flow to help explain the problem and point to different locations that may be
 * of interest.
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

function getServerStatusUpdates() {
  return getState().getRootContainer().getServerStatusUpdates().publish();
}

function flowFindDefinition(file, currentContents, line, column) {
  return getState().getRootContainer().runWithRoot(file, root => root.flowFindDefinition(file, currentContents, line, column));
}

function flowFindDiagnostics(file, currentContents) {
  return getState().getRootContainer().runWithRoot(file, root => root.flowFindDiagnostics(file, currentContents));
}

function flowGetAutocompleteSuggestions(file, currentContents, line, column, prefix, activatedManually) {
  return getState().getRootContainer().runWithRoot(file, root => root.flowGetAutocompleteSuggestions(file, currentContents, line, column, prefix, activatedManually));
}

function flowGetOutline(file, currentContents) {
  return getState().getRootContainer().runWithOptionalRoot(file, root => (_FlowRoot || _load_FlowRoot()).FlowRoot.flowGetOutline(root, currentContents, getState().getExecInfoContainer()));
}

function allowServerRestart() {
  for (const root of getState().getRootContainer().getAllRoots()) {
    root.allowServerRestart();
  }
}