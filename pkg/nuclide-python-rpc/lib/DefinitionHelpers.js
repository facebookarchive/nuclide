'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getDefinition = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let getDefinition = exports.getDefinition = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (serverManager, filePath, buffer, position) {
    const wordMatch = (0, (_range || _load_range()).wordAtPositionFromBuffer)(buffer, position, WORD_REGEXP);
    if (wordMatch == null) {
      return null;
    }

    const { range } = wordMatch;

    const line = position.row;
    const column = position.column;
    const contents = buffer.getText();

    const service = yield serverManager.getJediService(filePath);
    const result = yield service.get_definitions(filePath, contents, line, column);
    if (result == null || result.length === 0) {
      return null;
    }

    const definitions = result.map(function (definition) {
      return {
        path: definition.file,
        position: new (_simpleTextBuffer || _load_simpleTextBuffer()).Point(definition.line, definition.column),
        id: definition.text,
        name: definition.text,
        language: 'python'
      };
    });

    return {
      queryRange: [range],
      definitions
    };
  });

  return function getDefinition(_x, _x2, _x3, _x4) {
    return _ref.apply(this, arguments);
  };
})();

var _simpleTextBuffer;

function _load_simpleTextBuffer() {
  return _simpleTextBuffer = require('simple-text-buffer');
}

var _range;

function _load_range() {
  return _range = require('nuclide-commons/range');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const WORD_REGEXP = /[a-zA-Z_][a-zA-Z0-9_]*/g; /**
                                                * Copyright (c) 2015-present, Facebook, Inc.
                                                * All rights reserved.
                                                *
                                                * This source code is licensed under the license found in the LICENSE file in
                                                * the root directory of this source tree.
                                                *
                                                * 
                                                * @format
                                                */