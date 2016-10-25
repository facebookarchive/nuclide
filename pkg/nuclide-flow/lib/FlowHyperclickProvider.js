'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _FlowServiceFactory;

function _load_FlowServiceFactory() {
  return _FlowServiceFactory = require('./FlowServiceFactory');
}

var _goToLocation;

function _load_goToLocation() {
  return _goToLocation = require('../../commons-atom/go-to-location');
}

var _constants;

function _load_constants() {
  return _constants = require('./constants');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const JS_GRAMMARS_SET = new Set((_constants || _load_constants()).JS_GRAMMARS);let FlowHyperclickProvider = class FlowHyperclickProvider {
  getSuggestionForWord(textEditor, text, range) {
    return (0, _asyncToGenerator.default)(function* () {
      if (!JS_GRAMMARS_SET.has(textEditor.getGrammar().scopeName)) {
        return null;
      }

      const filePath = textEditor.getPath();
      if (filePath == null) {
        return null;
      }
      const position = range.start;

      const flowService = (0, (_FlowServiceFactory || _load_FlowServiceFactory()).getFlowServiceByNuclideUri)(filePath);

      if (!flowService) {
        throw new Error('Invariant violation: "flowService"');
      }

      const location = yield flowService.flowFindDefinition(filePath, textEditor.getText(), position.row + 1, position.column + 1);
      if (location) {
        return {
          range: range,
          callback: function () {
            (0, (_goToLocation || _load_goToLocation()).goToLocation)(location.file, location.point.line, location.point.column);
          }
        };
      } else {
        return null;
      }
    })();
  }
};


module.exports = FlowHyperclickProvider;