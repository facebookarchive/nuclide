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

// The origin of this type is at nuclide-tokenized-text/lib/main.js
// When updating update both locations!

// The origin of this type is at nuclide-tokenized-text/lib/main.js
// When updating update both locations!

// The origin of this type is at nuclide-tokenized-text/lib/main.js
// When updating update both locations!
exports.dispose = dispose;
exports.getServerStatusUpdates = getServerStatusUpdates;
exports.flowFindDefinition = flowFindDefinition;
exports.flowFindDiagnostics = flowFindDiagnostics;
exports.flowGetAutocompleteSuggestions = flowGetAutocompleteSuggestions;

var flowGetType = _asyncToGenerator(function* (file, currentContents, line, column, includeRawType) {
  return getRootContainer().runWithRoot(file, function (root) {
    return root.flowGetType(file, currentContents, line, column, includeRawType);
  });
});

exports.flowGetType = flowGetType;

var flowGetCoverage = _asyncToGenerator(function* (file) {
  return getRootContainer().runWithRoot(file, function (root) {
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

var _FlowRootContainer2;

function _FlowRootContainer() {
  return _FlowRootContainer2 = require('./FlowRootContainer');
}

var rootContainer = null;

function getRootContainer() {
  if (rootContainer == null) {
    rootContainer = new (_FlowRootContainer2 || _FlowRootContainer()).FlowRootContainer();
  }
  return rootContainer;
}

function dispose() {
  if (rootContainer != null) {
    rootContainer.dispose();
    rootContainer = null;
  }
}

function getServerStatusUpdates() {
  return getRootContainer().getServerStatusUpdates();
}

function flowFindDefinition(file, currentContents, line, column) {
  return getRootContainer().runWithRoot(file, function (root) {
    return root.flowFindDefinition(file, currentContents, line, column);
  });
}

function flowFindDiagnostics(file, currentContents) {
  return getRootContainer().runWithRoot(file, function (root) {
    return root.flowFindDiagnostics(file, currentContents);
  });
}

function flowGetAutocompleteSuggestions(file, currentContents, line, column, prefix, activatedManually) {
  return getRootContainer().runWithRoot(file, function (root) {
    return root.flowGetAutocompleteSuggestions(file, currentContents, line, column, prefix, activatedManually);
  });
}

function flowGetOutline(currentContents) {
  return (_FlowRoot2 || _FlowRoot()).FlowRoot.flowGetOutline(currentContents);
}

function allowServerRestart() {
  for (var root of getRootContainer().getAllRoots()) {
    root.allowServerRestart();
  }
}

// The location of the .flowconfig where these messages came from.