'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getDefinitionPreview = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let getDefinitionPreview = exports.getDefinitionPreview = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (definition) {
    const contents = (yield (_fsPromise || _load_fsPromise()).default.readFile(definition.path)).toString();
    const lines = contents.split('\n');

    const start = definition.position.row;
    const initialIndentLevel = getIndentLevel(lines[start]);

    const buffer = [];
    for (let i = start, openParenCount = 0, closedParenCount = 0; i < start + MAX_PREVIEW_LINES && i < lines.length; i++) {
      const line = lines[i];
      const indentLevel = getIndentLevel(line);
      openParenCount += (0, (_string || _load_string()).countOccurrences)(line, '(');
      closedParenCount += (0, (_string || _load_string()).countOccurrences)(line, ')');

      buffer.push(line);

      // heuristic for the end of a function signature.
      // we've returned back to the original indentation level
      // and we have balanced pairs of parens
      if (indentLevel <= initialIndentLevel && openParenCount === closedParenCount) {
        break;
      }
    }

    return (0, (_dedent || _load_dedent()).default)(buffer.join('\n'));
  });

  return function getDefinitionPreview(_x) {
    return _ref.apply(this, arguments);
  };
})();

var _dedent;

function _load_dedent() {
  return _dedent = _interopRequireDefault(require('dedent'));
}

var _string;

function _load_string() {
  return _string = require('nuclide-commons/string');
}

var _fsPromise;

function _load_fsPromise() {
  return _fsPromise = _interopRequireDefault(require('../../commons-node/fsPromise'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

const MAX_PREVIEW_LINES = 10;

const WHITESPACE_REGEX = /^\s*/;
function getIndentLevel(line) {
  return WHITESPACE_REGEX.exec(line)[0].length;
}