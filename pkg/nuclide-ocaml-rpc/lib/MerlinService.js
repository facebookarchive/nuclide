'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.runSingleCommand = exports.occurrences = exports.cases = exports.outline = exports.errors = exports.complete = exports.enclosingType = exports.locate = exports.pushNewBuffer = exports.pushDotMerlinPath = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

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

let pushDotMerlinPath = exports.pushDotMerlinPath = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (path) {
    const instance = yield (0, (_MerlinProcess || _load_MerlinProcess()).getInstance)(path);
    return instance ? instance.pushDotMerlinPath(path) : null;
  });

  return function pushDotMerlinPath(_x) {
    return _ref.apply(this, arguments);
  };
})();

let pushNewBuffer = exports.pushNewBuffer = (() => {
  var _ref2 = (0, _asyncToGenerator.default)(function* (name, content) {
    const instance = yield (0, (_MerlinProcess || _load_MerlinProcess()).getInstance)(name);
    return instance ? instance.pushNewBuffer(name, content) : null;
  });

  return function pushNewBuffer(_x2, _x3) {
    return _ref2.apply(this, arguments);
  };
})();

let locate = exports.locate = (() => {
  var _ref3 = (0, _asyncToGenerator.default)(function* (path, line, col, kind) {
    const instance = yield (0, (_MerlinProcess || _load_MerlinProcess()).getInstance)(path);
    return instance ? instance.locate(path, line, col, kind) : null;
  });

  return function locate(_x4, _x5, _x6, _x7) {
    return _ref3.apply(this, arguments);
  };
})();

/**
 * Returns a list of all expression around the given position.
 * Results will be ordered in increasing size (so the best guess will be first).
 */


let enclosingType = exports.enclosingType = (() => {
  var _ref4 = (0, _asyncToGenerator.default)(function* (path, line, col) {
    const instance = yield (0, (_MerlinProcess || _load_MerlinProcess()).getInstance)(path);
    return instance ? instance.enclosingType(path, line, col) : null;
  });

  return function enclosingType(_x8, _x9, _x10) {
    return _ref4.apply(this, arguments);
  };
})();

let complete = exports.complete = (() => {
  var _ref5 = (0, _asyncToGenerator.default)(function* (path, line, col, prefix) {
    const instance = yield (0, (_MerlinProcess || _load_MerlinProcess()).getInstance)(path);
    return instance ? instance.complete(path, line, col, prefix) : null;
  });

  return function complete(_x11, _x12, _x13, _x14) {
    return _ref5.apply(this, arguments);
  };
})();

let errors = exports.errors = (() => {
  var _ref6 = (0, _asyncToGenerator.default)(function* (path) {
    const instance = yield (0, (_MerlinProcess || _load_MerlinProcess()).getInstance)(path);
    return instance ? instance.errors(path) : null;
  });

  return function errors(_x15) {
    return _ref6.apply(this, arguments);
  };
})();

let outline = exports.outline = (() => {
  var _ref7 = (0, _asyncToGenerator.default)(function* (path) {
    const instance = yield (0, (_MerlinProcess || _load_MerlinProcess()).getInstance)(path);
    return instance ? instance.outline(path) : null;
  });

  return function outline(_x16) {
    return _ref7.apply(this, arguments);
  };
})();

let cases = exports.cases = (() => {
  var _ref8 = (0, _asyncToGenerator.default)(function* (path, position) {
    const instance = yield (0, (_MerlinProcess || _load_MerlinProcess()).getInstance)(path);
    if (!instance) {
      return null;
    }
    const result = yield instance.enclosingType(path, position.row, position.column);
    if (result && result[0]) {
      return instance.cases(path, result[0].start, result[0].end);
    }
    return null;
  });

  return function cases(_x17, _x18) {
    return _ref8.apply(this, arguments);
  };
})();

// This is currently unused; waiting for the refactoring front-end to finish.


let occurrences = exports.occurrences = (() => {
  var _ref9 = (0, _asyncToGenerator.default)(function* (path, position) {
    const instance = yield (0, (_MerlinProcess || _load_MerlinProcess()).getInstance)(path);
    return instance ? instance.occurrences(path, position.row, position.column) : null;
  });

  return function occurrences(_x19, _x20) {
    return _ref9.apply(this, arguments);
  };
})();

/**
 * Low-level API into merlin service useful for debugging and for prototyping
 * on top of bleeding edge Merlin branches.
 */


let runSingleCommand = exports.runSingleCommand = (() => {
  var _ref10 = (0, _asyncToGenerator.default)(function* (path, command) {
    const instance = yield (0, (_MerlinProcess || _load_MerlinProcess()).getInstance)(path);
    return instance ? instance.runSingleCommand(command, path) : null;
  });

  return function runSingleCommand(_x21, _x22) {
    return _ref10.apply(this, arguments);
  };
})();

var _MerlinProcess;

function _load_MerlinProcess() {
  return _MerlinProcess = require('./MerlinProcess');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }