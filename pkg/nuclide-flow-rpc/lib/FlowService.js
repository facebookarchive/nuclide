Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

// Diagnostic information, returned from findDiagnostics.

/*
 * Each error or warning can consist of any number of different messages from
 * Flow to help explain the problem and point to different locations that may be
 * of interest.
 */

// If types are added here, make sure to also add them to FlowConstants.js. This needs to be the
// canonical type definition so that we can use these in the service framework.
exports.dispose = dispose;
exports.getServerStatusUpdates = getServerStatusUpdates;
exports.flowFindDefinition = flowFindDefinition;
exports.flowFindDiagnostics = flowFindDiagnostics;
exports.flowGetAutocompleteSuggestions = flowGetAutocompleteSuggestions;

var flowGetType = _asyncToGenerator(function* (file, currentContents, line, column, includeRawType) {
  return getState().getRootContainer().runWithRoot(file, function (root) {
    return root.flowGetType(file, currentContents, line, column, includeRawType);
  });
});

exports.flowGetType = flowGetType;

var flowGetCoverage = _asyncToGenerator(function* (file) {
  return getState().getRootContainer().runWithRoot(file, function (root) {
    return root.flowGetCoverage(file);
  });
});

exports.flowGetCoverage = flowGetCoverage;
exports.flowGetOutline = flowGetOutline;
exports.allowServerRestart = allowServerRestart;

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

var _FlowRoot2;

function _FlowRoot() {
  return _FlowRoot2 = require('./FlowRoot');
}

var _FlowServiceState2;

function _FlowServiceState() {
  return _FlowServiceState2 = require('./FlowServiceState');
}

var state = null;

function getState() {
  if (state == null) {
    state = new (_FlowServiceState2 || _FlowServiceState()).FlowServiceState();
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
  return getState().getRootContainer().runWithRoot(file, function (root) {
    return root.flowFindDefinition(file, currentContents, line, column);
  });
}

function flowFindDiagnostics(file, currentContents) {
  return getState().getRootContainer().runWithRoot(file, function (root) {
    return root.flowFindDiagnostics(file, currentContents);
  });
}

function flowGetAutocompleteSuggestions(file, currentContents, line, column, prefix, activatedManually) {
  return getState().getRootContainer().runWithRoot(file, function (root) {
    return root.flowGetAutocompleteSuggestions(file, currentContents, line, column, prefix, activatedManually);
  });
}

function flowGetOutline(file, currentContents) {
  return getState().getRootContainer().runWithOptionalRoot(file, function (root) {
    return (_FlowRoot2 || _FlowRoot()).FlowRoot.flowGetOutline(root, currentContents, getState().getExecInfoContainer());
  });
}

function allowServerRestart() {
  for (var root of getState().getRootContainer().getAllRoots()) {
    root.allowServerRestart();
  }
}

// The location of the .flowconfig where these messages came from.