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

var getCoverage = _asyncToGenerator(function* (path) {
  var flowService = yield (0, (_FlowServiceFactory2 || _FlowServiceFactory()).getFlowServiceByNuclideUri)(path);
  (0, (_assert2 || _assert()).default)(flowService != null);

  var flowCoverage = yield flowService.flowGetCoverage(path);
  return flowCoverageToCoverage(flowCoverage);
});

exports.getCoverage = getCoverage;

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _FlowServiceFactory2;

function _FlowServiceFactory() {
  return _FlowServiceFactory2 = require('./FlowServiceFactory');
}

function flowCoverageToCoverage(flowCoverage) {
  if (flowCoverage == null) {
    return null;
  }

  return {
    percentage: flowCoverage.percentage,
    uncoveredRegions: flowCoverage.uncoveredRanges.map(function (flowRange) {
      return {
        range: new (_atom2 || _atom()).Range([flowRange.start.line, flowRange.start.column], [flowRange.end.line, flowRange.end.column])
      };
    })
  };
}