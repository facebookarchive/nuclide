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
exports.getCoverage = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let getCoverage = exports.getCoverage = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (path) {
    const flowService = yield (0, (_FlowServiceFactory || _load_FlowServiceFactory()).getFlowServiceByNuclideUri)(path);

    if (!(flowService != null)) {
      throw new Error('Invariant violation: "flowService != null"');
    }

    const flowCoverage = yield flowService.flowGetCoverage(path);
    return flowCoverageToCoverage(flowCoverage);
  });

  return function getCoverage(_x) {
    return _ref.apply(this, arguments);
  };
})();

var _atom = require('atom');

var _FlowServiceFactory;

function _load_FlowServiceFactory() {
  return _FlowServiceFactory = require('./FlowServiceFactory');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function flowCoverageToCoverage(flowCoverage) {
  if (flowCoverage == null) {
    return null;
  }

  return {
    percentage: flowCoverage.percentage,
    uncoveredRegions: flowCoverage.uncoveredRanges.map(flowRange => ({
      range: new _atom.Range([flowRange.start.line, flowRange.start.column], [flowRange.end.line, flowRange.end.column])
    }))
  };
}