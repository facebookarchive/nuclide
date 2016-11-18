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
exports.FlowOutlineProvider = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _atom = require('atom');

var _FlowServiceFactory;

function _load_FlowServiceFactory() {
  return _FlowServiceFactory = require('./FlowServiceFactory');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let FlowOutlineProvider = exports.FlowOutlineProvider = class FlowOutlineProvider {
  getOutline(editor) {
    return (0, _asyncToGenerator.default)(function* () {
      const filePath = editor.getPath();
      let flowService;
      if (filePath != null) {
        flowService = (0, (_FlowServiceFactory || _load_FlowServiceFactory()).getFlowServiceByNuclideUri)(filePath);
      } else {
        flowService = (0, (_FlowServiceFactory || _load_FlowServiceFactory()).getLocalFlowService)();
      }

      if (!(flowService != null)) {
        throw new Error('Invariant violation: "flowService != null"');
      }

      const flowOutline = yield flowService.flowGetOutline(filePath, editor.getText());
      if (flowOutline != null) {
        return flowOutlineToNormalOutline(flowOutline);
      } else {
        return null;
      }
    })();
  }
};


function flowOutlineToNormalOutline(flowOutline) {
  return {
    outlineTrees: flowOutline.map(flowTreeToNormalTree)
  };
}

function flowTreeToNormalTree(flowTree) {
  return {
    tokenizedText: flowTree.tokenizedText,
    representativeName: flowTree.representativeName,
    startPosition: new _atom.Point(flowTree.startPosition.line, flowTree.startPosition.column),
    endPosition: new _atom.Point(flowTree.endPosition.line, flowTree.endPosition.column),
    children: flowTree.children.map(flowTreeToNormalTree)
  };
}