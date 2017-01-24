'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FlowTypeHintProvider = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _range;

function _load_range() {
  return _range = require('../../commons-atom/range');
}

var _featureConfig;

function _load_featureConfig() {
  return _featureConfig = _interopRequireDefault(require('../../commons-atom/featureConfig'));
}

var _FlowServiceFactory;

function _load_FlowServiceFactory() {
  return _FlowServiceFactory = require('./FlowServiceFactory');
}

var _atom = require('atom');

var _nuclideFlowCommon;

function _load_nuclideFlowCommon() {
  return _nuclideFlowCommon = require('../../nuclide-flow-common');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class FlowTypeHintProvider {
  typeHint(editor, position) {
    return (0, _asyncToGenerator.default)(function* () {
      const enabled = (_featureConfig || _load_featureConfig()).default.get('nuclide-flow.enableTypeHints');
      if (!enabled) {
        return null;
      }
      const scopes = editor.scopeDescriptorForBufferPosition(position).getScopesArray();
      if (scopes.find(function (scope) {
        return scope.includes('comment');
      }) !== undefined) {
        return null;
      }
      const filePath = editor.getPath();
      if (filePath == null) {
        return null;
      }
      const contents = editor.getText();
      const flowService = yield (0, (_FlowServiceFactory || _load_FlowServiceFactory()).getFlowServiceByNuclideUri)(filePath);

      if (!flowService) {
        throw new Error('Invariant violation: "flowService"');
      }

      const type = yield flowService.flowGetType(filePath, contents, position.row, position.column);
      if (type == null) {
        return null;
      }

      // TODO(nmote) refine this regex to better capture JavaScript expressions.
      // Having this regex be not quite right is just a display issue, though --
      // it only affects the location of the tooltip.
      const word = (0, (_range || _load_range()).wordAtPosition)(editor, position, (_nuclideFlowCommon || _load_nuclideFlowCommon()).JAVASCRIPT_WORD_REGEX);
      let range;
      if (word) {
        range = word.range;
      } else {
        range = new _atom.Range(position, position);
      }
      return {
        hint: type,
        range
      };
    })();
  }
}
exports.FlowTypeHintProvider = FlowTypeHintProvider; /**
                                                      * Copyright (c) 2015-present, Facebook, Inc.
                                                      * All rights reserved.
                                                      *
                                                      * This source code is licensed under the license found in the LICENSE file in
                                                      * the root directory of this source tree.
                                                      *
                                                      * 
                                                      */