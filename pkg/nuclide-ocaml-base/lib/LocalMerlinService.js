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

var pushDotMerlinPath = _asyncToGenerator(function* (path) {
  var instance = yield (0, (_MerlinProcess2 || _MerlinProcess()).getInstance)(path);
  return instance ? instance.pushDotMerlinPath(path) : null;
});

exports.pushDotMerlinPath = pushDotMerlinPath;

var pushNewBuffer = _asyncToGenerator(function* (name, content) {
  var instance = yield (0, (_MerlinProcess2 || _MerlinProcess()).getInstance)(name);
  return instance ? instance.pushNewBuffer(name, content) : null;
});

exports.pushNewBuffer = pushNewBuffer;

var locate = _asyncToGenerator(function* (path, line, col, kind) {
  var instance = yield (0, (_MerlinProcess2 || _MerlinProcess()).getInstance)(path);
  return instance ? (yield instance.locate(path, line, col, kind)) : null;
}

/**
 * Returns a list of all expression around the given position.
 * Results will be ordered in increasing size (so the best guess will be first).
 */
);

exports.locate = locate;

var enclosingType = _asyncToGenerator(function* (path, line, col) {
  var instance = yield (0, (_MerlinProcess2 || _MerlinProcess()).getInstance)(path);
  return instance ? (yield instance.enclosingType(path, line, col)) : null;
});

exports.enclosingType = enclosingType;

var complete = _asyncToGenerator(function* (path, line, col, prefix) {
  var instance = yield (0, (_MerlinProcess2 || _MerlinProcess()).getInstance)(path);
  return instance ? instance.complete(path, line, col, prefix) : null;
});

exports.complete = complete;

var errors = _asyncToGenerator(function* (path) {
  var instance = yield (0, (_MerlinProcess2 || _MerlinProcess()).getInstance)(path);
  return instance ? instance.errors() : null;
}

/**
 * Low-level API into merlin service useful for debugging and for prototyping
 * on top of bleeding edge Merlin branches.
 */
);

exports.errors = errors;

var runSingleCommand = _asyncToGenerator(function* (path, command) {
  var instance = yield (0, (_MerlinProcess2 || _MerlinProcess()).getInstance)(path);
  return instance ? instance.runSingleCommand(command) : null;
});

exports.runSingleCommand = runSingleCommand;

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

var _MerlinProcess2;

function _MerlinProcess() {
  return _MerlinProcess2 = require('./MerlinProcess');
}

// 0-indexed
// 1-indexed